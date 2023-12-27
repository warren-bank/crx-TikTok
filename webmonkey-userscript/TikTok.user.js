// ==UserScript==
// @name         TikTok
// @description  Watch videos in external player.
// @version      2.0.0
// @include      /^https?:\/\/(?:[^\.\/]*\.)*tiktok\.com\/.*$/
// @icon         https://www.tiktok.com/favicon.ico
// @run-at       document-end
// @grant        unsafeWindow
// @homepage     https://github.com/warren-bank/crx-TikTok/tree/webmonkey-userscript/es5
// @supportURL   https://github.com/warren-bank/crx-TikTok/issues
// @downloadURL  https://github.com/warren-bank/crx-TikTok/raw/webmonkey-userscript/es5/webmonkey-userscript/TikTok.user.js
// @updateURL    https://github.com/warren-bank/crx-TikTok/raw/webmonkey-userscript/es5/webmonkey-userscript/TikTok.user.js
// @namespace    warren-bank
// @author       Warren Bank
// @copyright    Warren Bank
// ==/UserScript==

// ----------------------------------------------------------------------------- constants

var user_options = {
  "webmonkey": {
    "post_intent_redirect_to_url":  "about:blank"
  },
  "greasemonkey": {
    "redirect_to_webcast_reloaded": true,
    "force_http":                   true,
    "force_https":                  false
  }
}

var constants = {
  "dom_classes": {
    "div_webcast_icons":           "icons-container"
  },
  "img_urls": {
    "base_webcast_reloaded_icons": "https://github.com/warren-bank/crx-webcast-reloaded/raw/gh-pages/chrome_extension/2-release/popup/img/"
  }
}

// ----------------------------------------------------------------------------- helpers

var make_element = function(elementName, html) {
  var el = unsafeWindow.document.createElement(elementName)

  if (html)
    el.innerHTML = html

  return el
}

// ----------------------------------------------------------------------------- URL links to tools on Webcast Reloaded website

var get_webcast_reloaded_url = function(video_url, caption_url, referer_url, force_http, force_https) {
  force_http  = (typeof force_http  === 'boolean') ? force_http  : user_options.greasemonkey.force_http
  force_https = (typeof force_https === 'boolean') ? force_https : user_options.greasemonkey.force_https

  var encoded_video_url, encoded_caption_url, encoded_referer_url, webcast_reloaded_base, webcast_reloaded_url

  encoded_video_url     = encodeURIComponent(encodeURIComponent(btoa(video_url)))
  encoded_caption_url   = caption_url ? encodeURIComponent(encodeURIComponent(btoa(caption_url))) : null
  referer_url           = referer_url ? referer_url : unsafeWindow.location.href
  encoded_referer_url   = encodeURIComponent(encodeURIComponent(btoa(referer_url)))

  webcast_reloaded_base = {
    "https": "https://warren-bank.github.io/crx-webcast-reloaded/external_website/index.html",
    "http":  "http://webcast-reloaded.surge.sh/index.html"
  }

  webcast_reloaded_base = (force_http)
                            ? webcast_reloaded_base.http
                            : (force_https)
                               ? webcast_reloaded_base.https
                               : (video_url.toLowerCase().indexOf('http:') === 0)
                                  ? webcast_reloaded_base.http
                                  : webcast_reloaded_base.https

  webcast_reloaded_url  = webcast_reloaded_base + '#/watch/' + encoded_video_url + (encoded_caption_url ? ('/subtitle/' + encoded_caption_url) : '') + '/referer/' + encoded_referer_url
  return webcast_reloaded_url
}

// ----------------------------------------------------------------------------- URL redirect

var process_video_data = function(data) {
  if (!data.video_url) return

  if (!data.referer_url)
    data.referer_url = unsafeWindow.location.href

  if (typeof GM_startIntent === 'function') {
    // running in Android-WebMonkey: open Intent chooser

    if (!data.video_type)
      data.video_type = get_video_type(data.video_url)

    var args = [
      /* action = */ 'android.intent.action.VIEW',
      /* data   = */ data.video_url,
      /* type   = */ data.video_type
    ]

    // extras:
    if (data.caption_url) {
      args.push('textUrl')
      args.push(data.caption_url)
    }
    if (data.referer_url) {
      args.push('referUrl')
      args.push(data.referer_url)
    }
    if (data.drm instanceof Object) {
      if (data.drm.scheme) {
        args.push('drmScheme')
        args.push(data.drm.scheme)
      }
      if (data.drm.server) {
        args.push('drmUrl')
        args.push(data.drm.server)
      }
      if (data.drm.headers instanceof Object) {
        var drm_header_keys, drm_header_key, drm_header_val

        drm_header_keys = Object.keys(data.drm.headers)
        for (var i=0; i < drm_header_keys.length; i++) {
          drm_header_key = drm_header_keys[i]
          drm_header_val = data.drm.headers[drm_header_key]

          args.push('drmHeader')
          args.push(drm_header_key + ': ' + drm_header_val)
        }
      }
    }

    GM_startIntent.apply(this, args)
    process_webmonkey_post_intent_redirect_to_url()
    return true
  }
  else if (user_options.greasemonkey.redirect_to_webcast_reloaded) {
    // running in standard web browser: redirect URL to top-level tool on Webcast Reloaded website

    redirect_to_url(get_webcast_reloaded_url(data.video_url, data.caption_url, data.referer_url))
    return true
  }
  else {
    return false
  }
}

var process_webmonkey_post_intent_redirect_to_url = function() {
  var url = null

  if (typeof user_options.webmonkey.post_intent_redirect_to_url === 'string')
    url = user_options.webmonkey.post_intent_redirect_to_url

  if (typeof user_options.webmonkey.post_intent_redirect_to_url === 'function')
    url = user_options.webmonkey.post_intent_redirect_to_url()

  if (typeof url === 'string')
    redirect_to_url(url)
}

var redirect_to_url = function(url) {
  if (!url) return

  if (typeof GM_loadUrl === 'function') {
    if (typeof GM_resolveUrl === 'function')
      url = GM_resolveUrl(url, unsafeWindow.location.href) || url

    GM_loadUrl(url, 'Referer', unsafeWindow.location.href)
  }
  else {
    try {
      unsafeWindow.top.location = url
    }
    catch(e) {
      unsafeWindow.window.location = url
    }
  }
}

var get_video_type = function(video_url) {
  video_url = video_url.toLowerCase()

  return (video_url.indexOf('.m3u8') >= 0)
    ? 'application/x-mpegurl'
    : (video_url.indexOf('.mpd') >= 0)
      ? 'application/dash+xml'
      : 'video/mp4'
}

// -------------------------------------

var process_video_url = function(video_url, video_type, caption_url, referer_url) {
  var data = {
    drm: {
      scheme:    null,
      server:    null,
      headers:   null
    },
    video_url:   video_url   || null,
    video_type:  video_type  || null,
    caption_url: caption_url || null,
    referer_url: referer_url || null
  }

  process_video_data(data)
}

// ------------------------------------- helpers (unused)

var process_hls_data = function(data) {
  data.video_type = 'application/x-mpegurl'
  process_video_data(data)
}

var process_dash_data = function(data) {
  data.video_type = 'application/dash+xml'
  process_video_data(data)
}

var process_mp4_data = function(data) {
  data.video_type = 'video/mp4'
  process_video_data(data)
}

// ------------------------------------- helpers (unused)

var process_hls_url = function(video_url, caption_url, referer_url) {
  process_video_url(video_url, /* video_type= */ 'application/x-mpegurl', caption_url, referer_url)
}

var process_dash_url = function(video_url, caption_url, referer_url) {
  process_video_url(video_url, /* video_type= */ 'application/dash+xml', caption_url, referer_url)
}

var process_mp4_url = function(video_url, caption_url, referer_url) {
  process_video_url(video_url, /* video_type= */ 'video/mp4', caption_url, referer_url)
}

// ----------------------------------------------------------------------------- update DOM

var get_webcast_reloaded_url_chromecast_sender = function(video_url, vtt_url, referer_url) {
  return get_webcast_reloaded_url(video_url, vtt_url, referer_url, /* force_http= */ null, /* force_https= */ null).replace('/index.html', '/chromecast_sender.html')
}

var get_webcast_reloaded_url_airplay_sender = function(video_url, vtt_url, referer_url) {
  return get_webcast_reloaded_url(video_url, vtt_url, referer_url, /* force_http= */ true, /* force_https= */ false).replace('/index.html', '/airplay_sender.es5.html')
}

var get_webcast_reloaded_url_proxy = function(hls_url, vtt_url, referer_url) {
  return get_webcast_reloaded_url(hls_url, vtt_url, referer_url, /* force_http= */ true, /* force_https= */ false).replace('/index.html', '/proxy.html')
}

var make_webcast_reloaded_div = function(video_url, vtt_url, referer_url) {
  var webcast_reloaded_urls = {
//  "index":             get_webcast_reloaded_url(                  video_url, vtt_url, referer_url),
    "chromecast_sender": get_webcast_reloaded_url_chromecast_sender(video_url, vtt_url, referer_url),
    "airplay_sender":    get_webcast_reloaded_url_airplay_sender(   video_url, vtt_url, referer_url),
    "proxy":             get_webcast_reloaded_url_proxy(            video_url, vtt_url, referer_url)
  }

  var div = make_element('div')

  var html = [
    '<a target="_blank" class="chromecast" href="' + webcast_reloaded_urls.chromecast_sender + '" title="Chromecast Sender"><img src="'       + constants.img_urls.base_webcast_reloaded_icons + 'chromecast.png"></a>',
    '<a target="_blank" class="airplay" href="'    + webcast_reloaded_urls.airplay_sender    + '" title="ExoAirPlayer Sender"><img src="'     + constants.img_urls.base_webcast_reloaded_icons + 'airplay.png"></a>',
    '<a target="_blank" class="proxy" href="'      + webcast_reloaded_urls.proxy             + '" title="HLS-Proxy Configuration"><img src="' + constants.img_urls.base_webcast_reloaded_icons + 'proxy.png"></a>',
    '<a target="_blank" class="video-link" href="' + video_url                               + '" title="direct link to video"><img src="'    + constants.img_urls.base_webcast_reloaded_icons + 'video_link.png"></a>'
  ]

  div.setAttribute('class', constants.dom_classes.div_webcast_icons)
  div.innerHTML = html.join("\n")

  return div
}

var insert_webcast_reloaded_div = function(block_element, video_url, vtt_url, referer_url) {
  var webcast_reloaded_div = make_webcast_reloaded_div(video_url, vtt_url, referer_url)

  if (block_element.childNodes.length)
    block_element.insertBefore(webcast_reloaded_div, block_element.childNodes[0])
  else
    block_element.appendChild(webcast_reloaded_div)
}

var insert_webcast_reloaded_css = function() {
  var css = [
    'body > div.icons-container {',
    '  display: block;',
    '  position: absolute;',
    '  z-index: 9999;',
    '  top: 0;',
    '  left: 150px;',
    '  width: 60px;',
    '  height: 60px;',
    '  max-height: 60px;',
    '  vertical-align: top;',
    '  background-color: #d7ecf5;',
    '  border: 1px solid #000;',
    '  border-radius: 14px;',
    '}',

    'body > div.icons-container > a.chromecast,',
    'body > div.icons-container > a.chromecast > img,',
    'body > div.icons-container > a.airplay,',
    'body > div.icons-container > a.airplay > img,',
    'body > div.icons-container > a.proxy,',
    'body > div.icons-container > a.proxy > img,',
    'body > div.icons-container > a.video-link,',
    'body > div.icons-container > a.video-link > img {',
    '  display: block;',
    '  width: 25px;',
    '  height: 25px;',
    '}',

    'body > div.icons-container > a.chromecast,',
    'body > div.icons-container > a.airplay,',
    'body > div.icons-container > a.proxy,',
    'body > div.icons-container > a.video-link {',
    '  position: absolute;',
    '  z-index: 1;',
    '  text-decoration: none;',
    '}',

    'body > div.icons-container > a.chromecast,',
    'body > div.icons-container > a.airplay {',
    '  top: 0;',
    '}',
    'body > div.icons-container > a.proxy,',
    'body > div.icons-container > a.video-link {',
    '  bottom: 0;',
    '}',

    'body > div.icons-container > a.chromecast,',
    'body > div.icons-container > a.proxy {',
    '  left: 0;',
    '}',
    'body > div.icons-container > a.airplay,',
    'body > div.icons-container > a.video-link {',
    '  right: 0;',
    '}',
    'body > div.icons-container > a.airplay + a.video-link {',
    '  right: 17px; /* (60 - 25)/2 to center when there is no proxy icon */',
    '}'
  ]

  var body  = unsafeWindow.document.body
  var style = make_element('style', css.join("\n"))

  body.appendChild(style)
}

var update_DOM = function(video_url) {
  var body = unsafeWindow.document.body

  insert_webcast_reloaded_div(/* block_element= */ body, video_url, /* vtt_url= */ null, /* referer_url= */ null)
  insert_webcast_reloaded_css()
}

// ----------------------------------------------------------------------------- process video

var process_page = function() {
  var video_data  = get_video_data()
  var isWebMonkey = (typeof GM_startIntent === 'function')

  if (video_data.video_url) {
    if (isWebMonkey)
      process_video_url(video_data.video_url, video_data.video_type)
    else
      update_DOM(video_data.video_url)
  }
}

var get_video_data = function() {
  var video_data = {}

  try {
    var script
    script = unsafeWindow.document.querySelector('script[type="application/json"]#__UNIVERSAL_DATA_FOR_REHYDRATION__')
    script = script.innerHTML
    script = JSON.parse(script)

    var video, video_url, video_type
    video      = script['__DEFAULT_SCOPE__']['webapp.video-detail'].itemInfo.itemStruct.video
    video_url  = video.playAddr
    video_type = video.format

    if (video_url) {
      if (video_type) {
        switch(video_type.toLowerCase()) {
          case 'mp4':
            video_url += '#video.mp4'
            video_type = 'video/mp4'
            break
          case 'hls':
            video_url += '#video.m3u8'
            video_type = 'application/x-mpegurl'
            break
          case 'dash':
            video_url += '#video.mpd'
            video_type = 'application/dash+xml'
            break
          default:
            video_type = ''
            break
        }
      }

      video_data.video_url  = video_url
      video_data.video_type = video_type
    }
  }
  catch(e) {}

  return video_data
}

// ----------------------------------------------------------------------------- bootstrap

var init = function() {
  // on page load
  if (is_video_page(unsafeWindow.location.href)) {
    process_page()
  }

  if (unsafeWindow.history) {
    var real = {
      pushState:    unsafeWindow.history.pushState,
      replaceState: unsafeWindow.history.replaceState
    }

    unsafeWindow.history.pushState = function(state, title, url) {
      process_site_url(url)
      real.pushState.apply(unsafeWindow.history, [state, title, url])
    }

    unsafeWindow.history.replaceState = function(state, title, url) {
      process_site_url(url)
      real.replaceState.apply(unsafeWindow.history, [state, title, url])
    }
  }

  unsafeWindow.document.body.classList.add("rai-player-opened")
}

var is_video_page = function(url) {
  var url_regex = /^https?:\/\/(?:[^\.\/]*\.)*tiktok\.com\/@[^\/]+\/video\/[^\/]+$/

  return url_regex.test(url)
}

var process_site_url = function(url) {
  url = resolve_url(url)

  if ((url !== unsafeWindow.location.href) && is_video_page(url))
    redirect_to_url(url)
}

var resolve_url = function(url) {
  if (url.substring(0, 4).toLowerCase() === 'http')
    return url

  if (url.substring(0, 2) === '//')
    return unsafeWindow.location.protocol + url

  if (url.substring(0, 1) === '/')
    return unsafeWindow.location.protocol + '//' + unsafeWindow.location.host + url

  return unsafeWindow.location.protocol + '//' + unsafeWindow.location.host + unsafeWindow.location.pathname.replace(/[^\/]+$/, '') + url
}

init()
