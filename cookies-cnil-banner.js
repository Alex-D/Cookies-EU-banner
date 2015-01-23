;var CookiesCnilBanner;

(function(navigator, window, document){
	CookiesCnilBanner = function(launchFunction){
		if(!(this instanceof CookiesCnilBanner)){
	        return new CookiesCnilBanner(launchFunction);
		}

		this.cookieTimeout = 33696000000; // 13 months in milliseconds
		this.bots = /bot|googlebot|crawler|spider|robot|crawling/i;
		this.trackingCookiesNames = ["__utma","__utmb","__utmc","__utmt","__utmv","__utmz","_ga","_gat"];
		this.launchFunction = launchFunction;
		this.init();
	};

	CookiesCnilBanner.prototype = {
		init: function(){
			// Do nothing if it is a bot
			// If DoNotTrack is activated, do nothing too
			if(this.isBot() || !this.isToTrack() || this.hasConsent() === false){
				return false;
			}

			// User has already consent to use cookies to tracking
			if(this.hasConsent() === true){
				// Launch user custom function
				this.launchFunction();
				return true;
			}

			// If it's not a bot, no DoNotTrack and not already accept : show banner
			this.showBanner();

			// By default, accept cookies for the next if user do nothing
			this.setCookie('hasConsent', true);
		},

		/*
		 * Check if user already consent
		 */
		hasConsent: function(){
			if(document.cookie.indexOf("hasConsent=true") > -1){
				return true;
			} else if(document.cookie.indexOf("hasConsent=false") > -1){
				return false;
			}
			return null;
		},

		/*
		 * Detect if the visitor is a bot or not
		 * Prevent for search engine take the cookie
		 * alert message as main content of the page
		 */
		isBot: function(){
			return this.bots.test(navigator.userAgent);
		},

		/*
		 * Check if DoNotTrack is activated
		 */
	    isToTrack: function() {
	    	var dnt = navigator.doNotTrack || navigator.msDoNotTrack || window.doNotTrack;
	        return (dnt !== undefined) ? (dnt && dnt !== 'yes' && dnt !== 1 && dnt !== "1") : true;
	    },

	    /*
	     * Delete existants tracking cookies
	     */
	    deleteTrackingCookies: function(){
	    	var name;
	    	for(name in this.trackingCookiesNames){
	    		this.deleteCookie(name);
	    	}
	    },

	    setCookie: function(name, value){
		    var date = new Date();
		    date.setTime(date.getTime() + this.cookieTimeout);

	    	document.cookie = name + "=" + hasconsent + "; expires=" + date.toGMTString() + "; path=/";
	    },

	    deleteCookie: function(name){
	        var hostname = document.location.hostname;
	        if(hostname.indexOf("www.") === 0){
	            hostname = hostname.substring(4);
	        }     
	        document.cookie = name + "=;path=/;domain=." + hostname + ";expires=Thu, 01-Jan-1970 00:00:01 GMT";
	    }
	};
})(navigator, window, document);