module.exports = function(grunt) {
  require('time-grunt')(grunt);
  let semver = require('semver');

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
    }
  };

  // Title the following version logging
  grunt.log.writeln('Current versions:');

  // Dynamically build the grunt config with tasks for publishing the files
  // and specific release types
  addPublishTasks('videojs', {
    root: true,
    module: 'video.js',
    distDir: 'dist/',
    src: ['**']
  });

  addPublishTasks('swf', {
    module: 'videojs-swf',
    distDir: 'dist/',
    src: ['video-js.swf']
  });

  addPublishTasks('font', {
    module: 'videojs-font',
    distDir: 'fonts/',
    src: ['**']
  });

  function addPublishTasks(name, options={}){
    let moduleDir = `./node_modules/${options.module}/`;
    let modulePkg = grunt.file.readJSON(`${moduleDir}package.json`);
    let version = modulePkg.version;

    if (!version) {
      throw new Error(`No package version found for ${options.module}`);
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
            cwd: `${moduleDir}${options.distDir}`,
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

    grunt.task.run([`aws_s3:${moduleName}_${releaseType}`, `fastly:${moduleName}_${releaseType}`]);
  });
};
