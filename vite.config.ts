import { defineConfig, defaultExclude } from "vite-plus";
import { playwright } from "vite-plus/test/browser-playwright";

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
				[OUTPUT_BASE_FILE_NAME]: `src/index.global.ts`,
			},
			minify: true,
			dts: true,
			platform: "browser",
			format: "iife",
			globalName: "CookiesEuBanner",
			outputOptions: {
				entryFileNames: "[name].global.js",
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
	test: {
		browser: {
			enabled: true,
			headless: true,
			screenshotFailures: false,
			provider: playwright(),
			instances: [{ browser: "chromium" }, { browser: "firefox" }, { browser: "webkit" }],
		},
		include: ["tests/**/*.test.ts"],
		exclude: [...defaultExclude, "tests/dist.test.ts"],
		coverage: {
			provider: "istanbul",
			thresholds: {
				100: true,
			},
			include: ["src/**/*.ts"],
		},
	},
	run: {
		tasks: {
			"test:dist": {
				command: "vp test --config vite.dist.config.ts",
				dependsOn: ["build"],
			},
		},
	},
});
