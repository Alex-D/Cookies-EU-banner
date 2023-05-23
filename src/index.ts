const createCookiesBanner = function (
	htmlElements: {
		bannerElement: HTMLElement
		acceptButtonElement?: HTMLElement
		rejectButtonElement?: HTMLElement
		moreLinkElement?: HTMLElement
	},
	hooks: {
		onAccept: () => void
		onReject?: () => void
	},
	options: {
		mustWaitExplicitAccept?: boolean
		useLocalStorage?: boolean
		consentCookieName?: string
		consentCookieTimeoutInMilliseconds?: number
		trackingCookieNames?: string[]
		botsUserAgentRegexp?: RegExp
		delayBeforeRemoveInMilliseconds?: number
	} = {},
) {
	const {
		bannerElement,
		acceptButtonElement,
		rejectButtonElement,
		moreLinkElement,
	} = htmlElements

	const {
		onAccept,
		onReject = () => { /* noop */ },
	} = hooks

	const {
		mustWaitExplicitAccept = true,
		useLocalStorage = false,
		consentCookieName = 'hasConsent',
		consentCookieTimeoutInMilliseconds = 31104000000, // 12 months in milliseconds
		trackingCookieNames = ['__utma', '__utmb', '__utmc', '__utmt', '__utmv', '__utmz', '_ga', '_gat', '_gid'],
		botsUserAgentRegexp = /bot|crawler|spider|crawling/i,
		delayBeforeRemoveInMilliseconds = 0,
	} = options

	const bannerClassPrefix = 'cookies-eu-banner--'

	const banner = {

		/**
		 * Show banner at the top of the page
		 */
		showBanner: function () {
			// Variables for minification optimization
			const addClickListener = banner.addClickListener

			bannerElement.style.display = ''

			if (moreLinkElement !== undefined) {
				addClickListener(moreLinkElement, function () {
					banner.deleteCookie(consentCookieName)
				})
			}

			if (acceptButtonElement !== undefined) {
				addClickListener(acceptButtonElement, function () {
					banner.remove()
					banner.setConsent(true)
					onAccept()
				})
			}

			if (rejectButtonElement !== undefined) {
				addClickListener(rejectButtonElement, function () {
					banner.remove()
					banner.setConsent(false)

					// Delete existing tracking cookies
					trackingCookieNames.map(banner.deleteCookie)

					onReject()
				})
			}
		},

		/**
		 * Set consent cookie or localStorage
		 */
		setConsent: function (hasConsent: boolean) {
			if (useLocalStorage) {
				return localStorage.setItem(consentCookieName, hasConsent.toString())
			}

			this.setCookie(consentCookieName, hasConsent.toString())
		},

		/**
		 * Check if user already consent
		 */
		hasConsent: function () {
			const isCookieSetTo = function (value: string) {
				return document.cookie.indexOf(consentCookieName + '=' + value) > -1 || localStorage.getItem(consentCookieName) === value
			}

			if (isCookieSetTo('true')) {
				return true
			}

			if (isCookieSetTo('false')) {
				return false
			}

			return null
		},

		/**
		 * Create/update cookie
		 */
		setCookie: function (name: string, value: string) {
			const date = new Date()
			date.setTime(date.getTime() + consentCookieTimeoutInMilliseconds)

			document.cookie = name + '=' + value + ';expires=' + date.toUTCString() + ';path=/' + ';secure;SameSite=Lax'
		},

		/**
		 * Delete cookie by changing expire
		 */
		deleteCookie: function (name: string) {
			const hostname = document.location.hostname.replace(/^www\./, '')
			const commonSuffix = '; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/'

			document.cookie = name + '=; domain=.' + hostname + commonSuffix
			document.cookie = name + '=' + commonSuffix
		},

		addClickListener: function (DOMElement: HTMLElement, callback: () => void) {
			DOMElement.addEventListener('click', callback)
		},

		/**
		 * Delays removal of banner allowing
		 * use of transition effects
		 */
		remove: function (delayInMilliseconds = delayBeforeRemoveInMilliseconds) {
			bannerElement.classList.add(`${bannerClassPrefix}before-remove`)

			setTimeout(() => {
				bannerElement.parentNode?.removeChild(bannerElement)
			}, delayInMilliseconds)
		},
	}

	// Init
	;(function () {
		// Detect if the visitor is a bot or not
		// Prevent for search engine take the cookie alert message as main content of the page
		const isBot = botsUserAgentRegexp.test(navigator.userAgent)

		// Check if DoNotTrack is activated (Deprecated, but it's almost free to implement it)
		const hasDoNotTrackEnabled = navigator.doNotTrack === '1'

		// Do nothing if it is a bot
		// If DoNotTrack is activated, do nothing too
		if (isBot || hasDoNotTrackEnabled || banner.hasConsent() === false) {
			banner.remove(0)
			onReject()
			return false
		}

		// User has already consented to use cookies to tracking
		if (banner.hasConsent() === true) {
			// Launch user custom function
			onAccept()
			return true
		}

		// If it's not a bot, no DoNotTrack and not already accept, so show banner
		banner.showBanner()

		if (!mustWaitExplicitAccept) {
			// Accept cookies by default for the next page
			banner.setConsent(true)
		}
	})()

	return banner
}

export {
	createCookiesBanner,
}
