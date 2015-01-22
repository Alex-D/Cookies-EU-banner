;var CookiesCnilBanner;

(function(navigator, window, document){
	CookiesCnilBanner = function(launchFunction){
		this.bots = /bot|googlebot|crawler|spider|robot|crawling/i;
		this.trackingCookiesNames = ["__utma","__utmb","__utmc","__utmt","__utmv","__utmz","_ga","_gat"];
		this.launchFunction = launchFunction;
		this.init();
	};

	CookiesCnilBanner.prototype = {
		init: function(){
			// Do nothing if it is a bot
			// If DoNotTrack is activated, do nothing too
			if(this.isBot() || !this.isToTrack()){
				return false;
			}

			this.launchFunction();
		},

		/*
		 * Check if user already consent
		 */
		hasConsent: function(){
			return document.cookie.indexOf("hasConsent=true") > -1;
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

	    	}
	    },

	    deleteCookie: function(name){
	        var hostname = document.location.hostname;
	        if(hostname.indexOf("www.") === 0){
	            hostname = hostname.substring(4);
	        }
	        var domain = ";domain=" + "."+hostname;
	        var expiration = "Thu, 01-Jan-1970 00:00:01 GMT";       
	        document.cookie = name + "=;path=/" + domain + ";expires=Thu, 01-Jan-1970 00:00:01 GMT";
	    }
	};
})(navigator, window, document);