# Cookies EU banner

Manage display of banner to accept/reject cookies from tracking services like Google Analytics.


## Installation

### Get the script

Using bower : `bower install cookies-eu-banner --save`  
Or using npm : `npm install cookies-eu-banner --save`  
Or [download the latest version](https://github.com/Alex-D/cookies-eu-banner/archive/master.zip).


### In your pages

Insert the banner before any content at the beginning of the `<body>` element, with these IDs:

```html
<div id="cookies-eu-banner" style="display: none;">
    By continuing your visit to this site, you accept the use of cookies by Google Analytics to make visits statistics.
    <a href="./read-more.html" id="cookies-eu-more">Read more</a>
    <button id="cookies-eu-reject">Reject</button>
    <button id="cookies-eu-accept">Accept</button>
</div>
```


- `#cookies-eu-banner` is the div that contains all elements to be hidden after user accepts or declines the use of cookies;
- `#cookies-eu-more` is a link to a "Read more" page where you explain your use of cookies;
- `#cookies-eu-reject` and `#cookies-eu-accept` are the buttons used to reject/accept cookies.


Before the end of `<body>`, or in a script file inserted at the same place, put the following code:

```html
<script src="./bower_components/cookies-eu-banner/dist/cookies-eu-banner.min.js"></script>
<script>
    new CookiesEuBanner(function(){
        // Your code to launch when user accept cookies
    });
</script>
```

Example for Google Analytics:

```html
<script src="./bower_components/cookies-eu-banner/dist/cookies-eu-banner.min.js"></script>
<script>
    new CookiesEuBanner(function(){
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

        // Don't forget to put your own UA-XXXXXXXX-X code
        ga('create', 'UA-XXXXXXXX-X', 'auto');
        ga('send', 'pageview');
    });
</script>
```

### Options

#### waitAccept

```html
<script>
    new CookiesEuBanner(function(){
        // Your code to launch when user accept cookies
    }, true);
</script>
```

The second parameter (`true` in the example over it) defined if Cookie EU banner wait the user acceptation before hide the banner. Set to `false` by default.


## How does it works?

For a detailed explaination, see comments in the main file : [cookies-eu-banner.js](cookies-eu-banner.js).

In short:

1. Excludes bots, clients who have DoNotTrack activated, and users who have already declined;
2. Runs your custom function if user has already accepted;
3. Shows banner, then:
    - if user accepts, run custom function and put a cookie to save this acceptance;
    - if user declines, remove all Google Analytics cookies and put a cookie to save this rejection.


## Functionalities

- Do Not Track detection (IE9+, Firefox, and all browsers compatible with the `navigator.doNotTrack` JavaScript variable);
- Disables banner when visitor is a bot : prevents SEO Engines to confuse your cookie advert message with the main content of your pages;
- Respects [all points imposed by CNIL (FR)](http://www.cnil.fr/vos-obligations/sites-web-cookies-et-autres-traceurs/outils-et-codes-sources/la-mesure-daudience/) and [these points](http://www.cnil.fr/vos-obligations/sites-web-cookies-et-autres-traceurs/que-dit-la-loi/).


## Contribute

This project use a Gulpfile, to use it, you need to have [node.js](http://nodejs.org/) and npm (included in node.js installation). Then, in the Cookies EU banner folder, run these commands:

```console
npm install
npm install -g gulp
gulp build
```

The first line install all dependancies listed in `package.json`. Second line install gulp as command, so you could now launch the third line which build the project.


## Supported browsers

All navigators which supports JavaScript. Take a look at [navigators that implements DoNotTrack](http://donottrack.us/).
