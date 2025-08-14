import { beforeEach, describe, expect, test } from 'vitest'
import {
	exportStructureState,
	GLOBAL_KEY_MAP,
	generateStructureId,
	getStructureInfo,
	getStructureSignature,
	importStructureState,
	registerStructureSignatures,
	registerStructure,
	resetState,
	STRUCTURE_HASH_COUNTER,
	setStructureIdConfig,
} from '../src/index'
import {
	coverageComplexNested,
	coverageSimpleTest,
	coverageFreshObject,
	simpleTrueObject,
	coverageTestObj1,
	coverageTestObj2,
} from './object-definitions'

describe('Structure Signature Functions', () => {
	beforeEach(() => {
		resetState()
		setStructureIdConfig({ newIdOnCollision: false })
	})

	test('should handle primitive types in getStructureSignature', () => {
		// Testing lines 324-327
		const numberSignature = getStructureSignature(42)
		const stringSignature = getStructureSignature('test')
		const booleanSignature = getStructureSignature(true)
		const nullSignature = getStructureSignature(null)
		const undefinedSignature = getStructureSignature(undefined)

		expect(numberSignature).toBe('type:number')
		expect(stringSignature).toBe('type:string')
		expect(booleanSignature).toBe('type:boolean')
		expect(nullSignature).toBe('type:object')
		expect(undefinedSignature).toBe('type:undefined')
	})

	test('should return cached signature when available', () => {
		// Testing lines 330-332
		const obj = { ...simpleTrueObject }

		// First call to cache the signature
		const signature1 = getStructureSignature(obj)

		// Second call should use the cached value
		const signature2 = getStructureSignature(obj)

		expect(signature1).toBe(signature2)
	})

	test('should generate signature from structure ID', () => {
		// Testing lines 335-342
		const obj = { ...coverageComplexNested }

		// Generate a signature
		const signature = getStructureSignature(obj)

		// Make sure it's not just the type
		expect(signature).not.toBe('type:object')

		// Should be a string containing L1, L2, etc.
		expect(signature).toContain('L1:')
		expect(signature).toContain('L2:')
		expect(signature).toContain('L3:')
	})
})

describe('Structure Registration Functions', () => {
	beforeEach(() => {
		resetState()
	})

	test('should register a structure with specific collision count', () => {
		// Testing lines 351-353
		const obj = { ...simpleTrueObject }
		const signature = getStructureSignature(obj)

		// Register with specific count
		registerStructure(obj, 42)

		// Verify the counter was set
		expect(STRUCTURE_HASH_COUNTER.get(signature)).toBe(42)
	})

	test('should register structure signatures directly', () => {
		const obj = { ...simpleTrueObject }
		const signature = getStructureSignature(obj)

		// Register signature directly
		registerStructureSignatures([{ signature: signature, count: 99 }])

		// Verify counter was set
		expect(STRUCTURE_HASH_COUNTER.get(signature)).toBe(99)

		// Generate an ID and check if it reflects the registered count
		setStructureIdConfig({ newIdOnCollision: true })
		const info = getStructureInfo(obj)
		expect(info.collisionCount).toBe(99)
		generateStructureId(obj)
		const collidedInfo = getStructureInfo(obj)
		expect(collidedInfo.collisionCount).toBe(100)
		expect(info.collisionCount).toBe(99)
	})
})

describe('Structure State Export/Import', () => {
	beforeEach(() => {
		resetState()
	})

	test('should export structure state correctly', () => {
		// Testing lines 508-523
		// Generate some state first
		const obj = { ...simpleTrueObject }
		const signature = getStructureSignature(obj)

		// Register structure to populate GLOBAL_KEY_MAP and STRUCTURE_HASH_COUNTER
		const testCount = 42
		registerStructure(obj, testCount)

		// Export the state
		const state = exportStructureState()

		// Verify state contains correct data
		expect(state).toHaveProperty('keyMap')
		expect(state).toHaveProperty('collisionCounters')

		// Verify some entries exist in the exported state
		expect(Object.entries(state.keyMap).length).toBeGreaterThan(0)

		// Verify our specific counter was exported correctly
		expect(state.collisionCounters[signature]).toBe(testCount)

		// This covers lines 508-523 by verifying that the export process works
	})

	test('should import structure state correctly', () => {
		// Testing lines 530-553
		// Create a state to import
		const stateToImport = {
			keyMap: {
				test: '1024',
				name: '2048',
			},
			collisionCounters: {
				'L1:1234-L2:5678': 15,
				'L1:8765-L2:4321': 25,
			},
		}

		// Import the state
		importStructureState(stateToImport)

		// Verify key map was imported
		expect(GLOBAL_KEY_MAP.get('test')).toBe(BigInt(1024))
		expect(GLOBAL_KEY_MAP.get('name')).toBe(BigInt(2048))

		// Verify collision counters were imported
		expect(STRUCTURE_HASH_COUNTER.get('L1:1234-L2:5678')).toBe(15)
		expect(STRUCTURE_HASH_COUNTER.get('L1:8765-L2:4321')).toBe(25)

		// Verify nextBit was updated to be larger than the max imported bit
		// We can't access nextBit directly, but we can see its effects
		const obj = { ...coverageFreshObject, newKey: true }
		generateStructureId(obj)

		// The key for "newKey" should have been assigned a bit larger than 2048
		const keyBit = GLOBAL_KEY_MAP.get('newKey')
		expect(keyBit).toBeGreaterThan(BigInt(2048))
	})
})

describe('Structure ID Edge Cases', () => {
	beforeEach(() => {
		resetState()
	})

	test('should handle edge case in getStructureInfo with new ID on collision', () => {
		// Testing line 452
		// This test specifically targets the branch where obj is not in OBJECT_ID_CACHE

		const obj = { ...simpleTrueObject }

		// Set up to trigger the specific branch in getStructureInfo
		setStructureIdConfig({ newIdOnCollision: true })

		// First call to ensure it's registered
		generateStructureId(obj)

		// Create an object that's structurally identical but not the same reference
		const similarObj = { ...simpleTrueObject, test: false }

		// This should trigger the branch where we directly call generateStructureId
		const info = getStructureInfo(similarObj)

		expect(info).toHaveProperty('id')
		expect(info).toHaveProperty('levels')
		expect(info).toHaveProperty('collisionCount')

		// The ID should reflect newIdOnCollision settings
		const directId = generateStructureId(similarObj)
		expect(info.id).toBe(directId)
	})

	test('should get structure info with no collision handling for uncached object', () => {
		// Testing specifically line 452
		// This test targets the branch in getStructureInfo where:
		// - newIdOnCollision is false
		// - the object is not in OBJECT_ID_CACHE

		resetState()
		setStructureIdConfig({ newIdOnCollision: false })

		// Step 1: Create a baseline object and get its ID to establish a pattern
		const obj1 = { ...coverageTestObj1 }
		const directId1 = generateStructureId(obj1)

		// Step 2: Create a structurally identical object with different reference
		const obj2 = { ...coverageTestObj2 }

		// Step 3: Directly get structure info for the second object - this should hit line 452
		const info = getStructureInfo(obj2)

		// Verify the line was hit by checking that:
		// 1. The structure info has an id property
		// 2. The id matches what generateStructureId would produce
		expect(info.id).toBeTruthy()

		// This should exercise line 452 - get a direct ID for comparison
		const directId2 = generateStructureId(obj2, { newIdOnCollision: false })

		// Since structure is the same, the IDs should match even with different references
		expect(info.id).toBe(directId2)

		// Extra verification: we should also match the first object's ID (structural equality)
		expect(info.id).toBe(directId1)
	})
})
