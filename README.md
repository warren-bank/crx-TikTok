### [TikTok](https://github.com/warren-bank/crx-TikTok/tree/webmonkey-userscript/es5)

[Userscript](https://github.com/warren-bank/crx-TikTok/raw/webmonkey-userscript/es5/webmonkey-userscript/TikTok.user.js) for [tiktok.com](https://www.tiktok.com/) to run in both:
* the [WebMonkey](https://github.com/warren-bank/Android-WebMonkey) application for Android
* the [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) web browser extension for Chrome/Chromium

Its purpose is to:
* on a page for a video:
  - in WebMonkey:
    * redirect the video stream to an external player
  - in Tampermonkey:
    * update the DOM with 4x icons
      - added to the top of the page, to the right of the _TikTok_ site logo
      - each icon redirects the video stream to a unique webpage on an external site
        * ![icon](https://github.com/warren-bank/crx-webcast-reloaded/raw/gh-pages/chrome_extension/2-release/popup/img/chromecast.png) Chromecast Sender
        * ![icon](https://github.com/warren-bank/crx-webcast-reloaded/raw/gh-pages/chrome_extension/2-release/popup/img/airplay.png) [ExoAirPlayer](https://github.com/warren-bank/Android-ExoPlayer-AirPlay-Receiver) Sender
        * ![icon](https://github.com/warren-bank/crx-webcast-reloaded/raw/gh-pages/chrome_extension/2-release/popup/img/proxy.png) [HLS-Proxy](https://github.com/warren-bank/HLS-Proxy) Configuration
        * ![icon](https://github.com/warren-bank/crx-webcast-reloaded/raw/gh-pages/chrome_extension/2-release/popup/img/video_link.png) direct link to video

#### Legal:

* copyright: [Warren Bank](https://github.com/warren-bank)
* license: [GPL-2.0](https://www.gnu.org/licenses/old-licenses/gpl-2.0.txt)
