import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		name: "@synpatico/genome",
		environment: "node",
		globals: true,
	},
});
