import path from "node:path";

import mdx from "@astrojs/mdx";
import { defineConfig, fontProviders } from "astro/config";

import { WEBSITE_DOMAIN } from "./configConsts.mjs";

export default defineConfig({
	integrations: [mdx()],

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
					{
						src: [
							path.join(
								import.meta.url,
								"../src/assets/fonts/jetbrains-mono/JetBrainsMono-ExtraBold.woff2",
							),
						],
						weight: 800,
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

	markdown: {
		shikiConfig: {
			theme: "css-variables",
		},
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
