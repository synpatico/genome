import { describe, expect, test } from "vitest"
import { generateStructureId } from "../src/index"
import {
	itemsArray123,
	itemsArray456,
	itemsArray1234,
	itemsArrayMixedTypes,
	usersArrayJohnJane,
	usersArrayAliceBob,
	usersArrayMixedStructure,
	mixedArray1,
	mixedArray2,
} from "./object-definitions"

describe("Arrays", () => {
	test("should generate the same ID for arrays with the same structure", () => {
		const obj1 = { ...itemsArray123 }
		const obj2 = { ...itemsArray456 }

		const id1 = generateStructureId(obj1)
		const id2 = generateStructureId(obj2)

		expect(id1).toBe(id2)
	})

	test("should generate different IDs for arrays with different lengths", () => {
		const obj1 = { ...itemsArray123 }
		const obj2 = { ...itemsArray1234 }

		const id1 = generateStructureId(obj1)
		const id2 = generateStructureId(obj2)

		expect(id1).not.toBe(id2)
	})

	test("should generate different IDs for arrays with different element types", () => {
		const obj1 = { ...itemsArray123 }
		const obj2 = { ...itemsArrayMixedTypes } // second element is a string

		const id1 = generateStructureId(obj1)
		const id2 = generateStructureId(obj2)

		expect(id1).not.toBe(id2)
	})

	test("should handle arrays of objects correctly", () => {
		const obj1 = { ...usersArrayJohnJane }

		const obj2 = { ...usersArrayAliceBob }

		const id1 = generateStructureId(obj1)
		const id2 = generateStructureId(obj2)

		expect(id1).toBe(id2)

		// Different structure in array elements
		const obj3 = { ...usersArrayMixedStructure }

		const id3 = generateStructureId(obj3)
		expect(id1).not.toBe(id3)
	})

	test("should handle mixed arrays", () => {
		const obj1 = { ...mixedArray1 }
		const obj2 = { ...mixedArray2 }

		const id1 = generateStructureId(obj1)
		const id2 = generateStructureId(obj2)

		expect(id1).toBe(id2)
	})
})
