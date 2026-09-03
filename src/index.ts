import { createHeadlessCookiesBanner, type HeadlessOptions } from "./headless.ts";

type Prettify<T> = {
	[K in keyof T]: T[K];
} & {};

type CookieEuBannerConfig = {
	// HTML Elements
	bannerElement: HTMLElement;
	acceptButtonElement: HTMLElement;
	rejectButtonElement: HTMLElement;

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
	onBeforeRemove?: () => void;

	// Options
	/**
	 * Delay before removing the banner from the DOM in milliseconds.
	 * See also: `onBeforeRemove`
	 */
	delayBeforeRemove?: number;
} & HeadlessOptions;

const createCookiesBanner = function (config: CookieEuBannerConfig) {
	const {
		// HTML Elements
		bannerElement,
		acceptButtonElement,
		rejectButtonElement,

		// Hooks
		onAccept,
		onReject,
		onBeforeRemove,

		// Options
		delayBeforeRemove = 0,

		// Headless config
		...headlessConfig
	} = config;

	const listenersController = new AbortController();
	const listenerOptions = { signal: listenersController.signal };

	const showBanner = () => {
		bannerElement.style.display = "";

		acceptButtonElement.addEventListener(
			"click",
			() => {
				headlessBanner.setConsent(true);
			},
			listenerOptions,
		);

		rejectButtonElement.addEventListener(
			"click",
			() => {
				headlessBanner.setConsent(false);
			},
			listenerOptions,
		);
	};

	const removeBanner = (delay: number = delayBeforeRemove) => {
		listenersController.abort(); // Remove all listeners

		onBeforeRemove?.();

		setTimeout(() => {
			bannerElement.remove();
		}, delay);
	};

	const headlessBanner = createHeadlessCookiesBanner({
		...headlessConfig,
		onAccept: () => {
			removeBanner();
			onAccept();
		},
		onReject: () => {
			removeBanner();
			onReject?.();
		},
		onShowBanner: () => {
			showBanner();
		},
		onRemoveBanner: () => {
			removeBanner(0);
		},
	});

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
		...headlessBanner,
	} as Prettify<typeof bannerFunctions & ReturnType<typeof createHeadlessCookiesBanner>>;
};

export { createCookiesBanner, type CookieEuBannerConfig };
