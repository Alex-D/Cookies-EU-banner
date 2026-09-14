---
title: "Get started"
---

# Get started

## 1. Add the template

Insert the banner at the end of the `<body>` element, using a `<template>` with these IDs:

```html
<template id="cookies-eu-banner-template">
	<div id="cookies-eu-banner">
		By continuing to visit this site, you accept the use of cookies by Google Analytics for
		statistical purposes.
		<button id="cookies-eu-reject">Reject</button>
		<button id="cookies-eu-accept">Accept</button>
	</div>
</template>
```

## 2. Import the script

Choose one of these options:

- [Using a build step](#using-a-build-step)
- Using a CDN:
  - [Global build, the good old `<script src="..."`](#cdn-or-local-copy-global-build-import-via-script-src)
  - [ESM build, import via `<script type="module">`](#cdn-or-local-copy-es-module-build-esm)

### Using a build step

| Package manager | Command                                |
| --------------- | -------------------------------------- |
| Vite+           | `vp add cookies-eu-banner`             |
| pnpm            | `pnpm add cookies-eu-banner`           |
| npm             | `npm install cookies-eu-banner --save` |
| yarn            | `yarn add cookies-eu-banner`           |

```js
import { createCookiesBanner } from "cookies-eu-banner";

createCookiesBanner({
	onAccept: () => {
		// Your code to launch when the user accepts cookies
	},
});
```

### CDN or local copy: Global build (import via `<script src="...">`)

This will expose `CookiesEuBanner` as global, allowing you to call the `createCookiesBanner` function like this:

```html
<script src="https://unpkg.com/cookies-eu-banner@^3/dist/cookies-eu-banner.global.js"></script>
<!--
Or if you have downloaded the package, you can import it locally instead:
<script src="./your-path/cookies-eu-banner.global.js"></script>
-->
<script>
	CookiesEuBanner.createCookiesBanner({
		onAccept: () => {
			// Your code to launch when the user accepts cookies
		},
	});
</script>
```

### CDN or local copy: ES Module build (ESM)

```html
<script type="module">
	import { createCookiesBanner } from "https://unpkg.com/cookies-eu-banner@^3/dist/cookies-eu-banner.js";

	// Or if you have downloaded the package, you can import it locally instead:
	// import { createCookiesBanner } from "./your-path/cookies-eu-banner.js";

	createCookiesBanner({
		onAccept: () => {
			// Your code to launch when the user accepts cookies
		},
	});
</script>
```
