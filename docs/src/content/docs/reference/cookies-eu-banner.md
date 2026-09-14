---
title: "cookies-eu-banner"
---

# `cookies-eu-banner` reference

## `createCookiesBanner()`

**Type:** `(config: CookieEuBannerConfig) => CookiesEuBanner`

### Configuration

#### `bannerTemplateSelector`

**Type:** `string` <br>
**Default:** `#cookies-eu-banner-template`

Selector to find the banner `<template>` tag used to create a new banner in [`showBanner()`](#showbanner).

#### `acceptButtonSelector`

**Type:** `string` <br>
**Default:** `#cookies-eu-accept`

Selector to find the _Accept_ `<button>`, to bind click event on it in [`showBanner()`](#showbanner).

#### `rejectButtonSelector`

**Type:** `string` <br>
**Default:** `#cookies-eu-reject`

Selector to find the _Reject_ `<button>`, to bind click event on it in [`showBanner()`](#showbanner).

#### `onAccept()`

**Type:** `() => void` <br>
**Required**

The callback that will be called when this user accepts or has already accepted.
This is where you launch your scripts (tracking, player, etc.).

#### `onReject()`

**Type:** `() => void` <br>
**Default:** `noop`

The callback that will be called when this user rejects or has already rejected.

#### `onBeforeRemove()`

**Type:** `(bannerElement: HTMLElement) => void` <br>
**Default:** `noop`

Called before removing the banner, at the beginning of the delay.
Useful to trigger a transition.

See also: [`delayBeforeRemove`](#delaybeforeremove)

#### `delayBeforeRemove`

**Type:** `number` <br>
**Default:** `0`

Delay before removing the banner from the DOM in milliseconds.

See also: [`onBeforeRemove`](#onbeforeremove)

## The `CookiesEuBanner` instance

### `showBanner()`

**Type:** `() => void`

Show the banner and bind listeners to accept and reject buttons.

The banner template, accept and reject buttons must exist, based on `bannerTemplateSelector`, `acceptButtonSelector` and `rejectButtonSelector`, otherwise the function will throw an error.

Note: This function does nothing if the banner is already visible.

### `removeBanner()`

**Type:** `(delay?: number) => Promise<void>`

Remove the banner from DOM after the specified delay.

- `delay`: delay before removing the banner, in milliseconds. (Default: 0)

### `setConsent`

**Type:** `(hasConsent: boolean) => void`

- `hasConsent`: the new consent value to set in the cookie or the localStorage.

### `hasConsent`

**Type:** `() => boolean | undefined`

Retrieve the current user consent status from cookie or localStorage.

- `true`: user has accepted
- `false`: user has rejected
- `undefined`: no choice made yet, or has expired

### `setCookie`

**Type:** `(name: string, value: string) => void`

Helper to set a cookie value.

- `name`: the cookie name
- `value`: the value to save in the cookie

### `getCookie`

**Type:** `(name: string) => string | undefined`

Helper to get a cookie value.

- `name`: the cookie name

### `deleteCookie`

**Type:** `(name: string) => void`

Helper to delete a cookie.

- `name`: the cookie name
