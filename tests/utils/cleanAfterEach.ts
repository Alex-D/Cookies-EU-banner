import { removeAllCookies } from "./cookies.ts";

export const cleanAfterEach = () => {
	document.body.innerHTML = "";

	localStorage.clear();

	removeAllCookies();
};
