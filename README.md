# Video.js CDN - http://vjs.zencdn.net/

## Updating and publishing modules

First update the specific module you want to publish a new version of.

```bash
npm install video.js
npm install videojs-swf
npm install videojs-font
npm install videojs-ie8
```

Then run the grunt task to publish that module

```bash
# vjs.zencdn.net/5.x.x/video.js
grunt publish:videojs

# vjs.zencdn.net/swf/4.x.x/video-js.swf
grunt publish:swf

# vjs.zencdn.net/font/1.x.x/VideoJS.ttf
grunt publish:font

# vjs.zencdn.net/ie8/videojs-ie8.js
grunt publish:ie8
```

You can also update the major and minor auto-updating versions

```bash
# vjs.zencdn.net/5/video.js
grunt publish:videojs:major

# vjs.zencdn.net/5.x/video.js
grunt publish:videojs:minor

# vjs.zencdn.net/5.x.x/video.js
# Same as leaving off the release type
grunt publish:videojs:patch
```
