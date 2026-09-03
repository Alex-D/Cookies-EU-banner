import { defineConfig } from "vite-plus";

const OUTPUT_BASE_FILE_NAME = "cookies-eu-banner";

export default defineConfig({
	pack: [
		// index
		{
			entry: {
				[`${OUTPUT_BASE_FILE_NAME}`]: `src/index.ts`,
			},
			platform: "browser",
			format: "esm",
		},
		{
			entry: {
				[`${OUTPUT_BASE_FILE_NAME}.min`]: `src/index.ts`,
			},
			minify: true,
			dts: false,
			platform: "browser",
			format: "esm",
		},

		// headless
		{
			entry: {
				[`${OUTPUT_BASE_FILE_NAME}.headless`]: `src/headless.ts`,
			},
			platform: "browser",
			format: "esm",
		},
		{
			entry: {
				[`${OUTPUT_BASE_FILE_NAME}.headless.min`]: `src/headless.ts`,
			},
			minify: true,
			dts: false,
			platform: "browser",
			format: "esm",
		},
	],
	staged: {
		"*": "vp check --fix",
	},
	lint: {
		jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
		rules: { "vite-plus/prefer-vite-plus-imports": "error" },
		options: { typeAware: true, typeCheck: true },
	},
});
