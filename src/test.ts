import { generateStructureId } from "./index"

const obj = {
	users: [
		{ id: 1, name: "John", email: "john@example.com" },
		{ id: 2, name: "Jane", email: "jane@example.com" },
	],
}
const id = generateStructureId(obj)

console.log(id)
