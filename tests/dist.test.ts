import { expect, test, vi } from "vite-plus/test";

test.afterEach(() => {
	(globalThis as Record<string, unknown>).CookiesEuBanner = undefined;
	vi.clearAllMocks();
});

const loadGlobalScriptInPage = () => {
	// @ts-ignore
	expect(CookiesEuBanner).toBeUndefined();

	return new Promise<void>((resolve) => {
		const scriptTag = document.createElement("script");
		scriptTag.type = "text/javascript";
		scriptTag.src = "./dist/cookies-eu-banner.global.js";
		scriptTag.onload = () => resolve();
		document.body.appendChild(scriptTag);
	});
};

test.describe("cookies-eu-banner", () => {
	test("Exports createCookiesBanner", async () => {
		const cookiesEuBannerModule = await import("cookies-eu-banner");

		expect(cookiesEuBannerModule.createCookiesBanner).toBeTypeOf("function");
	});

	test("Exports DEFAULT_CONSENT_COOKIE_NAME", async () => {
		const cookiesEuBannerModule = await import("cookies-eu-banner");

		expect(cookiesEuBannerModule.DEFAULT_CONSENT_COOKIE_NAME).toBeTypeOf("string");
	});

	test("Exports DEFAULT_TRACKING_COOKIE_NAMES", async () => {
		const cookiesEuBannerModule = await import("cookies-eu-banner");

		expect(cookiesEuBannerModule.DEFAULT_TRACKING_COOKIE_NAMES).toBeTypeOf("object");
		expect(cookiesEuBannerModule.DEFAULT_TRACKING_COOKIE_NAMES.length).toBeGreaterThan(1);
		expect(cookiesEuBannerModule.DEFAULT_TRACKING_COOKIE_NAMES[0]).toBeTypeOf("string");
	});
});

test.describe("cookies-eu-banner/headless", () => {
	test("Exports createHeadlessCookiesBanner", async () => {
		const cookiesEuBannerModule = await import("cookies-eu-banner/headless");

		expect(cookiesEuBannerModule.createHeadlessCookiesBanner).toBeTypeOf("function");
	});

	test("Exports DEFAULT_CONSENT_COOKIE_NAME", async () => {
		const cookiesEuBannerModule = await import("cookies-eu-banner/headless");

		expect(cookiesEuBannerModule.DEFAULT_CONSENT_COOKIE_NAME).toBeTypeOf("string");
	});

	test("Exports DEFAULT_TRACKING_COOKIE_NAMES", async () => {
		const cookiesEuBannerModule = await import("cookies-eu-banner/headless");

		expect(cookiesEuBannerModule.DEFAULT_TRACKING_COOKIE_NAMES).toBeTypeOf("object");
		expect(cookiesEuBannerModule.DEFAULT_TRACKING_COOKIE_NAMES.length).toBeGreaterThan(1);
		expect(cookiesEuBannerModule.DEFAULT_TRACKING_COOKIE_NAMES[0]).toBeTypeOf("string");
	});
});

test.describe("cookies-eu-banner.global", () => {
	test("Registers CookiesEuBanner on globalThis", async () => {
		await loadGlobalScriptInPage();

		// @ts-ignore
		expect(CookiesEuBanner).toBeDefined();
	});

	test("Exposes CookiesEuBanner.createCookiesBanner", async () => {
		await loadGlobalScriptInPage();

		// @ts-ignore
		expect(CookiesEuBanner.createCookiesBanner).toBeTypeOf("function");
	});

	test("Exposes CookiesEuBanner.createHeadlessCookiesBanner", async () => {
		await loadGlobalScriptInPage();

		// @ts-ignore
		expect(CookiesEuBanner.createHeadlessCookiesBanner).toBeTypeOf("function");
	});

	test("Exposes CookiesEuBanner.DEFAULT_CONSENT_COOKIE_NAME", async () => {
		await loadGlobalScriptInPage();

		// @ts-ignore
		expect(CookiesEuBanner.DEFAULT_CONSENT_COOKIE_NAME).toBeTypeOf("string");
	});

	test("Exposes CookiesEuBanner.DEFAULT_TRACKING_COOKIE_NAMES", async () => {
		await loadGlobalScriptInPage();

		// @ts-ignore
		expect(CookiesEuBanner.DEFAULT_TRACKING_COOKIE_NAMES).toBeTypeOf("object");
		// @ts-ignore
		expect(CookiesEuBanner.DEFAULT_TRACKING_COOKIE_NAMES.length).toBeGreaterThan(1);
		// @ts-ignore
		expect(CookiesEuBanner.DEFAULT_TRACKING_COOKIE_NAMES[0]).toBeTypeOf("string");
	});
});
