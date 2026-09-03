import { expect, test } from "vite-plus/test";
import { createCookiesBanner } from "../src/index.ts";

test("fn", () => {
	expect(
		createCookiesBanner({
			onAccept: () => {},
		}),
	).toBe("Hello, tsdown!");
});
