/**
 * Additional video.js configuration specifically for the CDN version
 */
;(function(window){
  var videojs = window && window.videojs;

  if (!videojs) return;

  // Add the specific CDN url version for tracking in the analytics
  // Automatically replaced at build
  videojs.CDN_VERSION = '__CDN_VERSION__';
})(window);
