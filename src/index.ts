const createCookiesBanner = function (config: {
	// HTML Elements
	bannerElement?: HTMLElement;
	acceptButtonElement?: HTMLElement;
	rejectButtonElement?: HTMLElement;
	moreLinkElement?: HTMLElement;

	// Hooks
	onAccept: () => void;
	onReject?: () => void;
	/** Must return false to disable default behavior, allowing to handle things manually */
	onBeforeShow?: () => boolean;
	/** Must return false to disable default behavior, allowing to handle things manually */
	onBeforeRemove?: () => boolean;

	// Options
	useLocalStorage?: boolean;
	consentCookieName?: string;
	consentCookieTimeoutInMilliseconds?: number;
	trackingCookieNames?: string[];
	botsUserAgentRegexp?: RegExp;
	delayBeforeRemoveInMilliseconds?: number;
}) {
	const {
		// HTML Elements
		bannerElement,
		acceptButtonElement,
		rejectButtonElement,
		moreLinkElement,

		// Hooks
		onAccept,
		onReject,
		onBeforeShow,
		onBeforeRemove,

		// Options
		useLocalStorage = false,
		consentCookieName = "hasConsent",
		consentCookieTimeoutInMilliseconds = 31104000000, // 12 months in milliseconds
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
		botsUserAgentRegexp = /bot|crawler|spider|crawling|extended|meta-externalagent/i, // Includes AI bots
		delayBeforeRemoveInMilliseconds = 0,
	} = config;

	const isCookieSetTo = function (value: string) {
		return (
			document.cookie.indexOf(`${consentCookieName}="${value}"`) > -1 ||
			localStorage.getItem(consentCookieName) === value
		);
	};

	const listenersController = new AbortController();
	const listenerOptions = { signal: listenersController.signal };

	const banner = {
		/**
		 * Show the banner and bind listeners
		 */
		showBanner: function () {
			if (onBeforeShow?.() !== false && bannerElement !== undefined) {
				bannerElement.style.display = "";
			}

			if (moreLinkElement !== undefined) {
				moreLinkElement.addEventListener(
					"click",
					() => {
						banner.deleteCookie(consentCookieName);
					},
					listenerOptions,
				);
			}

			if (acceptButtonElement !== undefined) {
				acceptButtonElement.addEventListener(
					"click",
					() => {
						banner.remove();
						banner.setConsent(true);
						onAccept();
					},
					listenerOptions,
				);
			}

			if (rejectButtonElement !== undefined) {
				rejectButtonElement.addEventListener(
					"click",
					() => {
						banner.remove();
						banner.setConsent(false);

						// Delete existing tracking cookies
						trackingCookieNames.map((trackingCookieName) =>
							banner.deleteCookie(trackingCookieName),
						);

						onReject?.();
					},
					listenerOptions,
				);
			}
		},

		/**
		 * Set consent cookie or localStorage
		 */
		setConsent: function (hasConsent: boolean) {
			if (useLocalStorage) {
				return localStorage.setItem(consentCookieName, hasConsent.toString());
			}

			this.setCookie(consentCookieName, hasConsent.toString());
		},

		/**
		 * Check if the user already consents
		 */
		hasConsent: function () {
			if (isCookieSetTo("true")) {
				return true;
			}

			if (isCookieSetTo("false")) {
				return false;
			}

			return null;
		},

		/**
		 * Create/update cookie
		 */
		setCookie: function (name: string, value: string) {
			const date = new Date();
			date.setTime(date.getTime() + consentCookieTimeoutInMilliseconds);

			document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;secure;SameSite=Lax`;
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

		/**
		 * Remove the banner from DOM
		 * @param delayInMilliseconds Delay before removing the banner
		 */
		remove: function (delayInMilliseconds: number = delayBeforeRemoveInMilliseconds) {
			listenersController.abort(); // Remove all listeners

			if (onBeforeRemove?.() === false || bannerElement === undefined) {
				return;
			}

			setTimeout(() => {
				bannerElement.remove();
			}, delayInMilliseconds);
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
		if (isBot || hasDoNotTrackEnabled || banner.hasConsent() === false) {
			banner.remove(0);
			onReject?.();
			return false;
		}

		// User has already consented to use cookies to tracking
		if (banner.hasConsent() === true) {
			// Launch user custom function
			onAccept();
			return true;
		}

		// If it's not a bot, no DoNotTrack and not already accept, so show the banner
		banner.showBanner();
	})();

	return banner;
};

export { createCookiesBanner };
