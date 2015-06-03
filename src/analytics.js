/**
 * Google Analytics tracking pixel for the freely hosted version of Video.js
 * at vjs.zencdn.net. We'll use this data to develop a support matrix of
 * browsers and devices, and possibly track errors.
 *
 * This code generates the GA tracking URL without requiring the GA javascript
 * library.
 */
;(function(i,w,n,e,M,l,v){
  // Skip analytics if preferred
  if (!w || w.HELP_IMPROVE_VIDEOJS === false) return;

  // Track 1 in 100 player loads for brower and device stats.
  // Also Google Analytics has a limit of 10 million hits per month.
  // The Video.js CDN goes over this (by a lot) and they've asked us to stop.
  if (M.random() > 0.01) return;

  l=w.location;
  v=w.videojs || {};

  // Setting the source of an image will load the URL even without adding to dom
  // Using //www, still seems to work for https even though ssl.google is used by google
  i.src='//www.google-analytics.com/__utm.gif'
    // GA Version
    +'?utmwv=5.4.2'
    // ID
    +'&utmac=UA-16505296-3' // 5.0+ CDN
    // +'&utmac=UA-16505296-2' // 4.0 CDN
    // Sessions
    // &utms=2
    // Cache breaker (using utmcc to do this)
    +'&utmn='+1
    +'&utmhn='+e(l.hostname)
    // Encoding
    // &utmcs=UTF-8
    +'&utmsr='+w.screen.availWidth+'x'+w.screen.availHeight
    // Browser window
    // &utmvp=1057x1105
    // Color depth
    // &utmsc=24-bit
    +'&utmul='+(n.language||n.userLanguage||'').toLowerCase()
    // Java
    // &utmje=1
    // Flash version
    // &utmfl=11.7%20r700
    // Page title
    // &utmdt=HTML5%20Video%20Player%20%7C%20Video.js
    // Adsense
    // &utmhid=1112291628
    // Referrer, '-' is none
    // Using current page as referrer so stats show up cleaner than "Direct"
    +'&utmr='+e(l.href)
    +'&utmp='+e(l.hostname+l.pathname)
    // Current time stamp
    // &utmht=1370890439353
    // ?
    // &utmu=q
    // Cookies! Manually setting visitor ID and setting everything else to 1
    // Random number used as cache buster instead of utmn
    +'&utmcc=__utma%3D1.'+M.floor(M.random()*1e10)+'.1.1.1.1%3B'
    // Custom Var: vjsv is the variable name and 1.0.0 is the VJS version
    +'&utme=8(vjsv*cdnv)9('+v.VERSION+'*'+v.CDN_VERSION+')'
  ;
})(new Image(),window,navigator,encodeURIComponent,Math);
