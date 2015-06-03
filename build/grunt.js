module.exports = function(grunt) {
  require('time-grunt')(grunt);
  let semver = require('semver');

  // Configure the npm modules that we're publishing to the CDN
  var modules = {
    videojs: {
      root: true,
      moduleDir: './node_modules/video.js',
      distDir: './build/temp/video.js',
      src: ['video.js', 'video.min.js', 'video-js.css', 'video-js.min.css', 'lang/*']
    },
    swf: {
      moduleDir: './node_modules/videojs-swf',
      distDir: './node_modules/videojs-swf/dist',
      src: ['video-js.swf']
    },
    font: {
      moduleDir: './node_modules/videojs-font',
      distDir: './node_modules/videojs-font/fonts',
      src: ['**']
    },
    ie8: {
      moduleDir: './node_modules/videojs-ie8',
      distDir: './node_modules/videojs-ie8/dist',
      src: ['**']
    }
  };

  // Grunt config
  let config = {
    pkg: grunt.file.readJSON('./package.json'),
    aws_s3: {
      options: {
        accessKeyId: process.env.VJS_S3_KEY,
        secretAccessKey: process.env.VJS_S3_SECRET,
        bucket: process.env.VJS_S3_BUCKET,
        access: 'public-read',
        uploadConcurrency: 5
      }
    },
    fastly: {
      options: {
        key: process.env.VJS_FASTLY_API_KEY,
        host: 'vjs.zencdn.net'
      }
    },
    clean: {
      temp: ['build/temp/*']
    },
    copy: {
      videojs: {
        files: [
          { expand: true, cwd: 'node_modules/video.js/dist', src: modules.videojs.src, dest: 'build/temp/video.js', filter: 'isFile' }
        ]
      }
    },
    uglify: {
      options: {
        enclose: {},
        mangle: true,
        compress: { sequences: true, dead_code: true, conditionals: true, booleans: true, unused: true, if_return: true, join_vars: true, drop_console: true }
      },
      cdnjs: {
        files: {
          'build/temp/cdn.min.js': ['src/config.js', 'src/*']
        }
      }
    }
  };

  // Title the following version logging
  grunt.log.writeln('Current versions:');

  // Dynamically build the grunt config with tasks for publishing the files
  // and specific release types
  Object.keys(modules).forEach(function(moduleShortName){
    addPublishTasks(moduleShortName, modules[moduleShortName]);
  });

  function addPublishTasks(name, options={}){
    let modulePkg = grunt.file.readJSON(`${options.moduleDir}/package.json`);
    let version = modulePkg.version;

    if (!version) {
      throw new Error(`No package version found in ${options.moduleDir}`);
    }

    let cdnDir = '';
    let s3Dir = 'vjs/';

    grunt.log.writeln(name, version);

    if (!options.root) {
      cdnDir += `${name}/`;
      s3Dir += cdnDir;
    }

    let versionDirs = {
      major: semver.major(version),
      minor: semver.major(version) + '.' +semver.minor(version),
      patch: version
    };

    config.aws_s3[`${name}_patch`] = getS3TaskConfig('patch');
    config.aws_s3[`${name}_minor`] = getS3TaskConfig('minor');
    config.aws_s3[`${name}_major`] = getS3TaskConfig('major');

    config.fastly[`${name}_patch`] = getFastlyTaskConfig('patch');
    config.fastly[`${name}_minor`] = getFastlyTaskConfig('minor');
    config.fastly[`${name}_major`] = getFastlyTaskConfig('major');

    function getS3TaskConfig(releaseType='patch') {
      let versionDir = versionDirs[releaseType];

      // One year cache
      let maxAge = '31536000';

      if (releaseType !== 'patch')  {
        // Set cache length to a month for versions that will be upated
        maxAge = '2628000';
      }

      return {
        files: [
          {
            expand: true,
            cwd: `${options.distDir}`,
            src: options.src,
            dest: `${s3Dir}${versionDir}/`,
            params: { CacheControl: `public, max-age=${maxAge}` }
          }
        ]
      };
    }

    function getFastlyTaskConfig(releaseType='patch'){
      let versionDir = versionDirs[releaseType];

      return {
        options: {
          urls: [cdnDir + versionDir + '/*']
        }
      };
    }
  }

  grunt.initConfig(config);

  // load all the npm grunt tasks
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', function() {
    grunt.log.writeln('USAGE: grunt publish:moduleName:releaseType');
  });

  grunt.registerTask('publish', function(moduleName, releaseType='patch'){
    if (!moduleName) {
      throw new Error('No module name suppled. `grunt publish:module:releaseType`');
    }

    if (moduleName === 'videojs') {
      grunt.task.run('prepare_videojs');
    }

    grunt.task.run([`aws_s3:${moduleName}_${releaseType}`, `fastly:${moduleName}_${releaseType}`]);
  });

  grunt.registerTask('prepare_videojs', ['clean', 'copy', 'uglify', 'configure_videojs']);

  grunt.registerTask('configure_videojs', function(releaseType='patch'){
    // Get version info
    var vjsPackage = grunt.file.readJSON('node_modules/video.js/package.json');
    var vjsVersion = vjsPackage.version;

    // Set up the release type versions
    var cdnVersions = {};
    cdnVersions.major = semver.major(vjsVersion);
    cdnVersions.minor = cdnVersions.major + '.' + semver.minor(vjsVersion);
    cdnVersions.patch = vjsVersion;

    // Get the source
    var vjs = grunt.file.read('build/temp/video.js/video.js');
    var vjsMin = grunt.file.read('build/temp/video.js/video.min.js');
    var cdnjs = grunt.file.read('build/temp/cdn.min.js');

    // Update the cdn version and concat with video.js source
    cdnjs = cdnjs.replace('__CDN_VERSION__', cdnVersions[releaseType]);
    vjs = vjs + '\n' + cdnjs;
    vjsMin = vjsMin + '\n' + cdnjs;

    // Write the new source files
    grunt.file.write('build/temp/video.js/video.js', vjs);
    grunt.file.write('build/temp/video.js/video.min.js', vjsMin);

    // Get the font dependency version (need to move videojs-font to dependencies)
    var fontVersion = vjsPackage.dependencies['videojs-font'] || vjsPackage.devDependencies['videojs-font'] || '1.1.0';

    // Remove any ^ or ~ before the version
    fontVersion = fontVersion.replace(/^[^\d]/, '');

    // Use the /major.minor/ font url for auto updates
    var fontCdnVersion = semver.major(fontVersion) + '.' + semver.minor(fontVersion);

    var css = grunt.file.read('build/temp/video.js/video-js.css');
    var cssMin = grunt.file.read('build/temp/video.js/video-js.min.css');

    // Replace the font urls with CDN font urls
    css = css.replace(/font\//g, '../font/'+ fontCdnVersion +'/');
    cssMin = cssMin.replace(/font\//g, '../font/'+ fontCdnVersion +'/');

    grunt.file.write('build/temp/video.js/video-js.css', css);
    grunt.file.write('build/temp/video.js/video-js.min.css', cssMin);
  });
};
