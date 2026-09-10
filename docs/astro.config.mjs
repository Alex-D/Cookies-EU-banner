import path from "node:path";

import { defineConfig, fontProviders } from "astro/config";

import { WEBSITE_DOMAIN } from "./configConsts.mjs";

export default defineConfig({
	fonts: [
		{
			provider: fontProviders.local(),
			name: "Uni Neue",
			cssVariable: "--font-uni-neue",
			fallbacks: ["sans-serif"],
			options: {
				variants: [
					{
						src: [path.join(import.meta.url, "../src/assets/fonts/uni-neue/UniNeueHeavy.woff2")],
						weight: 800,
						style: "normal",
					},
				],
			},
		},
		{
			provider: fontProviders.local(),
			name: "JetBrains Mono",
			cssVariable: "--font-jetbrains-mono",
			fallbacks: ["monospace"],
			options: {
				variants: [
					{
						src: [
							path.join(
								import.meta.url,
								"../src/assets/fonts/jetbrains-mono/JetBrainsMono-Regular.woff2",
							),
						],
						weight: "normal",
						style: "normal",
					},
				],
			},
		},
		{
			provider: fontProviders.local(),
			name: "Nexa Text",
			cssVariable: "--font-nexa-text",
			fallbacks: ["sans-serif"],
			options: {
				variants: [
					{
						src: [
							path.join(import.meta.url, "../src/assets/fonts/nexa-text/NexaTextRegular.woff2"),
						],
						weight: "normal",
						style: "normal",
					},
				],
			},
		},
	],

	server: {
		port: 8080,
		allowedHosts: ["localhost", WEBSITE_DOMAIN],
	},

	build: {
		assets: "assets",
	},

	vite: {
		css: {
			preprocessorOptions: {
				scss: {
					silenceDeprecations: ["global-builtin"],
				},
			},
		},
	},

	site: `https://${WEBSITE_DOMAIN}`,
	base: "/Cookies-EU-banner/",
	trailingSlash: "always",
});
