import type * as CookiesEuBannerModule from "./index.global.ts";

declare global {
	// noinspection ES6ConvertVarToLetConst
	var CookiesEuBanner: typeof CookiesEuBannerModule;
}

export {};
