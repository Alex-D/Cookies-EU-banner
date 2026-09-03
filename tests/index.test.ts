import { expect, test } from "vite-plus/test";
import { createCookiesBanner } from "../src/index.ts";

test("fn", () => {
	expect(
		createCookiesBanner({
			bannerElement: document.createElement("div"),
			acceptButtonElement: document.createElement("button"),
			rejectButtonElement: document.createElement("button"),
			onAccept: () => {},
		}),
	).toBe("Hello, tsdown!");
});
