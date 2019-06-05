'use strict';

if (window.location.href.indexOf('index.html') > 0) {
  window.location = window.location.href.replace('index.html', '');
}

if (typeof hljs !== 'undefined') {
  hljs.initHighlightingOnLoad();
}

/* Loads JS and CSS depending on domain (github or localhost) */
var baseURL = window.location.hostname.indexOf('github.') !== -1 ? '//rawcdn.githack.com/Alex-D/Cookies-EU-banner/2.0.0/' : '../../../';
document.write('<link rel="stylesheet" href="' + baseURL + 'css/cookies-eu-banner.default.css"/>');
document.write('<script src="' + baseURL + 'dist/cookies-eu-banner.min.js"></script>');

/* Google Analytics */
// jshint ignore:start
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('set', 'anonymizeIp', true);
ga('create', 'UA-35470243-2', 'auto');
ga('send', 'pageview');
