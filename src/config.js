/**
 * Additionl video.js configuration specifically for the CDN version
 */
;(function(window){
  var videojs = window && window.videojs;

  if (!videojs) return;

  // Add the specific CDN url version for tracking in the analytics
  // Automatically replaced at build
  videojs.CDN_VERSION = '__CDN_VERSION__';

  // Set the swf location to the hosted swf of the correct version
  var ACCESS_PROTOCOL = ('https:' === window.location.protocol ? 'https://' : 'http://');

  videojs.setGlobalOptions({
    flash: {
      swf: ACCESS_PROTOCOL+'vjs.zencdn.net/swf/'+videojs.SWF_VERSION+'/video-js.swf'
    }
  });

})(window);
