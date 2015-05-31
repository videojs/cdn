# Video.js CDN - vjs.zencdn.net

The Video.js CDN hosts updated copies of the various files
needed for the player.

See [videojs.com](http://www.videojs.com) for more info on using those files. The following instructions are for CDN admins.

## Updating and publishing modules

First update the specific module you want to publish a new version of.

```bash
npm install video.js
npm install videojs-swf
npm install videojs-font
npm install videojs-ie8

# You can also install specific versions to be published
npm install video.js@5.0.1
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

You can also update the major and minor url versions that are meant to auto-update.

- Minor versions should get all patch releases
- Major versions should get all minor and patch releases
- Patch releases should never change

```bash
# vjs.zencdn.net/5/video.js
grunt publish:videojs:major

# vjs.zencdn.net/5.x/video.js
grunt publish:videojs:minor

# vjs.zencdn.net/5.x.x/video.js
# Same as leaving off the release type
grunt publish:videojs:patch
```

## Setup

The following envirnoment variables are expected by the tasks.
Add them to your bash_profile and replace the values with
ones you get from another CDN admin.

> NEVER ADD THESE TO ANY FILES IN THE REPO

```
export VJS_S3_KEY='AWS KEY'
export VJS_S3_SECRET='AWS SECRET'
export VJS_S3_BUCKET='AWS S3 BUCKET NAME'
export VJS_S3_ACCESS='public-read'
export VJS_FASTLY_API_KEY='FASTLY API KEY'
```
