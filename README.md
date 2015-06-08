# Video.js CDN - vjs.zencdn.net

Sponsored by [Fastly](https://www.fastly.com)!

The Video.js CDN hosts updated copies of the various files
needed for the player.

See [videojs.com](http://www.videojs.com) for more info on using those files. The following instructions are for CDN admins.

## Overview

The CDN hosts copies of Video.js and its hosted dependencies.
  - **video.js** - /version/video.js (includes most of dist)
  - **videojs-swf** - /swf/version/video-js.swf
  - **videojs-font** - /font/version/*
  - **videojs-ie8** - /ie8/version/*

For Video.js we also provide auto-updating major and minor versions.

> NOTE: Only use the `/5/video.js` copy for testing. Do not use in production because the base CSS **will** change and other issues may occur. Similar to [jquery-latest](http://blog.jquery.com/2014/07/03/dont-use-jquery-latest-js/).

```
# Gets every patch and minor release for vidoe.js version 5
vjs.zencdn.net/5/video.js

# Gets every patch release for 5.[x]
vjs.zencdn.net/5.[x]/video.js
```

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

# vjs.zencdn.net/ie8/1.x.x/videojs-ie8.js
grunt publish:ie8
```

If this is the latest **non-prelease** version of Video.js,
also run the `grunt publish:videojs:latest` command

```
# Update the major (/5/) and minor (/5.x/) CDN copies with the latest version
# Also puts the package.json at the root of the CDN
grunt publish:videojs:latest
```

You can also update the major and minor url versions manually.

- Minor versions should get all patch releases (except prereleases)
- Major versions should get all minor and patch releases (except prereleases)
- **Patch releases should never change, including hosted dependencies**

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
