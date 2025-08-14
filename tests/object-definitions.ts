// Central repository for test objects and arrays
// This file contains all shared test data used across multiple test files

// Simple objects
export const simpleObject = { count: 0, name: "test" }
export const shallowObject = { a: 1, b: 2 }
export const mediumNestedObject = { a: 1, b: { c: 2, d: 3 } }
export const deepNestedObject = {
	level1: {
		level2: {
			level3: {
				level4: {
					level5: { value: "deep" },
				},
			},
		},
	},
}

// Objects with arrays
export const objectWithArray = { items: [1, 2, 3] }
export const objectWithNestedArray = {
	items: [
		[1, 2],
		[3, 4],
	],
}

// Test objects for structure comparison
export const testObjectA = { a: 1, b: "test" }
export const testObjectB = { a: 2, b: "different" }
export const complexNestedObject = { complex: { nested: { value: 42 } } }

// Simple boolean objects
export const simpleTrueObject = { simple: true }
export const simpleFalseObject = { simple: false }

// Objects with single properties
export const firstPropertyObject = { first: true }
export const firstPropertyFalseObject = { first: false }
export const secondPropertyObject = { second: true }
export const secondPropertyFalseObject = { second: false }

// Array test objects
export const itemsArray123 = { items: [1, 2, 3] }
export const itemsArray456 = { items: [4, 5, 6] }
export const itemsArray1234 = { items: [1, 2, 3, 4] }
export const itemsArrayMixedTypes = { items: [1, "2", 3] }

// Objects with arrays of objects
export const usersArrayJohnJane = {
	users: [
		{ name: "John", age: 30 },
		{ name: "Jane", age: 25 },
	],
}
export const usersArrayAliceBob = {
	users: [
		{ name: "Alice", age: 35 },
		{ name: "Bob", age: 40 },
	],
}
export const usersArrayMixedStructure = {
	users: [
		{ name: "John", role: "admin" },
		{ name: "Jane", age: 25 },
	],
}

// Mixed arrays
export const mixedArray1 = { mixed: [1, "string", true, { a: 1 }] }
export const mixedArray2 = { mixed: [2, "text", false, { a: 42 }] }

// Basic objects for structure testing
export const countNameObject = { count: 0, name: "test" }
export const countNameDifferentValues = { count: 42, name: "different" }
export const countTitleObject = { count: 0, title: "test" }
export const nameCountObject = { name: "test", count: 0 }
export const countStringNameObject = { count: "0", name: "test" }

// Objects with different property orders
export const abcObject = { a: 1, b: 2, c: 3 }
export const cbaObject = { c: 3, b: 2, a: 1 }

// Nested user objects
export const userJohnWithPreferences = {
	user: {
		name: "John",
		age: 30,
		preferences: {
			theme: "dark",
			notifications: true,
		},
	},
}
export const userJaneWithPreferences = {
	user: {
		name: "Jane",
		age: 25,
		preferences: {
			theme: "light",
			notifications: false,
		},
	},
}
export const userJaneWithFontSize = {
	user: {
		name: "Jane",
		age: 25,
		preferences: {
			theme: "light",
			fontSize: 14,
		},
	},
}

// Deep nested objects with alternative values
export const deepNestedObjectAlternate = {
	level1: {
		level2: {
			level3: {
				level4: {
					level5: { value: "also deep" },
				},
			},
		},
	},
}

// Objects with dates
export const dateObject1 = { date: new Date("2023-01-01") }
export const dateObject2 = { date: new Date("2024-02-02") }

// Objects with nested arrays
export const nestedArrayObject = {
	items: [
		[1, 2],
		[3, 4],
	],
}

// Collision testing objects
export const johnObject = { name: "John", age: 30 }
export const janeObject = { name: "Jane", age: 25 }

// Simple value objects
export const value1Object = { value: 1 }
export const value2Object = { value: 2 }
export const value3Object = { value: 3 }
export const value4Object = { value: 4 }
export const value5Object = { value: 5 }

// Complex collision testing objects
export const complexUser1 = {
	user: {
		name: "User 1",
		settings: {
			theme: "dark",
			notifications: true,
		},
	},
	items: [1, 2, 3],
}
export const complexUser2 = {
	user: {
		name: "User 2",
		settings: {
			theme: "light",
			notifications: false,
		},
	},
	items: [4, 5, 6],
}

// Test boolean objects
export const testTrueObject = { test: true }
export const testFalseObject = { test: false }
export const testFirstString = { test: "first" }
export const testSecondString = { test: "second" }

// Compact test objects
export const abTestObject = { a: 1, b: "test" }
export const deeplyNestedValueObject = { deeply: { nested: { value: 1 } } }
export const arrayObject12345 = { array: [1, 2, 3, 4, 5] }
export const nestedObjectWithArray = {
	a: 1,
	b: {
		c: [1, 2, 3],
		d: { e: "test" },
	},
}

// Proxy test objects (basic target objects)
export const proxyTargetBasic = { count: 42, name: "original" }
export const proxyTargetDifferent = { count: 0, name: "different" }
export const proxyTargetAlternate = { count: 42, title: "different" }
export const valueTargetObject = { value: 42 }

// Symbol test objects
export const symbolTestObject = { normalKey: "value" }
export const symbolValueObject = { id: null, name: "test" } // Symbol will be replaced at runtime

// Custom class test objects
export const customClassWrapper = { custom: null, name: "test" } // Will be filled with custom class instances at runtime

// Inheritance test objects
export const instanceWrapper = { instance: null } // Will be filled with class instances at runtime

// Coverage test objects
export const coverageComplexNested = { complex: { nested: { value: 42 } } }
export const coverageSimpleTest = { test: true }
export const coverageFreshObject = { fresh: true }

// Edge case test objects
export const largeNestedBase = { next: undefined, value: undefined } // Will be populated dynamically

// Exotic objects test wrappers
export const exoticWrapper = { weakMap: null, weakSet: null, name: "test" } // Will be filled with exotic objects at runtime
export const typedArrayWrapper = { typedArray: null, name: "test" } // Will be filled with typed arrays at runtime
export const bufferWrapper = { buffer: null, view: null, name: "test" } // Will be filled with buffers at runtime
export const regexWrapper = { pattern: null, name: "test" } // Will be filled with regex at runtime
export const promiseWrapper = { future: null, name: "test" } // Will be filled with promises at runtime

// Complex mixed structure
export const complexMixedStructure = {
	regularKey: "value",
	mapValue: null, // Will be filled with Map
	setValue: null, // Will be filled with Set
	typedArray: null, // Will be filled with typed array
	proxyValue: null, // Will be filled with proxy
	nested: {
		inner: null, // Will be filled with Map
		dates: [], // Will be filled with dates
	},
}

// Generate structure info test objects
export const structureInfoNameValue = { name: "test", value: 42 }
export const structureInfoNameValueDifferent = { name: "another", value: 100 }
export const structureInfoShallow = { a: 1, b: 2 }
export const structureInfoUser = {
	name: "mike",
	age: 30,
}
export const structureInfoUserDifferent = {
	name: "jon",
	age: 20,
}

// Hash function test cases - these are mostly strings but some are used in arrays
export const hashTestCases = [
	{ input: "", murmur: "0", xx: "2cc5d05" },
	{ input: "hello", murmur: "248bfa47", xx: "fb0077f9" },
	{ input: "test123", murmur: "b1cde64d", xx: "ff2410ee" },
]

// Specific branch coverage test objects
export const coverageTestObj1 = { a: 1, test: true }
export const coverageTestObj2 = { a: 1, test: false }
export const branchCoverageObject = { a: 1, b: 2 }
export const uniqueTestObject = { value: "unique" } // Used for dynamic unique key generation
