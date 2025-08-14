import { describe, expect, test } from "vitest"
import { generateStructureId } from "../src/index"
import {
	abcObject,
	cbaObject,
	dateObject1,
	dateObject2,
} from "./object-definitions"

describe("Edge Cases", () => {
	test("should handle primitive values", () => {
		expect(() => generateStructureId(42 as any)).not.toThrow()
		expect(() => generateStructureId("string" as any)).not.toThrow()
		expect(() => generateStructureId(true as any)).not.toThrow()
		expect(() => generateStructureId(null as any)).not.toThrow()
		expect(() => generateStructureId(undefined as any)).not.toThrow()
	})

	test("should handle empty objects at root level", () => {
		const emptyObj = generateStructureId({})

		// Empty objects and arrays have the same ID since they don't have any data
		expect(emptyObj).toBe("{}")
	})

	test("should handle empty arrays at root level", () => {
		const emptyArr = generateStructureId([])

		// Empty objects and arrays have the same ID since they don't have any data
		expect(emptyArr).toBe("[]")
	})

	test("should handle object property order consistently", () => {
		const obj1 = { ...abcObject }
		const obj2 = { ...cbaObject } // Different order

		const id1 = generateStructureId(obj1)
		const id2 = generateStructureId(obj2)

		expect(id1).toBe(id2)
	})

	test("should handle Date objects", () => {
		const obj1 = { ...dateObject1 }
		const obj2 = { ...dateObject2 }

		const id1 = generateStructureId(obj1)
		const id2 = generateStructureId(obj2)

		expect(id1).toBe(id2)
	})

	test("should handle large objects without stack overflow", () => {
		// Create a large nested object
		type Next = { next?: Next; value?: unknown }
		const largeObj: Next = {}
		let current = largeObj

		// Create 1000 levels of nesting
		for (let i = 0; i < 100; i++) {
			current.next = { value: i }
			current = current.next
		}

		// Should not throw a stack overflow error
		expect(() => generateStructureId(largeObj)).not.toThrow()
	})
})
