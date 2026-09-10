import {
	createHeadlessCookiesBanner,
	DEFAULT_CONSENT_COOKIE_NAME,
	DEFAULT_TRACKING_COOKIE_NAMES,
	type HeadlessOptions,
} from "./headless.ts";

type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

type CookieEuBannerConfig = {
	// HTML Element selectors
	/**
	 * Default: `#cookies-eu-banner-template`
	 */
	bannerTemplateSelector?: string;
	/**
	 * Default: `#cookies-eu-accept`
	 */
	acceptButtonSelector?: string;
	/**
	 * Default: `#cookies-eu-reject`
	 */
	rejectButtonSelector?: string;

	// Hooks
	/**
	 * Callback called when this user accepts or has already accepted.
	 * This is where you launch your tracking scripts.
	 */
	onAccept: () => void;
	/**
	 * Callback called when this user rejects or has already rejected.
	 */
	onReject?: () => void;
	/**
	 * Called before removing the banner, at the beginning of the delay.
	 * Useful to trigger a transition.
	 * See also: `delayBeforeRemove`
	 */
	onBeforeRemove?: (bannerElement: HTMLElement) => void;

	// Options
	/**
	 * Delay before removing the banner from the DOM in milliseconds.
	 * See also: `onBeforeRemove`
	 */
	delayBeforeRemove?: number;
} & HeadlessOptions;

const createCookiesBanner = function (config: CookieEuBannerConfig) {
	const {
		// HTML Element selectors
		bannerTemplateSelector = "#cookies-eu-banner-template",
		acceptButtonSelector = "#cookies-eu-accept",
		rejectButtonSelector = "#cookies-eu-reject",

		// Hooks
		onAccept,
		onReject,
		onBeforeRemove,

		// Options
		delayBeforeRemove = 0,

		// Headless config
		...headlessConfig
	} = config;

	let bannerElement: HTMLElement | undefined;
	let listenersController: AbortController;

	const showBanner = () => {
		// Banner is already shown
		if (bannerElement !== undefined) {
			return;
		}

		const bannerTemplateElement =
			document.querySelector<HTMLTemplateElement>(bannerTemplateSelector)!;
		bannerElement = bannerTemplateElement.content.firstElementChild!.cloneNode(true) as HTMLElement;
		document.body.prepend(bannerElement);

		listenersController = new AbortController();
		const listenerOptions = { signal: listenersController.signal };

		bannerElement.querySelector(acceptButtonSelector)!.addEventListener(
			"click",
			() => {
				headlessBannerFunctions.setConsent(true);
			},
			listenerOptions,
		);

		bannerElement.querySelector(rejectButtonSelector)!.addEventListener(
			"click",
			() => {
				headlessBannerFunctions.setConsent(false);
			},
			listenerOptions,
		);
	};

	const removeBanner = async (delay: number = delayBeforeRemove) => {
		if (bannerElement === undefined) {
			return;
		}

		listenersController.abort(); // Remove all listeners

		bannerElement.classList.add("cookies-eu-banner--before-remove");
		onBeforeRemove?.(bannerElement);

		return new Promise<void>((resolve) => {
			setTimeout(() => {
				bannerElement?.remove();
				bannerElement = undefined;
				resolve();
			}, delay);
		});
	};

	const { init, ...headlessBannerFunctions } = createHeadlessCookiesBanner({
		...headlessConfig,
		onAccept: () => {
			onAccept();
			void removeBanner();
		},
		onReject: () => {
			onReject?.();
			void removeBanner();
		},
		onShowBanner: () => {
			showBanner();
		},
	});
	init();

	const bannerFunctions = {
		/**
		 * Show the banner and bind listeners
		 */
		showBanner,

		/**
		 * Remove the banner from DOM
		 * @param delay Delay before removing the banner
		 */
		removeBanner,
	};

	return {
		...bannerFunctions,
		...headlessBannerFunctions,
	} as Prettify<typeof bannerFunctions & typeof headlessBannerFunctions>;
};

export {
	createCookiesBanner,
	DEFAULT_CONSENT_COOKIE_NAME,
	DEFAULT_TRACKING_COOKIE_NAMES,
	type CookieEuBannerConfig,
};
