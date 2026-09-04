const ONE_MINUTE = 60 * 1000;

const setCookie = (name: string, value: string): void => {
	const date = new Date();
	date.setTime(date.getTime() + ONE_MINUTE);

	document.cookie = `${name}=${value};expires=${date.toUTCString()}`;
};

const getCookie = (name: string): string | undefined => {
	return document.cookie
		.split(";")
		.find((row) => row.trim().startsWith(`${name}=`))
		?.split("=")[1];
};

const removeAllCookies = () => {
	document.cookie.split(";").forEach(function (c) {
		document.cookie = c
			.replace(/^ +/, "")
			.replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/");
	});
};

export { setCookie, getCookie, removeAllCookies };
