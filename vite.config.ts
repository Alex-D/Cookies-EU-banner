import { defineConfig } from "vite-plus";

export default defineConfig({
	pack: [
		{
			entry: {
				"cookies-eu-banner": "src/index.ts",
			},
			platform: "browser",
			format: "esm",
		},
		{
			entry: {
				"cookies-eu-banner.min": "src/index.ts",
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
