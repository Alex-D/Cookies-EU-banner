import { createHeadlessCookiesBanner, type HeadlessOptions } from "./headless.ts";

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
		bannerTemplateSelector,
		acceptButtonSelector,
		rejectButtonSelector,

		// Hooks
		onAccept,
		onReject,
		onBeforeRemove,

		// Options
		delayBeforeRemove = 0,

		// Headless config
		...headlessConfig
	} = config;

	const querySelector = <T extends Element = HTMLElement>(selector: string) =>
		document.querySelector<T>(selector)!;

	const listenersController = new AbortController();
	const listenerOptions = { signal: listenersController.signal };

	let bannerElement: HTMLElement | undefined;

	const showBanner = () => {
		const bannerTemplateElement = querySelector<HTMLTemplateElement>(
			bannerTemplateSelector ?? "#cookies-eu-banner-template",
		);
		bannerElement = bannerTemplateElement.content.firstElementChild!.cloneNode(true) as HTMLElement;
		document.body.prepend(bannerElement);

		querySelector(acceptButtonSelector ?? "#cookies-eu-accept").addEventListener(
			"click",
			() => {
				headlessBanner.setConsent(true);
			},
			listenerOptions,
		);

		querySelector(rejectButtonSelector ?? "#cookies-eu-reject").addEventListener(
			"click",
			() => {
				headlessBanner.setConsent(false);
			},
			listenerOptions,
		);
	};

	const removeBanner = (delay: number = delayBeforeRemove) => {
		if (bannerElement === undefined) {
			return;
		}

		listenersController.abort(); // Remove all listeners

		bannerElement.classList.add("cookies-eu-banner--before-remove");
		onBeforeRemove?.(bannerElement);

		setTimeout(() => {
			bannerElement?.remove();
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
	});
	headlessBanner.init();

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
