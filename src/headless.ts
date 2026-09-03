type HeadlessOptions = {
	/**
	 * In enabled, stores the user consent in localStorage.
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

type HeadlessConfig = {
	/**
	 * Called when the banner should be shown.
	 * Visitor is not a bot, and has not made a choice yet.
	 */
	onShowBanner: () => void;

	/**
	 * Called when the user has already made a choice or is a bot.
	 * The callback should remove the banner from the DOM.
	 */
	onRemoveBanner: () => void;

	/**
	 * Callback called when this user accepts or has already accepted.
	 * This is where you launch your tracking scripts.
	 */
	onAccept: () => void;

	/**
	 * Callback called when this user rejects or has already rejected.
	 */
	onReject: () => void;
} & HeadlessOptions;

const createHeadlessCookiesBanner = function (config: HeadlessConfig) {
	const {
		// Hooks
		onShowBanner,
		onRemoveBanner,
		onAccept,
		onReject,

		// Options
		useLocalStorage = false,
		consentCookieName = "hasConsent",
		consentCookieTimeout = 31104000000, // 12 months in milliseconds
		trackingCookieNames = [
			"__utma",
			"__utmb",
			"__utmc",
			"__utmt",
			"__utmv",
			"__utmz",
			"_ga",
			"_gat",
			"_gid",
		],
		botsUserAgentRegexp = /bot|crawler|spider|crawling|preview|vkShare|extended|facebook|meta-/i, // Includes AI bots
	} = config;

	const headlessBanner = {
		/**
		 * Set consent cookie or localStorage
		 */
		setConsent: function (hasConsent: boolean) {
			if (useLocalStorage) {
				localStorage.setItem(consentCookieName, hasConsent.toString());
			} else {
				headlessBanner.setCookie(consentCookieName, hasConsent.toString());
			}

			if (hasConsent === true) {
				onAccept();
			} else {
				// Delete existing tracking cookies
				trackingCookieNames.forEach((trackingCookieName) =>
					headlessBanner.deleteCookie(trackingCookieName),
				);

				onReject();
			}
		},

		/**
		 * Check if the user already consents
		 */
		hasConsent: function () {
			switch (headlessBanner.getCookie(consentCookieName)) {
				case "true":
					return true;
				case "false":
					return false;
				default:
					return null;
			}
		},

		/**
		 * Create/update cookie
		 */
		setCookie: function (name: string, value: string): void {
			const date = new Date();
			date.setTime(date.getTime() + consentCookieTimeout);

			// Allows Safari to work in http too
			const secure = document.location.protocol === "https:" ? "secure;" : "";

			document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/${secure};SameSite=Lax`;
		},

		/**
		 * Get cookie value
		 */
		getCookie: function (name: string): string | undefined {
			return document.cookie
				.split(";")
				.find((row) => row.trim().startsWith(`${name}=`))
				?.split("=")[1];
		},

		/**
		 * Delete cookie by changing expire
		 */
		deleteCookie: function (name: string) {
			const hostname = document.location.hostname.replace(/^www\./, "");
			const commonSuffix = "; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/";

			document.cookie = `${name}=; domain=.${hostname}${commonSuffix}`;
			document.cookie = `${name}=${commonSuffix}`;
		},
	};

	// Init
	(function () {
		// Detect if the visitor is a bot or not
		// Prevent for search engines take the cookie alert message as main content of the page
		const isBot = botsUserAgentRegexp.test(navigator.userAgent);

		// Check if DoNotTrack is activated (Deprecated, but it's almost free to implement it)
		const hasDoNotTrackEnabled = navigator.doNotTrack === "1";

		// Do nothing if it is a bot
		// If DoNotTrack is activated, do nothing too
		if (isBot || hasDoNotTrackEnabled || headlessBanner.hasConsent() === false) {
			onRemoveBanner();
			return;
		}

		// User has already consented to use cookies to tracking
		if (headlessBanner.hasConsent() === true) {
			// Launch user custom function
			onAccept();
			return;
		}

		// If it's not a bot, no DoNotTrack and not already accept, so show the banner
		onShowBanner();
	})();

	return headlessBanner;
};

export { type HeadlessConfig, type HeadlessOptions, createHeadlessCookiesBanner };
