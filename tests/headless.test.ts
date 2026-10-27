import { expect, test, vi } from "vite-plus/test";

import { cleanAfterEach } from "./utils/cleanAfterEach.ts";
import { getCookie, setCookie } from "./utils/cookies.ts";

import {
	createHeadlessCookiesBanner,
	DEFAULT_CONSENT_COOKIE_NAME,
	DEFAULT_TRACKING_COOKIE_NAMES,
	type HeadlessConfig,
} from "../src/headless.ts";

import { getProtocol } from "../src/getProtocol.ts";

vi.mock("../src/getProtocol.ts", () => {
	return {
		getProtocol: vi.fn(),
	};
});

test.afterEach(() => {
	cleanAfterEach();
	vi.clearAllMocks();
	vi.unstubAllGlobals();
});

const initHeadless = ({
	cookieName = DEFAULT_CONSENT_COOKIE_NAME,
	initialConsentValue,
	headlessConfig = {},
}: {
	cookieName?: string;
	initialConsentValue?: string | undefined;
	headlessConfig?: HeadlessConfig;
} = {}) => {
	if (initialConsentValue !== undefined) {
		if (headlessConfig?.useLocalStorage) {
			localStorage.setItem(cookieName, initialConsentValue);
		} else {
			setCookie(cookieName, initialConsentValue);
		}
	}

	const listener = vi.fn();

	const headlessCookiesBanner = vi.mockObject(
		createHeadlessCookiesBanner({
			...headlessConfig,
		}),
		{ spy: true },
	);
	const unsubscribe = headlessCookiesBanner.subscribe(listener);
	headlessCookiesBanner.checkConsentAndShowBanner();

	return {
		listener,
		unsubscribe,
		headlessCookiesBanner,
	};
};

test.describe("checkConsentAndShowBanner", () => {
	test("Ensure DEFAULT_CONSENT_COOKIE_NAME has not changed", () => {
		expect(DEFAULT_CONSENT_COOKIE_NAME).toEqual("hasConsent");
	});

	test("Updates state and call listeners when no cookie is set for normal user", () => {
		const { listener, headlessCookiesBanner } = initHeadless();

		expect(listener).toHaveBeenCalledOnce();

		expect(headlessCookiesBanner.getState()).toStrictEqual({
			mustShowBanner: true,
			hasConsent: undefined,
		});

		expect(headlessCookiesBanner.setConsent).not.toHaveBeenCalled();
		expect(headlessCookiesBanner.setCookie).not.toHaveBeenCalled();
		expect(headlessCookiesBanner.deleteCookie).not.toHaveBeenCalled();
	});

	test.for([
		{
			case: "its a bot",
			beforeInit: () => vi.stubGlobal("navigator", { userAgent: "bot" }),
		},
		{
			case: "its a custom bot",
			beforeInit: () => vi.stubGlobal("navigator", { userAgent: "Alien" }),
			headlessConfig: {
				botsUserAgentRegexp: /alien/i,
			} as HeadlessConfig,
		},
		{
			case: "do not track is enabled",
			beforeInit: () => vi.stubGlobal("navigator", { doNotTrack: "1" }),
		},
		{
			case: "user has already rejected using cookie",
			initialConsentValue: "false",
		},
		{
			case: "user has already rejected using localStorage",
			initialConsentValue: "false",
			headlessConfig: {
				useLocalStorage: true,
			} as HeadlessConfig,
		},
	])(
		"Updates the state and call listeners when $case",
		({ beforeInit, initialConsentValue, headlessConfig = {} }) => {
			beforeInit?.();
			const { listener, headlessCookiesBanner } = initHeadless({
				initialConsentValue,
				headlessConfig,
			});

			expect(listener).toHaveBeenCalledOnce();

			expect(headlessCookiesBanner.getState()).toStrictEqual({
				mustShowBanner: false,
				hasConsent: false,
			});

			expect(headlessCookiesBanner.setConsent).not.toHaveBeenCalled();
			expect(headlessCookiesBanner.setCookie).not.toHaveBeenCalled();
			expect(headlessCookiesBanner.deleteCookie).not.toHaveBeenCalled();
		},
	);

	test.for([
		{
			storageMode: "cookie",
			initialConsentValue: "true",
		},
		{
			storageMode: "localStorage",
			initialConsentValue: "true",
			headlessConfig: {
				useLocalStorage: true,
			} as HeadlessConfig,
		},
	])(
		"Updates the state and call listeners when user has already accepted using $storageMode",
		({ initialConsentValue, headlessConfig = {} }) => {
			const { listener, headlessCookiesBanner } = initHeadless({
				initialConsentValue,
				...headlessConfig,
			});

			expect(listener).toHaveBeenCalledOnce();

			expect(headlessCookiesBanner.getState()).toStrictEqual({
				mustShowBanner: false,
				hasConsent: true,
			});

			expect(headlessCookiesBanner.setConsent).not.toHaveBeenCalled();
			expect(headlessCookiesBanner.setCookie).not.toHaveBeenCalled();
			expect(headlessCookiesBanner.deleteCookie).not.toHaveBeenCalled();
		},
	);
});

test.describe("setConsent", () => {
	const storageModeMatrix = [
		{
			storageMode: "cookie",
			headlessConfig: {} as HeadlessConfig,
		},
		{
			storageMode: "localStorage",
			headlessConfig: {
				useLocalStorage: true,
			} as HeadlessConfig,
		},
	];

	const cookieConsentNameMatrix = [
		...storageModeMatrix.map(({ storageMode, headlessConfig }) => {
			return {
				storageMode,
				cookieConsentName: "default",
				headlessConfig,
			};
		}),
		...storageModeMatrix.map(({ storageMode, headlessConfig }) => {
			return {
				storageMode,
				cookieConsentName: "custom",
				headlessConfig: {
					...headlessConfig,
					consentCookieName: "customConsentName",
				} as HeadlessConfig,
			};
		}),
	];

	const consentValueMatrix = [
		...cookieConsentNameMatrix.map(({ storageMode, cookieConsentName, headlessConfig }) => {
			return {
				storageMode,
				cookieConsentName,
				headlessConfig,
				hasConsent: true,
				expectedValue: "true",
			};
		}),
		...cookieConsentNameMatrix.map(({ storageMode, cookieConsentName, headlessConfig }) => {
			return {
				storageMode,
				cookieConsentName,
				headlessConfig,
				hasConsent: false,
				expectedValue: "false",
			};
		}),
	];

	test.for(consentValueMatrix)(
		"Must set the value to $hasConsent in $storageMode using $cookieConsentName name",
		({ headlessConfig, hasConsent, expectedValue }) => {
			const { listener, headlessCookiesBanner } = initHeadless({
				headlessConfig,
			});

			expect(listener).toHaveBeenCalledOnce();

			expect(headlessCookiesBanner.getState()).toStrictEqual({
				mustShowBanner: true,
				hasConsent: undefined,
			});

			headlessCookiesBanner.setConsent(hasConsent);

			expect(listener).toHaveBeenCalledTimes(2);

			expect(headlessCookiesBanner.getState()).toStrictEqual({
				mustShowBanner: false,
				hasConsent,
			});

			if (headlessConfig.consentCookieName !== undefined) {
				expect(headlessConfig.consentCookieName).not.toBe(DEFAULT_CONSENT_COOKIE_NAME);
			}

			const consentKey = headlessConfig.consentCookieName ?? DEFAULT_CONSENT_COOKIE_NAME;
			if (headlessConfig.useLocalStorage) {
				expect(getCookie(consentKey)).toBeUndefined();
				expect(localStorage.getItem(consentKey)).toBe(expectedValue);
			} else {
				expect(getCookie(consentKey)).toBe(expectedValue);
				expect(localStorage.getItem(consentKey)).toBeNull();
			}
		},
	);

	test.for(storageModeMatrix)(
		"Must delete tracking cookies on setConsent(false) using $storageMode",
		({ headlessConfig }) => {
			const { headlessCookiesBanner } = initHeadless({
				headlessConfig,
			});
			headlessCookiesBanner.setConsent(false);

			expect(headlessCookiesBanner.deleteTrackingCookies).toHaveBeenCalledOnce();
		},
	);

	test("Do not delete tracking cookies on setConsent(true)", () => {
		DEFAULT_TRACKING_COOKIE_NAMES.forEach((cookieName) => {
			setCookie(cookieName, "anyValue");
		});

		const { headlessCookiesBanner } = initHeadless();
		headlessCookiesBanner.setConsent(true);

		expect(headlessCookiesBanner.deleteTrackingCookies).not.toHaveBeenCalled();
		expect(headlessCookiesBanner.deleteCookie).not.toHaveBeenCalled();

		DEFAULT_TRACKING_COOKIE_NAMES.forEach((cookieName) => {
			expect(getCookie(cookieName)).toBe("anyValue");
		});
	});
});

test.describe("deleteTrackCookies", () => {
	const customTrackingCookieNames = ["__custom_tracking_1", "__custom_tracking_2"];
	const trackingCookiesMatrix = [
		{
			trackingCookies: "default",
			headlessConfig: {} as HeadlessConfig,
		},
		{
			trackingCookies: "custom",
			headlessConfig: {
				trackingCookieNames: customTrackingCookieNames,
			} as HeadlessConfig,
		},
	];
	test.for(trackingCookiesMatrix)(
		"Must delete $trackingCookies tracking cookies",
		async ({ headlessConfig }) => {
			const trackingCookiesToDelete =
				headlessConfig.trackingCookieNames === undefined
					? DEFAULT_TRACKING_COOKIE_NAMES
					: customTrackingCookieNames;

			expect(trackingCookiesToDelete.length).toBeGreaterThan(1);

			trackingCookiesToDelete.forEach((cookieName) => {
				setCookie(cookieName, "anyValue");
			});

			trackingCookiesToDelete.forEach((cookieName) => {
				expect(getCookie(cookieName)).not.toBeUndefined();
			});

			const { headlessCookiesBanner } = initHeadless({
				headlessConfig,
			});
			headlessCookiesBanner.deleteTrackingCookies();

			expect(headlessCookiesBanner.deleteCookie).toHaveBeenCalledTimes(
				trackingCookiesToDelete.length,
			);

			trackingCookiesToDelete.forEach((cookieName) => {
				expect(getCookie(cookieName)).toBeUndefined();
			});
		},
	);
});

test.describe("hasConsent", () => {
	test.for([
		{
			storageMode: "cookie",
			expectedValue: undefined,
		},
		{
			storageMode: "cookie",
			expectedValue: true,
			beforeInit: () => setCookie(DEFAULT_CONSENT_COOKIE_NAME, "true"),
		},
		{
			storageMode: "cookie",
			expectedValue: false,
			beforeInit: () => setCookie(DEFAULT_CONSENT_COOKIE_NAME, "false"),
		},
		{
			storageMode: "cookie customName",
			expectedValue: true,
			beforeInit: () => setCookie("customCookieName", "true"),
			headlessConfig: {
				consentCookieName: "customCookieName",
			} as HeadlessConfig,
		},
		{
			storageMode: "localStorage",
			expectedValue: undefined,
			headlessConfig: {
				useLocalStorage: true,
			} as HeadlessConfig,
		},
		{
			storageMode: "localStorage",
			expectedValue: true,
			beforeInit: () => localStorage.setItem(DEFAULT_CONSENT_COOKIE_NAME, "true"),
			headlessConfig: {
				useLocalStorage: true,
			} as HeadlessConfig,
		},
		{
			storageMode: "localStorage",
			expectedValue: false,
			beforeInit: () => localStorage.setItem(DEFAULT_CONSENT_COOKIE_NAME, "false"),
			headlessConfig: {
				useLocalStorage: true,
			} as HeadlessConfig,
		},
		{
			storageMode: "localStorage customName",
			expectedValue: false,
			beforeInit: () => localStorage.setItem("customCookieName", "false"),
			headlessConfig: {
				useLocalStorage: true,
				consentCookieName: "customCookieName",
			} as HeadlessConfig,
		},
	])(
		"Returns $expectedValue using $storageMode",
		({ beforeInit, expectedValue, headlessConfig }) => {
			beforeInit?.();
			const { headlessCookiesBanner } = initHeadless({ headlessConfig });
			expect(headlessCookiesBanner.hasConsent()).toBe(expectedValue);
		},
	);
});

test.describe("resetConsent", () => {
	const storageModeMatrix = [
		{
			storageMode: "cookie",
			headlessConfig: {} as HeadlessConfig,
		},
		{
			storageMode: "localStorage",
			headlessConfig: {
				useLocalStorage: true,
			} as HeadlessConfig,
		},
	];

	const cookieConsentNameMatrix = [
		...storageModeMatrix.map(({ storageMode, headlessConfig }) => {
			return {
				storageMode,
				cookieConsentName: "default",
				headlessConfig,
			};
		}),
		...storageModeMatrix.map(({ storageMode, headlessConfig }) => {
			return {
				storageMode,
				cookieConsentName: "custom",
				headlessConfig: {
					...headlessConfig,
					consentCookieName: "customConsentName",
				} as HeadlessConfig,
			};
		}),
	];

	test.for(cookieConsentNameMatrix)(
		"Must clean everything using $storageMode and $cookieConsentName cookie name",
		({ headlessConfig }) => {
			const { listener, headlessCookiesBanner } = initHeadless({ headlessConfig });
			headlessCookiesBanner.setConsent(true);
			expect(listener).toHaveBeenCalledTimes(2);
			headlessCookiesBanner.resetConsent();
			expect(headlessCookiesBanner.deleteTrackingCookies).toHaveBeenCalledOnce();
			expect(listener).toHaveBeenCalledTimes(3);
			expect(headlessCookiesBanner.getState()).toStrictEqual({
				mustShowBanner: true,
				hasConsent: undefined,
			});
			expect(headlessCookiesBanner.hasConsent()).toBe(undefined);
		},
	);
});

test.describe("setCookie", () => {
	test.for([
		{
			protocol: "http",
			beforeInit: () => {
				vi.mocked(getProtocol).mockReturnValueOnce("http:");
			},
			expires: "default",
			expected: "testName=testValue;expires=Sun, 27 Dec 2026 00:00:00 GMT;path=/;SameSite=Lax",
		},
		{
			protocol: "https",
			beforeInit: () => {
				vi.mocked(getProtocol).mockReturnValueOnce("https:");
			},
			expires: "default",
			expected:
				"testName=testValue;expires=Sun, 27 Dec 2026 00:00:00 GMT;path=/;secure;SameSite=Lax",
		},
		{
			protocol: "https",
			beforeInit: () => {
				vi.mocked(getProtocol).mockReturnValueOnce("https:");
			},
			expires: "custom",
			headlessConfig: {
				consentCookieTimeout: 60 * 1000, // 1 minute
			},
			expected:
				"testName=testValue;expires=Thu, 01 Jan 2026 00:01:00 GMT;path=/;secure;SameSite=Lax",
		},
	])(
		"Must write the value in $protocol and expires $expires",
		({ beforeInit, expected, headlessConfig }) => {
			beforeInit();

			vi.useFakeTimers();
			vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

			const cookieSetterSpy = vi.spyOn(document, "cookie", "set");

			const { headlessCookiesBanner } = initHeadless({ headlessConfig });
			headlessCookiesBanner.setCookie("testName", "testValue");
			expect(getProtocol).toHaveBeenCalledOnce();

			expect(cookieSetterSpy).toHaveBeenCalledExactlyOnceWith(expected);
			vi.useRealTimers();
		},
	);
});

test.describe("getCookie", () => {
	test("Must return the value of the cookie if set", () => {
		setCookie("testGetCookie", "testGetCookieValue");
		const { headlessCookiesBanner } = initHeadless();
		expect(headlessCookiesBanner.getCookie("testGetCookie")).toBe("testGetCookieValue");
	});

	test("Must return undefined if cookie is not set", () => {
		const { headlessCookiesBanner } = initHeadless();
		expect(headlessCookiesBanner.getCookie("testGetCookie")).toBeUndefined();
	});
});

test.describe("deleteCookie", () => {
	test("Must delete the cookie if exists", async () => {
		setCookie("testGetCookieA", "testGetCookieValueA");
		setCookie("testGetCookieB", "testGetCookieValueB");
		const { headlessCookiesBanner } = initHeadless();
		headlessCookiesBanner.deleteCookie("testGetCookieB");
		expect(getCookie("testGetCookieA")).toBe("testGetCookieValueA");
		expect(getCookie("testGetCookieB")).toBeUndefined();
		expect(await cookieStore.getAll()).toHaveLength(1);
	});

	test("Must do nothing if cookie is not set", async () => {
		setCookie("testGetCookieA", "testGetCookieValueA");
		const { headlessCookiesBanner } = initHeadless();
		headlessCookiesBanner.deleteCookie("testGetCookieB");
		expect(getCookie("testGetCookieA")).toBe("testGetCookieValueA");
		expect(getCookie("testGetCookieB")).toBeUndefined();
		expect(await cookieStore.getAll()).toHaveLength(1);
	});
});

test.describe("setState", () => {
	test("Must trigger listener callbacks", () => {
		const { listener, headlessCookiesBanner } = initHeadless();
		expect(listener).toHaveBeenCalledOnce();
		headlessCookiesBanner.setConsent(true); // This triggers setState internally
		expect(listener).toHaveBeenCalledTimes(2);
	});

	test("Must not re-trigger listener callbacks if no state change", () => {
		const { listener, headlessCookiesBanner } = initHeadless();
		expect(listener).toHaveBeenCalledOnce();
		headlessCookiesBanner.setConsent(true); // This triggers setState internally
		expect(listener).toHaveBeenCalledTimes(2);
		headlessCookiesBanner.setConsent(true); // This triggers setState internally
		expect(listener).toHaveBeenCalledTimes(2);
	});
});

test.describe("subscribe", () => {
	test("Must be able to unsubscribe", () => {
		const { listener, unsubscribe, headlessCookiesBanner } = initHeadless();
		expect(listener).toHaveBeenCalledOnce();
		unsubscribe(); // Must remove the listener from listeners
		headlessCookiesBanner.setConsent(true);
		expect(listener).toHaveBeenCalledOnce();
	});
});
