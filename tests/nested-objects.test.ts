import { describe, expect, test } from "vitest"
import { generateStructureId } from "../src/index"
import {
	userJohnWithPreferences,
	userJaneWithPreferences,
	userJaneWithFontSize,
	deepNestedObject,
	deepNestedObjectAlternate,
} from "./object-definitions"

describe("Nested Objects", () => {
	test("should generate the same ID for nested objects with identical structure", () => {
		const obj1 = { ...userJohnWithPreferences }

		const obj2 = { ...userJaneWithPreferences }

		const id1 = generateStructureId(obj1)
		const id2 = generateStructureId(obj2)

		expect(id1).toBe(id2)
	})

	test("should generate different IDs for nested objects with different structures", () => {
		const obj1 = { ...userJohnWithPreferences }

		const obj2 = { ...userJaneWithFontSize }

		const id1 = generateStructureId(obj1)
		const id2 = generateStructureId(obj2)

		expect(id1).not.toBe(id2)
	})

	test("should handle deeply nested objects", () => {
		const obj1 = { ...deepNestedObject }

		const obj2 = { ...deepNestedObjectAlternate }

		const id1 = generateStructureId(obj1)
		const id2 = generateStructureId(obj2)

		expect(id1).toBe(id2)
		expect(id1.split("-").length).toBeGreaterThan(5) // Should have multiple level indicators
	})
})
