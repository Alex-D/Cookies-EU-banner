# Cookies CNIL banner

Manage display of banner to accept/reject cookies from tracking services like Google Analytics.


## Installation

Before the end of your `<body>`, or in a script file inserted at the same place, insert that:

```html
<script>
    new CookiesCnilBanner(function(){
        // Your code to launch when user accept cookies
    });
</script>
```

Exemple for Google Analaytics:

```html
<script>
    new CookiesCnilBanner(function(){
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

Insert the banner before all content at the beginning of the `<body>` element, with this IDs:

```html
<div id="cookies-cnil-banner" style="display: none;">
    En poursuivant votre navigation sur ce site, vous acceptez l'utilisation de cookies par Google Analytics pour réaliser des statistiques de visites.
    <a href="./en-savoir-plus.html" id="cookies-cnil-more">En savoir plus</a>
    <button id="cookies-cnil-reject">Je refuse</button>
    <button id="cookies-cnil-accept">J'accepte</button>
</div>
```

- `#cookies-cnil-banner` is the div contain all elements to hide within user has accept/decline;
- `#cookies-cnil-more` is this link go to the "Read more" page which explains how you use cookies;
- `#cookies-cnil-reject` and `#cookies-cnil-accept` to reject/accept cookies.


## How it's works?

For a detailed explaination, see comments in the main file : [cookies-cnil-banner.js](cookies-cnil-banner.js).

In short:

1. Exclude bots, client has activated DoNotTrack and users has already decline;
2. Launch your custom function if user has already accept;
3. Show banner, then:
    - if user accept, launch custom function and put a cookie to save this acceptance;
    - if user decline, remove all Google Analytics cookies and put a cookie to save this rejection.


## Functionalities

- Do Not Track detection
- Disable banner when visitor is a bot : prevent from SEO Engine to get your cookie advert message like main content of your pages
- Respect [all points imposed by CNIL (FR)](http://www.cnil.fr/vos-obligations/sites-web-cookies-et-autres-traceurs/outils-et-codes-sources/la-mesure-daudience/).


## Supported browser

All navigators support JavaScript. Take a look at [navigators that implements DoNotTrack](http://donottrack.us/).