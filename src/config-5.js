/**
 * Additionl video.js configuration specifically for the CDN version
 */
;(function(window){
  var videojs = window && window.videojs;

  if (!videojs) return;

  // Set the swf location to the hosted swf of the correct version
  var ACCESS_PROTOCOL = ('https:' === window.location.protocol ? 'https://' : 'http://');

  videojs.options.flash.swf = ACCESS_PROTOCOL+'vjs.zencdn.net/swf/__SWF_VERSION__/video-js.swf';

})(window);
