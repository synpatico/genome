/**
 * @fileoverview Deterministic structure ID generation for JavaScript objects using hierarchical hashing and collision-resistant algorithms
 * @module @synpatico/genome
 */

import { hash, xxHash32 } from "./hash"

/**
 * Bit flags for different JavaScript types used in structure hashing
 * @private
 */
const TYPE_BITS: Record<string, bigint> = {
	root: BigInt(0),
	number: BigInt(1),
	string: BigInt(2),
	boolean: BigInt(4),
	bigint: BigInt(8),
	null: BigInt(16),
	undefined: BigInt(32),
	symbol: BigInt(64),
	object: BigInt(128),
	array: BigInt(256),
}

/**
 * Global cache of property names to their deterministic hash values.
 * Used to ensure consistent bit generation across different executions.
 */
export const GLOBAL_KEY_MAP = new Map<string, bigint>()

/**
 * Tracks collision counts for structure signatures to handle hash conflicts.
 * Maps structure signatures to their collision counter values.
 */
export const STRUCTURE_HASH_COUNTER = new Map<string, number>()

/**
 * WeakMap cache for object-to-structure-ID mappings.
 * Automatically garbage collected when objects are no longer referenced.
 */
export let OBJECT_ID_CACHE = new WeakMap<object, string>()

/**
 * WeakMap cache for object-to-signature mappings.
 * Stores the signature portion (excluding L0 level) for collision detection.
 */
export let OBJECT_SIGNATURE_CACHE = new WeakMap<object, string>()

/**
 * WeakMap cache for complete structure information including metadata.
 * Stores comprehensive structure analysis results for performance optimization.
 */
export let STRUCTURE_INFO_CACHE = new WeakMap<
	object,
	{
		id: string
		levels: number
		collisionCount: number
	}
>()

/**
 * Type guard to check if a value is a plain object (not array, null, or primitive)
 * @param x - The value to check
 * @returns True if the value is a plain object
 * @private
 */
const isObject = (x: unknown): x is object =>
	typeof x === "object" && x !== null && !Array.isArray(x)

/**
 * Gets or creates a deterministic bit value for a given key using xxHash32.
 * Caches results in GLOBAL_KEY_MAP for consistent hashing across calls.
 * @param key - The string key to hash
 * @returns A deterministic bigint hash value
 * @private
 */
const getBit = (key: string): bigint => {
	if (!GLOBAL_KEY_MAP.has(key)) {
		const hashResult = xxHash32(key)
		const deterministicBit = BigInt(`0x${hashResult}`)
		GLOBAL_KEY_MAP.set(key, deterministicBit)
	}
	return GLOBAL_KEY_MAP.get(key) as bigint
}

/**
 * Configuration options for structure ID generation
 */
export interface StructureIdConfig {
	/** Whether to generate new IDs on collision (default: false) */
	newIdOnCollision?: boolean
}

/**
 * Global configuration for structure ID generation
 * @private
 */
let globalConfig: StructureIdConfig = {
	newIdOnCollision: false,
}

/**
 * Sets the global configuration for structure ID generation
 * @param config - The configuration options to apply
 * @example
 * ```javascript
 * setStructureIdConfig({ newIdOnCollision: true });
 * ```
 */
export function setStructureIdConfig(config: StructureIdConfig): void {
	globalConfig = { ...config }
}

/**
 * Gets the current global configuration for structure ID generation
 * @returns A copy of the current configuration
 */
export function getStructureIdConfig(): StructureIdConfig {
	return { ...globalConfig }
}

/**
 * Generates a unique, deterministic structure ID for any JavaScript value.
 * The ID captures the complete shape and type information hierarchically.
 * 
 * @param obj - The value to generate a structure ID for
 * @param config - Optional configuration to override global settings
 * @returns A hierarchical structure ID in format "L0:hash-L1:hash-L2:hash..."
 * 
 * @example
 * ```javascript
 * const obj = { users: [{ id: 1, name: "John" }] };
 * const id = generateStructureId(obj);
 * // Returns: "L0:384729-L1:8374629-L2:9283746"
 * ```
 * 
 * @example
 * ```javascript
 * // Empty objects and arrays have special IDs
 * generateStructureId({});  // Returns: "{}"
 * generateStructureId([]);  // Returns: "[]"
 * ```
 */
export const generateStructureId = (obj: unknown, config?: StructureIdConfig): string => {
	const emptyObj = isObject(obj) && Object.keys(obj).length === 0
	const emptyArr = Array.isArray(obj) && (obj as unknown[]).length === 0

	if (emptyObj) return "{}"
	if (emptyArr) return "[]"

	const effectiveConfig = config || globalConfig

	if (typeof obj !== "object" || obj === null) {
		return `L0:${TYPE_BITS[typeof obj] || BigInt(0)}-L1:${TYPE_BITS[typeof obj] || BigInt(0)}`
	}

	if (!effectiveConfig?.newIdOnCollision && OBJECT_ID_CACHE.has(obj)) {
		return OBJECT_ID_CACHE.get(obj) as string
	}

	const objectMap = new Map<object, string>()

	const levelHashes: Record<number, bigint> = {}

	/**
	 * Determines the type of a value for structure analysis
	 * @param value - The value to check
	 * @returns Type string: "null", "undefined", "array", or typeof result
	 * @private
	 */
	const getType = (value: unknown): string => {
		if (value === null) return "null"
		if (value === undefined) return "undefined"
		if (Array.isArray(value)) return "array"
		return typeof value
	}

	/**
	 * Creates a unique signature for an object based on its path and structure
	 * @param obj - The object or array to generate a signature for
	 * @param path - The current path to this object in the structure
	 * @returns A string signature like "user.address.{street,city}" or "items.[3]"
	 * @private
	 */
	const getObjectSignature = (obj: object, path: string[]): string => {
		const type = Array.isArray(obj) ? "array" : "object"

		if (type === "object") {
			const keys = Object.keys(obj).sort().join(",")
			return `${path.join(".")}.{${keys}}`
		}

		return `${path.join(".")}.[${(obj as unknown[]).length}]`
	}

	/**
	 * Recursively processes object structure to build hierarchical hash levels
	 * @param value - The value to process
	 * @param level - Current depth level in the object hierarchy
	 * @param path - Current path to this value
	 * @private
	 */
	const processStructure = (value: unknown, level = 0, path: string[] = []): void => {
		if (!levelHashes[level]) {
			levelHashes[level] = BigInt(1)<< BigInt(level)
		}

		const type = getType(value)

		levelHashes[level] += TYPE_BITS[type] || BigInt(0)

		if (type !== "object" && type !== "array") {
			return
		}

		if (isObject(value) || Array.isArray(value)) {
			const objValue = value as object
			const objSig = getObjectSignature(objValue, path)

			if (objectMap.has(objValue)) {
				const circularPath = objectMap.get(objValue)
				levelHashes[level] += getBit(`circular:${circularPath}`)
				return
			}

			objectMap.set(objValue, objSig)

			const objTypeBit = getBit(`type:${type}`)
			levelHashes[level] += objTypeBit

			const isRootLevel = level === 0
			const isEmpty =
				(isObject(value) && Object.keys(value as object).length === 0) ||
				(Array.isArray(value) && (value as unknown[]).length === 0)

			if (!isRootLevel || !isEmpty) {
				if (type === "object") {
					const objValue = value as Record<string, unknown>

					const keys = Object.keys(objValue).sort()

					let multiplier = BigInt(1)
					for (const key of keys) {
						const propType = getType(objValue[key])
						const keyBit = getBit(key)
						levelHashes[level] += keyBit * multiplier

						levelHashes[level] += (TYPE_BITS[propType] || BigInt(0))* multiplier

						multiplier++

						processStructure(objValue[key], level + 1, [...path, key])
					}
				} else if (type === "array") {
					const arrayValue = value as unknown[]

					const lengthBit = getBit(`length:${arrayValue.length}`)
					levelHashes[level] += lengthBit

					let multiplier = BigInt(1)
					for (let i = 0; i < arrayValue.length; i++) {
						const itemType = getType(arrayValue[i])
						const indexBit = getBit(`[${i}]`)
						levelHashes[level] += indexBit * multiplier

						levelHashes[level] += (TYPE_BITS[itemType] || BigInt(0)) * multiplier

						multiplier++

						processStructure(arrayValue[i], level + 1, [...path, `[${i}]`])
					}
				}
			}
		}
	}

	processStructure(obj)

	const structureLevels = Object.entries(levelHashes)
		.filter(([level]) => Number(level) > 0)
		.sort(([a], [b]) => Number(a) - Number(b))
		.map(([level, hash]) => `L${level}:${hash}`)

	const structureSignature = structureLevels.join("-")

	if (typeof obj === "object" && obj !== null) {
		OBJECT_SIGNATURE_CACHE.set(obj, structureSignature)
	}

	const currentCount = STRUCTURE_HASH_COUNTER.get(structureSignature) ?? 0

	if (effectiveConfig?.newIdOnCollision) {
		levelHashes[0] = BigInt(currentCount)

		STRUCTURE_HASH_COUNTER.set(structureSignature, currentCount + 1)
	}

	const idParts = Object.entries(levelHashes)
		.sort(([a], [b]) => Number(a) - Number(b))
		.map(([level, hash]) => `L${level}:${hash}`)

	const finalId = idParts.join("-")

	if (!effectiveConfig?.newIdOnCollision && typeof obj === "object" && obj !== null) {
		OBJECT_ID_CACHE.set(obj, finalId)
	}

	if (typeof obj === "object" && obj !== null && STRUCTURE_INFO_CACHE.has(obj)) {
		STRUCTURE_INFO_CACHE.delete(obj)
	}

	return finalId
}

/**
 * Calculates the number of hierarchy levels in a structure ID
 * @param id - The structure ID to analyze
 * @returns The number of levels (depth) in the ID
 * @private
 */
function calculateIdLevels(id: string): number {
	return id.split("-").length
}

/**
 * Gets the structure signature (without L0 collision counter) for an object.
 * This signature represents the object's shape and is used for collision detection.
 * 
 * @param obj - The object to get a signature for
 * @returns A signature string like "L1:hash-L2:hash" or "type:primitive" for primitives
 * 
 * @example
 * ```javascript
 * const sig1 = getStructureSignature({ id: 1, name: "John" });
 * const sig2 = getStructureSignature({ id: 2, name: "Jane" });
 * console.log(sig1 === sig2); // true (same structure)
 * ```
 */
export function getStructureSignature(obj: unknown): string {
	if (typeof obj !== "object" || obj === null) {
		return `type:${typeof obj}`
	}

	if (OBJECT_SIGNATURE_CACHE.has(obj)) {
		return OBJECT_SIGNATURE_CACHE.get(obj) as string
	}

	const tempId = generateStructureId(obj, { newIdOnCollision: false })
	const signature = tempId.split("-").slice(1).join("-")

	OBJECT_SIGNATURE_CACHE.set(obj, signature)

	return signature
}

/**
 * Registers a structure with a specific collision count.
 * Used to pre-populate collision counters for known structures.
 * 
 * @param obj - The object whose structure to register
 * @param collisionCount - The collision count to set for this structure
 * 
 * @example
 * ```javascript
 * const template = { id: 0, name: "" };
 * registerStructure(template, 5); // Pre-register with collision count 5
 * ```
 */
export function registerStructure(obj: unknown, collisionCount: number): void {
	const signature = getStructureSignature(obj)
	STRUCTURE_HASH_COUNTER.set(signature, collisionCount)
}

/**
 * Batch registers multiple structures with their collision counts.
 * Useful for pre-populating the collision counter from saved state.
 * 
 * @param registrations - Array of structure-count pairs to register
 * 
 * @example
 * ```javascript
 * registerStructures([
 *   { structure: { id: 0 }, count: 3 },
 *   { structure: { name: "" }, count: 1 }
 * ]);
 * ```
 */
export function registerStructures(
	registrations: Array<{
		structure: unknown
		count: number
	}>,
): void {
	for (const { structure, count } of registrations) {
		registerStructure(structure, count)
	}
}

/**
 * Structure registration data for importing/exporting collision state
 */
export interface StructureRegistration {
	/** The structure signature (without L0) */
	signature: string
	/** The collision counter value */
	count: number
}

/**
 * Registers structure signatures directly without needing object instances.
 * Useful for importing collision state from external sources.
 * 
 * @param signatures - Array of signature-count pairs to register
 * 
 * @example
 * ```javascript
 * registerStructureSignatures([
 *   { signature: "L1:123-L2:456", count: 2 },
 *   { signature: "L1:789-L2:012", count: 0 }
 * ]);
 * ```
 */
export function registerStructureSignatures(signatures: Array<StructureRegistration>): void {
	for (const { signature, count } of signatures) {
		STRUCTURE_HASH_COUNTER.set(signature, count)
	}
}

/**
 * Gets comprehensive structure information including ID, depth levels, and collision count.
 * Caches results for performance optimization.
 * 
 * @param obj - The object to analyze
 * @param config - Optional configuration to override global settings
 * @returns Structure information object
 * 
 * @example
 * ```javascript
 * const info = getStructureInfo({ users: [{ id: 1, name: "John" }] });
 * console.log(info);
 * // {
 * //   id: "L0:384729-L1:8374629-L2:9283746",
 * //   levels: 3,
 * //   collisionCount: 0
 * // }
 * ```
 */
export function getStructureInfo(
	obj: unknown,
	config?: StructureIdConfig,
): {
	id: string
	levels: number
	collisionCount: number
} {
	const effectiveConfig = config || globalConfig

	if (typeof obj !== "object" || obj === null) {
		const id = generateStructureId(obj, { newIdOnCollision: false })
		return {
			id,
			levels: calculateIdLevels(id),
			collisionCount: 0,
		}
	}

	if (STRUCTURE_INFO_CACHE.has(obj)) {
		return STRUCTURE_INFO_CACHE.get(obj) as {
			id: string
			levels: number
			collisionCount: number
		}
	}

	const structureSignature = OBJECT_SIGNATURE_CACHE.has(obj)
		? (OBJECT_SIGNATURE_CACHE.get(obj) as string)
		: generateStructureId(obj, { newIdOnCollision: false }).split("-").slice(1).join("-")

	const collisionCount = STRUCTURE_HASH_COUNTER.get(structureSignature) || 0

	let id: string
	if (effectiveConfig.newIdOnCollision) {
		const l0Hash = BigInt(collisionCount)
		const l0Part = `L0:${l0Hash}`
		id = [l0Part, structureSignature].join("-")
	} else {
		id = OBJECT_ID_CACHE.has(obj)
			? (OBJECT_ID_CACHE.get(obj) as string)
			: generateStructureId(obj, { newIdOnCollision: false })
	}

	const levels = calculateIdLevels(id)

	const result = {
		id,
		levels,
		collisionCount,
	}

	STRUCTURE_INFO_CACHE.set(obj, result)

	return result
}

/**
 * Resets all global state including caches and collision counters.
 * Useful for testing or when you need to start fresh.
 * 
 * @example
 * ```javascript
 * resetState(); // Clear all caches and counters
 * ```
 */
export function resetState(): void {
	GLOBAL_KEY_MAP.clear()
	STRUCTURE_HASH_COUNTER.clear()

	OBJECT_ID_CACHE = new WeakMap<object, string>()
	OBJECT_SIGNATURE_CACHE = new WeakMap<object, string>()
	STRUCTURE_INFO_CACHE = new WeakMap<
		object,
		{
			id: string
			levels: number
			collisionCount: number
		}
	>()
}

/**
 * Serializable state of the structure ID system
 */
export interface StructureState {
	/** Map of keys to their hash values */
	keyMap: Record<string, string>
	/** Map of structure signatures to collision counts */
	collisionCounters: Record<string, number>
}

/**
 * Exports the current state of the structure ID system.
 * Useful for persisting state across sessions or sharing between environments.
 * 
 * @returns The current state including key mappings and collision counters
 * 
 * @example
 * ```javascript
 * const state = exportStructureState();
 * localStorage.setItem('genomeState', JSON.stringify(state));
 * ```
 */
export function exportStructureState(): StructureState {
	const keyMap: Record<string, string> = {}
	for (const [key, value] of GLOBAL_KEY_MAP.entries()) {
		keyMap[key] = value.toString()
	}

	const collisionCounters: Record<string, number> = {}
	for (const [signature, count] of STRUCTURE_HASH_COUNTER.entries()) {
		collisionCounters[signature] = count
	}

	return {
		keyMap,
		collisionCounters,
	}
}

/**
 * Imports a previously exported structure state.
 * Resets current state before importing to ensure clean slate.
 * 
 * @param state - The state to import
 * 
 * @example
 * ```javascript
 * const savedState = JSON.parse(localStorage.getItem('genomeState'));
 * importStructureState(savedState);
 * ```
 */
export function importStructureState(state: StructureState): void {
	resetState()

	for (const [key, valueStr] of Object.entries(state.keyMap)) {
		GLOBAL_KEY_MAP.set(key, BigInt(valueStr))
	}

	for (const [signature, count] of Object.entries(state.collisionCounters)) {
		STRUCTURE_HASH_COUNTER.set(signature, count)
	}

	let maxBit = BigInt(0)
	for (const bitStr of Object.values(state.keyMap)) {
		const bit = BigInt(bitStr)
		if (bit > maxBit) {
			maxBit = bit
		}
	}
}

/**
 * Generates a compact, fixed-length structure ID using SHA-256 hashing.
 * Useful when you need consistent-length IDs regardless of object depth.
 * 
 * @param obj - The object to generate a compact ID for
 * @param config - Optional configuration to override global settings
 * @returns A 64-character hexadecimal hash string
 * 
 * @example
 * ```javascript
 * const compactId = getCompactId({ users: [{ id: 1, name: "John" }] });
 * console.log(compactId); // "a3f2b8c9d4e5f6a7b8c9d0e1f2a3b4c5..."
 * ```
 */
export const getCompactId = (obj: unknown, config?: StructureIdConfig): string => {
	const fullId = generateStructureId(obj, config)

	return hash(fullId)
}

/**
 * Gets structure information with a compact ID format.
 * Combines the comprehensive analysis of getStructureInfo with compact ID generation.
 * 
 * @param obj - The object to analyze
 * @param config - Optional configuration to override global settings
 * @returns Structure info with compact hash ID
 * 
 * @example
 * ```javascript
 * const info = getCompactInfo({ users: [] });
 * console.log(info);
 * // {
 * //   id: "a3f2b8c9d4e5f6a7b8c9d0e1f2a3b4c5...",
 * //   levels: 2,
 * //   collisionCount: 0
 * // }
 * ```
 */
export const getCompactInfo = (
	obj: unknown,
	config?: StructureIdConfig,
): {
	id: string
	levels: number
	collisionCount: number
} => {
	const info = getStructureInfo(obj, config)

	info.id = hash(info.id)

	return info
}
