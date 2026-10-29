import { ref, type Ref } from "vue";
import { createHeadlessCookiesBanner } from "cookies-eu-banner/headless";

export type CookiesBannerStore = {
	mustShowBanner: Ref<boolean>;
	hasConsent: Ref<boolean | undefined>;
	setConsent: (value: boolean) => void;
	resetConsent: () => void;
	checkConsentAndShowBanner: () => void;
};

export function createCookiesBannerStore(): CookiesBannerStore {
	const headlessCookiesBanner = createHeadlessCookiesBanner();

	const state = headlessCookiesBanner.getState();
	const mustShowBanner = ref<boolean>(state.mustShowBanner);
	const hasConsent = ref<boolean | undefined>(state.hasConsent);

	headlessCookiesBanner.subscribe(() => {
		const newState = headlessCookiesBanner.getState();
		mustShowBanner.value = newState.mustShowBanner;
		hasConsent.value = newState.hasConsent;
	});

	return {
		mustShowBanner,
		hasConsent,
		setConsent: headlessCookiesBanner.setConsent,
		resetConsent: headlessCookiesBanner.resetConsent,
		checkConsentAndShowBanner: headlessCookiesBanner.checkConsentAndShowBanner,
	};
}

let cookiesBannerStore: CookiesBannerStore;
export function useCookiesBanner() {
	cookiesBannerStore ??= createCookiesBannerStore();

	return cookiesBannerStore;
}
