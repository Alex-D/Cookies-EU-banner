import { expect, test as baseTest, vi } from "vite-plus/test";

import { cleanAfterEach } from "./utils/cleanAfterEach.ts";
import { extractHtmlAttributeFromSelector } from "./utils/extractAttributeFromSelector.ts";
import { getCookie, setCookie } from "./utils/cookies.ts";

import { createCookiesBanner, DEFAULT_CONSENT_COOKIE_NAME } from "../src/index.ts";
import { createHeadlessCookiesBanner, type HeadlessOptions } from "../src/headless.ts";

vi.mock("../src/headless.ts", { spy: true });

const test = baseTest
	.extend("bannerTemplateSelector", "#cookies-eu-banner-template")
	.extend("bannerSelector", "#cookies-eu-banner")
	.extend("acceptButtonSelector", "#cookies-eu-accept")
	.extend("rejectButtonSelector", "#cookies-eu-reject");

const clickOnButton = vi.defineHelper((buttonSelector) => {
	const acceptButton = document.querySelector<HTMLButtonElement>(buttonSelector);
	expect(acceptButton).not.toBeNull();
	acceptButton!.click();
});

const expectBannerAsBodyFirstChild = vi.defineHelper((bannerSelector) => {
	const bannerElement = document.querySelector(bannerSelector);
	expect(bannerElement).not.toBeNull();
	expect(document.body.children[0]).toBe(bannerElement);
});

const expectBannerToNotExists = vi.defineHelper((bannerSelector) => {
	expect(document.querySelector(bannerSelector)).toBeNull();
});

const forAcceptAndReject = [
	{
		action: "Accept",
		getButtonSelector: ({ acceptButtonSelector }: { acceptButtonSelector: string }) => {
			return acceptButtonSelector;
		},
	},
	{
		action: "Reject",
		getButtonSelector: ({ rejectButtonSelector }: { rejectButtonSelector: string }) => {
			return rejectButtonSelector;
		},
	},
];

test.beforeEach(
	({ bannerTemplateSelector, bannerSelector, acceptButtonSelector, rejectButtonSelector }) => {
		vi.useFakeTimers();
		document.body.innerHTML = `
			<template ${extractHtmlAttributeFromSelector(bannerTemplateSelector)}>
				<div ${extractHtmlAttributeFromSelector(bannerSelector)}>
					<button ${extractHtmlAttributeFromSelector(acceptButtonSelector)}>Accept</button>
					<button ${extractHtmlAttributeFromSelector(rejectButtonSelector)}>Reject</button>
				</div>
			</template>
		`;
	},
);

test.afterEach(() => {
	cleanAfterEach();
	vi.clearAllMocks();
});

test.describe("init", () => {
	test("Ensure DEFAULT_CONSENT_COOKIE_NAME has not changed", () => {
		expect(DEFAULT_CONSENT_COOKIE_NAME).toEqual("hasConsent");
	});

	test("Add the banner to the top of the body", ({ bannerSelector }) => {
		const onAccept = vi.fn();

		createCookiesBanner({
			onAccept,
		});

		expectBannerAsBodyFirstChild(bannerSelector);
	});

	test("Must throw fail when banner template does not exists", () => {
		document.body.innerHTML = "";

		const onAccept = vi.fn();

		expect(() => {
			createCookiesBanner({
				onAccept,
			});
		}).toThrow(TypeError);
	});

	test("Triggers onAccept when the user already gave his consent", ({ bannerSelector }) => {
		setCookie(DEFAULT_CONSENT_COOKIE_NAME, "true");

		const onAccept = vi.fn();

		createCookiesBanner({
			onAccept,
		});

		expectBannerToNotExists(bannerSelector);

		expect(getCookie(DEFAULT_CONSENT_COOKIE_NAME)).toBe("true");
	});

	test("Does nothing if the user already reject consent", ({ bannerSelector }) => {
		setCookie(DEFAULT_CONSENT_COOKIE_NAME, "false");

		const onAccept = vi.fn();

		createCookiesBanner({
			onAccept,
		});

		expect(onAccept).not.toHaveBeenCalled();
		expectBannerToNotExists(bannerSelector);

		expect(getCookie(DEFAULT_CONSENT_COOKIE_NAME)).toBe("false");
	});

	test("Triggers onReject if defined and the user already reject consent", ({ bannerSelector }) => {
		setCookie(DEFAULT_CONSENT_COOKIE_NAME, "false");

		const onAccept = vi.fn();
		const onReject = vi.fn();

		createCookiesBanner({
			onAccept,
			onReject,
		});

		expect(onAccept).not.toHaveBeenCalled();
		expect(onReject).toHaveBeenCalled();
		expectBannerToNotExists(bannerSelector);

		expect(getCookie(DEFAULT_CONSENT_COOKIE_NAME)).toBe("false");
	});
});

test.describe("Accept button", () => {
	test("Triggers onAccept and set the cookie when the user clicks on Accept", ({
		acceptButtonSelector,
	}) => {
		expect(getCookie(DEFAULT_CONSENT_COOKIE_NAME)).toBe(undefined);

		const onAccept = vi.fn();
		const onReject = vi.fn();

		createCookiesBanner({
			onAccept,
			onReject,
		});

		clickOnButton(acceptButtonSelector);

		expect(onAccept).toHaveBeenCalled();
		expect(onReject).not.toHaveBeenCalled();

		expect(getCookie(DEFAULT_CONSENT_COOKIE_NAME)).toBe("true");
	});

	test("Banner is removed on next tick when the user clicks on Accept button", async ({
		bannerSelector,
		acceptButtonSelector,
	}) => {
		const onAccept = vi.fn();

		createCookiesBanner({
			onAccept,
		});

		expectBannerAsBodyFirstChild(bannerSelector);

		clickOnButton(acceptButtonSelector);

		await vi.advanceTimersToNextTimerAsync();
		expectBannerToNotExists(bannerSelector);
	});
});

test.describe("Reject button", () => {
	test("Triggers onReject and set cookie to false when the user clicks on Reject button", ({
		rejectButtonSelector,
	}) => {
		expect(getCookie(DEFAULT_CONSENT_COOKIE_NAME)).toBe(undefined);

		const onAccept = vi.fn();
		const onReject = vi.fn();

		createCookiesBanner({
			onAccept,
			onReject,
		});

		clickOnButton(rejectButtonSelector);

		expect(onReject).toHaveBeenCalled();
		expect(onAccept).not.toHaveBeenCalled();

		expect(getCookie(DEFAULT_CONSENT_COOKIE_NAME)).toBe("false");
	});

	test("Banner is removed on next tick when the user clicks on Reject button", async ({
		bannerSelector,
		rejectButtonSelector,
	}) => {
		const onAccept = vi.fn();

		createCookiesBanner({
			onAccept,
		});

		expectBannerAsBodyFirstChild(bannerSelector);

		clickOnButton(rejectButtonSelector);

		await vi.advanceTimersToNextTimerAsync();
		expectBannerToNotExists(bannerSelector);
	});
});

test.describe("Custom selectors", () => {
	test
		.override("bannerTemplateSelector", ".custom-banner-selector")
		.override("acceptButtonSelector", ".custom-accept-button-selector")
		.override("rejectButtonSelector", ".custom-reject-button-selector");

	test("init with custom selectors", ({
		bannerTemplateSelector,
		acceptButtonSelector,
		rejectButtonSelector,
		bannerSelector,
	}) => {
		const onAccept = vi.fn();

		createCookiesBanner({
			bannerTemplateSelector,
			acceptButtonSelector,
			rejectButtonSelector,
			onAccept,
		});

		expectBannerAsBodyFirstChild(bannerSelector);
	});

	test("Triggers onAccept when the user clicks on Accept", async ({
		bannerTemplateSelector,
		acceptButtonSelector,
		rejectButtonSelector,
		bannerSelector,
	}) => {
		const onAccept = vi.fn();

		createCookiesBanner({
			bannerTemplateSelector,
			acceptButtonSelector,
			rejectButtonSelector,
			onAccept,
		});

		expectBannerAsBodyFirstChild(bannerSelector);

		clickOnButton(acceptButtonSelector);

		expect(onAccept).toHaveBeenCalled();

		await vi.advanceTimersToNextTimerAsync();
		expectBannerToNotExists(bannerSelector);
	});

	test("Triggers onReject when the user clicks on Reject", async ({
		bannerTemplateSelector,
		acceptButtonSelector,
		rejectButtonSelector,
		bannerSelector,
	}) => {
		const onAccept = vi.fn();
		const onReject = vi.fn();

		createCookiesBanner({
			bannerTemplateSelector,
			acceptButtonSelector,
			rejectButtonSelector,
			onAccept,
			onReject,
		});

		expectBannerAsBodyFirstChild(bannerSelector);

		clickOnButton(rejectButtonSelector);

		expect(onAccept).not.toHaveBeenCalled();
		expect(onReject).toHaveBeenCalled();

		await vi.advanceTimersToNextTimerAsync();
		expectBannerToNotExists(bannerSelector);
	});
});

test.describe("onBeforeRemove hook", () => {
	test.for([["true"], ["false"]])(
		"onBeforeRemove must not be called if banner was not shown",
		([cookieValue]) => {
			setCookie(DEFAULT_CONSENT_COOKIE_NAME, cookieValue);

			const onAccept = vi.fn();
			const onBeforeRemove = vi.fn();

			createCookiesBanner({
				onAccept,
				onBeforeRemove,
			});

			expect(onBeforeRemove).not.toHaveBeenCalled();
		},
	);

	test.for(forAcceptAndReject)(
		"onBeforeRemove must be called when click on $action button",
		({ getButtonSelector }, { bannerSelector, acceptButtonSelector, rejectButtonSelector }) => {
			const onAccept = vi.fn();
			const onBeforeRemove = vi.fn();

			createCookiesBanner({
				onAccept,
				onBeforeRemove,
			});

			clickOnButton(
				getButtonSelector({
					acceptButtonSelector,
					rejectButtonSelector,
				}),
			);

			const bannerElement = document.querySelector(bannerSelector)!;
			expect(onBeforeRemove).toHaveBeenCalledWith(bannerElement);
			expect(bannerElement.classList).toContain("cookies-eu-banner--before-remove");
		},
	);
});

test.describe("delayBeforeRemove", () => {
	test.for(forAcceptAndReject)(
		"Must wait delayBeforeRemove before removing the banner from DOM when clicking on $action",
		async (
			{ getButtonSelector },
			{ bannerSelector, acceptButtonSelector, rejectButtonSelector },
		) => {
			const onAccept = vi.fn();
			const delayBeforeRemove = 300;

			createCookiesBanner({
				onAccept,
				delayBeforeRemove,
			});

			clickOnButton(
				getButtonSelector({
					acceptButtonSelector,
					rejectButtonSelector,
				}),
			);

			await vi.advanceTimersByTimeAsync(delayBeforeRemove - 1);
			const bannerElement = document.querySelector(bannerSelector)!;
			expect(bannerElement.classList).toContain("cookies-eu-banner--before-remove");

			await vi.advanceTimersByTimeAsync(1);
			expectBannerToNotExists(bannerSelector);
		},
	);
});

test.describe("Headless options", () => {
	test("No option unrelated to headless are passed to createHeadlessCookiesBanner", () => {
		createCookiesBanner({
			// Selectors
			bannerTemplateSelector: "#cookies-eu-banner-template",
			acceptButtonSelector: "#cookies-eu-accept",
			rejectButtonSelector: "#cookies-eu-reject",

			// Hooks
			onAccept: vi.fn(),
			onReject: vi.fn(),
			onBeforeRemove: vi.fn(),

			// Options
			delayBeforeRemove: 150,
		});

		expect(createHeadlessCookiesBanner).toHaveBeenCalledExactlyOnceWith({
			onAccept: expect.any(Function),
			onReject: expect.any(Function),
			onShowBanner: expect.any(Function),
		});
	});

	test("All headless options are passed to createHeadlessCookiesBanner", () => {
		const headlessOptions: HeadlessOptions = {
			useLocalStorage: true,
			consentCookieName: "customName",
			consentCookieTimeout: 300,
			trackingCookieNames: ["__tracking"],
			botsUserAgentRegexp: /.*/i,
		};

		createCookiesBanner({
			// Selectors
			bannerTemplateSelector: "#cookies-eu-banner-template",
			acceptButtonSelector: "#cookies-eu-accept",
			rejectButtonSelector: "#cookies-eu-reject",

			// Hooks
			onAccept: vi.fn(),
			onReject: vi.fn(),
			onBeforeRemove: vi.fn(),

			// Options
			delayBeforeRemove: 150,

			// Headless options
			...headlessOptions,
		});

		expect(createHeadlessCookiesBanner).toHaveBeenCalledExactlyOnceWith({
			onAccept: expect.any(Function),
			onReject: expect.any(Function),
			onShowBanner: expect.any(Function),
			...headlessOptions,
		});
	});
});
