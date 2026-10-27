import { getProtocol } from "./getProtocol.ts";

const DEFAULT_CONSENT_COOKIE_NAME = "hasConsent";
const DEFAULT_TRACKING_COOKIE_NAMES = [
	"__utma",
	"__utmb",
	"__utmc",
	"__utmt",
	"__utmv",
	"__utmz",
	"_ga",
	"_gat",
	"_gid",
];

type HeadlessConfig = {
	/**
	 * If enabled, stores the user consent in localStorage.
	 * Default: false
	 */
	useLocalStorage?: boolean;

	/**
	 * The name of the cookie or the localStorage key.
	 * Default: "hasConsent"
	 */
	consentCookieName?: string;

	/**
	 * The timeout in milliseconds for the consent cookie.
	 * Default: 31104000000 (12 months)
	 */
	consentCookieTimeout?: number;

	/**
	 * List of tracking cookies to remove when the user rejects cookies.
	 * Default: [
	 * 	"__utma",
	 * 	"__utmb",
	 * 	"__utmc",
	 * 	"__utmt",
	 * 	"__utmv",
	 * 	"__utmz",
	 * 	"_ga",
	 * 	"_gat",
	 * 	"_gid",
	 * ]
	 */
	trackingCookieNames?: string[];

	/**
	 * A way to detect bots, crawlers, AI agents, and other non-human visitors.
	 * This prevents the banner from being shown to bots (in screenshots, etc.).
	 * Default: /bot|crawler|spider|crawling|preview|vkShare|extended|facebook|meta-/i
	 */
	botsUserAgentRegexp?: RegExp;
};

type CookiesEuBannerState = {
	mustShowBanner: boolean;
	hasConsent: boolean | undefined;
};

const createHeadlessCookiesBanner = (config: HeadlessConfig) => {
	let state: CookiesEuBannerState = {
		mustShowBanner: false,
		hasConsent: undefined,
	};
	const listeners = new Set<() => void>();
	function setState(patch: Partial<CookiesEuBannerState>) {
		let hasChanged = false;
		for (const key of Object.keys(patch) as (keyof CookiesEuBannerState)[]) {
			if (state[key] !== patch[key]) {
				hasChanged = true;
				break;
			}
		}
		if (!hasChanged) {
			return;
		}

		state = { ...state, ...patch };
		listeners.forEach((listener) => listener());
	}

	const {
		// Options
		useLocalStorage = false,
		consentCookieName = DEFAULT_CONSENT_COOKIE_NAME,
		consentCookieTimeout = 31104000000, // 12 months in milliseconds
		trackingCookieNames = DEFAULT_TRACKING_COOKIE_NAMES,
		botsUserAgentRegexp = /bot|crawler|spider|crawling|preview|vkShare|extended|facebook|meta-/i, // Includes AI bots
	} = config;

	const headlessBanner = {
		/**
		 * Retrieve the current banner state
		 */
		getState: () => {
			return state;
		},

		/**
		 * Subscribe to state change
		 * @param listener Callback
		 */
		subscribe(listener: () => void) {
			listeners.add(listener);
			return () => {
				return listeners.delete(listener);
			};
		},

		/**
		 * Do checks (bots, DoNotTrack, consent) before creating the banner
		 * Triggers `onAccept`, `onReject` or `onShowBanner` when relevant
		 */
		checkConsentAndShowBanner: () => {
			// Detect if the visitor is a bot or not
			// Prevent for search engines take the cookie alert message as main content of the page
			const isBot = botsUserAgentRegexp.test(navigator.userAgent);

			// Check if DoNotTrack is activated (Deprecated, but it's almost free to implement it)
			const hasDoNotTrackEnabled = navigator.doNotTrack === "1";

			if (isBot || hasDoNotTrackEnabled || headlessBanner.hasConsent() === false) {
				setState({
					hasConsent: false,
				});
				return;
			}

			if (headlessBanner.hasConsent() === true) {
				setState({
					hasConsent: true,
				});
				return;
			}

			// If it's not a bot, no DoNotTrack and not already accept, so show the banner
			setState({
				mustShowBanner: true,
			});
		},

		deleteTrackingCookies: () => {
			trackingCookieNames.forEach((trackingCookieName) =>
				headlessBanner.deleteCookie(trackingCookieName),
			);
		},

		/**
		 * Set consent cookie or localStorage
		 */
		setConsent: (hasConsent: boolean) => {
			if (useLocalStorage) {
				localStorage.setItem(consentCookieName, hasConsent.toString());
			} else {
				headlessBanner.setCookie(consentCookieName, hasConsent.toString());
			}

			if (!hasConsent) {
				headlessBanner.deleteTrackingCookies();
			}

			setState({
				mustShowBanner: false,
				hasConsent,
			});
		},

		resetConsent: () => {
			if (useLocalStorage) {
				localStorage.removeItem(consentCookieName);
			} else {
				headlessBanner.deleteCookie(consentCookieName);
			}

			headlessBanner.deleteTrackingCookies();

			setState({
				mustShowBanner: true,
				hasConsent: undefined,
			});
		},

		/**
		 * Check if the user already consents
		 */
		hasConsent: (): boolean | undefined => {
			const consentValue = useLocalStorage
				? localStorage.getItem(consentCookieName)
				: headlessBanner.getCookie(consentCookieName);

			switch (consentValue) {
				case "true":
					return true;
				case "false":
					return false;
				default:
					return undefined;
			}
		},

		/**
		 * Create/update cookie
		 */
		setCookie: (name: string, value: string): void => {
			const date = new Date();
			date.setTime(date.getTime() + consentCookieTimeout);

			// Allows Safari to work in http too
			const secure = getProtocol() === "https:" ? "secure;" : "";

			document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;${secure}SameSite=Lax`;
		},

		/**
		 * Get cookie value
		 */
		getCookie: (name: string): string | undefined => {
			return document.cookie
				.split(";")
				.find((row) => row.trim().startsWith(`${name}=`))
				?.split("=")[1];
		},

		/**
		 * Delete cookie by changing expire
		 */
		deleteCookie: (name: string) => {
			const hostname = document.location.hostname.replace(/^www\./, "");
			const commonSuffix = "; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/";

			document.cookie = `${name}=; domain=.${hostname}${commonSuffix}`;
			document.cookie = `${name}=${commonSuffix}`;
		},
	};

	return headlessBanner;
};

export {
	type CookiesEuBannerState,
	type HeadlessConfig,
	createHeadlessCookiesBanner,
	DEFAULT_CONSENT_COOKIE_NAME,
	DEFAULT_TRACKING_COOKIE_NAMES,
};
