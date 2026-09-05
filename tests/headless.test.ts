import { expect, test, vi } from "vite-plus/test";

import { cleanAfterEach } from "./utils/cleanAfterEach.ts";
import { getCookie, setCookie } from "./utils/cookies.ts";

import {
	createHeadlessCookiesBanner,
	DEFAULT_CONSENT_COOKIE_NAME,
	DEFAULT_TRACKING_COOKIE_NAMES,
	type HeadlessOptions,
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
	headlessOptions = {},
}: {
	cookieName?: string;
	initialConsentValue?: string | undefined;
	headlessOptions?: HeadlessOptions;
} = {}) => {
	if (initialConsentValue !== undefined) {
		if (headlessOptions?.useLocalStorage) {
			localStorage.setItem(cookieName, initialConsentValue);
		} else {
			setCookie(cookieName, initialConsentValue);
		}
	}

	const onShowBanner = vi.fn();
	const onAccept = vi.fn();
	const onReject = vi.fn();

	const headlessCookiesBanner = vi.mockObject(
		createHeadlessCookiesBanner({
			onShowBanner,
			onAccept,
			onReject,
			...headlessOptions,
		}),
		{ spy: true },
	);
	headlessCookiesBanner.init();

	return {
		onShowBanner,
		onAccept,
		onReject,
		headlessCookiesBanner,
	};
};

test.describe("init", () => {
	test("Ensure DEFAULT_CONSENT_COOKIE_NAME has not changed", () => {
		expect(DEFAULT_CONSENT_COOKIE_NAME).toEqual("hasConsent");
	});

	test("Calls onShowBanner on init when no cookie is set for normal user", () => {
		const { onShowBanner, onAccept, onReject, headlessCookiesBanner } = initHeadless();

		expect(onShowBanner).toHaveBeenCalledOnce();

		expect(onAccept).not.toHaveBeenCalled();
		expect(onReject).not.toHaveBeenCalled();

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
			headlessOptions: {
				botsUserAgentRegexp: /alien/i,
			} as HeadlessOptions,
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
			headlessOptions: {
				useLocalStorage: true,
			} as HeadlessOptions,
		},
	])(
		"Call onReject and not onShowBanner when $case",
		async ({ beforeInit, initialConsentValue, headlessOptions = {} }) => {
			beforeInit?.();
			const { onShowBanner, onAccept, onReject, headlessCookiesBanner } = initHeadless({
				initialConsentValue,
				headlessOptions,
			});

			expect(onAccept).not.toHaveBeenCalled();
			expect(onReject).toHaveBeenCalledOnce();

			expect(onShowBanner).not.toHaveBeenCalled();

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
			headlessOptions: {
				useLocalStorage: true,
			} as HeadlessOptions,
		},
	])(
		"Call onAccept and not onShowBanner when user has already accepted using $storageMode",
		async ({ initialConsentValue, headlessOptions = {} }) => {
			const { onShowBanner, onAccept, onReject, headlessCookiesBanner } = initHeadless({
				initialConsentValue,
				...headlessOptions,
			});

			expect(onAccept).toHaveBeenCalledOnce();
			expect(onReject).not.toHaveBeenCalled();

			expect(onShowBanner).not.toHaveBeenCalled();

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
			headlessOptions: {} as HeadlessOptions,
		},
		{
			storageMode: "localStorage",
			headlessOptions: {
				useLocalStorage: true,
			} as HeadlessOptions,
		},
	];

	const cookieConsentNameMatrix = [
		...storageModeMatrix.map(({ storageMode, headlessOptions }) => {
			return {
				storageMode,
				cookieConsentName: "default",
				headlessOptions,
			};
		}),
		...storageModeMatrix.map(({ storageMode, headlessOptions }) => {
			return {
				storageMode,
				cookieConsentName: "custom",
				headlessOptions: {
					...headlessOptions,
					consentCookieName: "customConsentName",
				} as HeadlessOptions,
			};
		}),
	];

	const consentValueMatrix = [
		...cookieConsentNameMatrix.map(({ storageMode, cookieConsentName, headlessOptions }) => {
			return {
				storageMode,
				cookieConsentName,
				headlessOptions,
				hasConsent: true,
				expectedValue: "true",
			};
		}),
		...cookieConsentNameMatrix.map(({ storageMode, cookieConsentName, headlessOptions }) => {
			return {
				storageMode,
				cookieConsentName,
				headlessOptions,
				hasConsent: false,
				expectedValue: "false",
			};
		}),
	];

	test.for(consentValueMatrix)(
		"Must set the value to $hasConsent in $storageMode using $cookieConsentName name",
		async ({ headlessOptions, hasConsent, expectedValue }) => {
			const { onAccept, onReject, headlessCookiesBanner } = initHeadless({
				headlessOptions,
			});

			expect(onAccept).not.toHaveBeenCalled();
			expect(onReject).not.toHaveBeenCalled();

			headlessCookiesBanner.setConsent(hasConsent);

			if (hasConsent) {
				expect(onAccept).toHaveBeenCalledOnce();
				expect(onReject).not.toHaveBeenCalled();
			} else {
				expect(onAccept).not.toHaveBeenCalledOnce();
				expect(onReject).toHaveBeenCalled();
			}

			if (headlessOptions.consentCookieName !== undefined) {
				expect(headlessOptions.consentCookieName).not.toBe(DEFAULT_CONSENT_COOKIE_NAME);
			}

			const consentKey = headlessOptions.consentCookieName ?? DEFAULT_CONSENT_COOKIE_NAME;
			if (headlessOptions.useLocalStorage) {
				expect(getCookie(consentKey)).toBeUndefined();
				expect(localStorage.getItem(consentKey)).toBe(expectedValue);
			} else {
				expect(getCookie(consentKey)).toBe(expectedValue);
				expect(localStorage.getItem(consentKey)).toBeNull();
			}
		},
	);

	const customTrackingCookieNames = ["__custom_tracking_1", "__custom_tracking_2"];
	const trackingCookiesMatrix = [
		...storageModeMatrix.map(({ storageMode, headlessOptions }) => {
			return {
				storageMode,
				trackingCookies: "default",
				headlessOptions,
			};
		}),
		...storageModeMatrix.map(({ storageMode, headlessOptions }) => {
			return {
				storageMode,
				trackingCookies: "custom",
				headlessOptions: {
					...headlessOptions,
					trackingCookieNames: customTrackingCookieNames,
				} as HeadlessOptions,
			};
		}),
	];
	test.for(trackingCookiesMatrix)(
		"Must delete $trackingCookies tracking cookies on setConsent(false) using $storageMode",
		async ({ headlessOptions }) => {
			const trackingCookiesToDelete =
				headlessOptions.trackingCookieNames === undefined
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
				headlessOptions,
			});
			headlessCookiesBanner.setConsent(false);

			expect(headlessCookiesBanner.deleteCookie).toHaveBeenCalledTimes(
				trackingCookiesToDelete.length,
			);

			trackingCookiesToDelete.forEach((cookieName) => {
				expect(getCookie(cookieName)).toBeUndefined();
			});
		},
	);

	test("Do not delete tracking cookies on setConsent(true)", () => {
		DEFAULT_TRACKING_COOKIE_NAMES.forEach((cookieName) => {
			setCookie(cookieName, "anyValue");
		});

		const { headlessCookiesBanner } = initHeadless();
		headlessCookiesBanner.setConsent(true);

		expect(headlessCookiesBanner.deleteCookie).not.toHaveBeenCalled();

		DEFAULT_TRACKING_COOKIE_NAMES.forEach((cookieName) => {
			expect(getCookie(cookieName)).toBe("anyValue");
		});
	});
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
			headlessOptions: {
				consentCookieName: "customCookieName",
			} as HeadlessOptions,
		},
		{
			storageMode: "localStorage",
			expectedValue: undefined,
			headlessOptions: {
				useLocalStorage: true,
			} as HeadlessOptions,
		},
		{
			storageMode: "localStorage",
			expectedValue: true,
			beforeInit: () => localStorage.setItem(DEFAULT_CONSENT_COOKIE_NAME, "true"),
			headlessOptions: {
				useLocalStorage: true,
			} as HeadlessOptions,
		},
		{
			storageMode: "localStorage",
			expectedValue: false,
			beforeInit: () => localStorage.setItem(DEFAULT_CONSENT_COOKIE_NAME, "false"),
			headlessOptions: {
				useLocalStorage: true,
			} as HeadlessOptions,
		},
		{
			storageMode: "localStorage customName",
			expectedValue: false,
			beforeInit: () => localStorage.setItem("customCookieName", "false"),
			headlessOptions: {
				useLocalStorage: true,
				consentCookieName: "customCookieName",
			} as HeadlessOptions,
		},
	])(
		"Returns $expectedValue using $storageMode",
		({ beforeInit, expectedValue, headlessOptions }) => {
			beforeInit?.();
			const { headlessCookiesBanner } = initHeadless({ headlessOptions });
			expect(headlessCookiesBanner.hasConsent()).toBe(expectedValue);
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
			headlessOptions: {
				consentCookieTimeout: 60 * 1000, // 1 minute
			},
			expected:
				"testName=testValue;expires=Thu, 01 Jan 2026 00:01:00 GMT;path=/;secure;SameSite=Lax",
		},
	])(
		"Must write the value in $protocol and expires $expires",
		({ beforeInit, expected, headlessOptions }) => {
			beforeInit();

			vi.useFakeTimers();
			vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

			const cookieSetterSpy = vi.spyOn(document, "cookie", "set");

			const { headlessCookiesBanner } = initHeadless({ headlessOptions });
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
