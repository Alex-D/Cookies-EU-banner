import { defineConfig } from "vite-plus";

const OUTPUT_BASE_FILE_NAME = "cookies-eu-banner";

export default defineConfig({
	pack: [
		{
			entry: {
				[OUTPUT_BASE_FILE_NAME]: `src/index.ts`,
			},
			platform: "browser",
		},

		{
			entry: {
				[`${OUTPUT_BASE_FILE_NAME}.headless`]: `src/headless.ts`,
			},
			platform: "browser",
		},

		{
			entry: {
				[OUTPUT_BASE_FILE_NAME]: `src/index.umd.ts`,
			},
			minify: true,
			dts: false,
			platform: "browser",
			format: "umd",
			outputOptions: {
				name: "CookiesEuBanner",
			},
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
