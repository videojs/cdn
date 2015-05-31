module.exports = function(grunt) {
  require('time-grunt')(grunt);
  let semver = require('semver');

  let pkg = grunt.file.readJSON('./package.json');
  let verParts = pkg.version.split('.');
  let version = {
    full: pkg.version,
    major: verParts[0],
    minor: verParts[1],
    patch: verParts[2]
  };
  version.majorMinor = `${version.major}.${version.minor}`;

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

  addPublishTasks('swf', {
    module: 'videojs-swf',
    distDir: 'dist/',
    src: ['video-js.swf']
  });

  function addPublishTasks(name, options={}){
    let moduleDir = `./node_modules/${options.module}/`;
    let modulePkg = grunt.file.readJSON(`${moduleDir}package.json`);
    let version = modulePkg.version;

    if (!version) {
      throw new Error(`No package version found for ${options.module}`);
    }

    let versionDirs = {
      major: semver.major(version),
      minor: semver.major(version) + '.' +semver.minor(version),
      patch: version
    };

    config.aws_s3[name] = getS3TaskConfig('patch');
    config.aws_s3[`${name}_minor`] = getS3TaskConfig('minor');
    config.aws_s3[`${name}_major`] = getS3TaskConfig('major');

    config.fastly[name] = getFastlyTaskConfig('patch');
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
            dest: `vjs/${name}/${versionDir}/`,
            params: { CacheControl: `public, max-age=${maxAge}` }
          }
        ]
      };
    }

    function getFastlyTaskConfig(releaseType='patch'){
      let versionDir = versionDirs[releaseType];

      return {
        options: {
          urls: [name+'/'+versionDir+'/*']
        }
      };
    }
  }

  grunt.initConfig(config);

  // // Project configuration.
  // grunt.initConfig({
  //   pkg: pkg,
  //   aws_s3: {
  //     options: {
  //       accessKeyId: process.env.VJS_S3_KEY,
  //       secretAccessKey: process.env.VJS_S3_SECRET,
  //       bucket: process.env.VJS_S3_BUCKET,
  //       access: 'public-read',
  //       uploadConcurrency: 5
  //     },
  //     swf: {
  //       files: [
  //         {
  //           expand: true,
  //           cwd: './node_modules/videojs-swf/dist/',
  //           src: ['video-js.swf'],
  //           dest: 'vjs/swf/4.7.0/',
  //           params: { CacheControl: 'public, max-age=31536000' }
  //         }
  //       ]
  //     },
  //     patch: {
  //       files: [
  //         {
  //           expand: true,
  //           cwd: 'dist/cdn/',
  //           src: ['**'],
  //           dest: 'vjs/'+version.full+'/',
  //           params: { CacheControl: 'public, max-age=31536000' }
  //         }
  //       ]
  //     },
  //     minor: {
  //       files: [
  //         {
  //           expand: true,
  //           cwd: 'dist/cdn/',
  //           src: ['**'],
  //           dest: 'vjs/'+version.majorMinor+'/',
  //           params: { CacheControl: 'public, max-age=2628000' }
  //         }
  //       ]
  //     }
  //   },
  //   fastly: {
  //     options: {
  //       key: process.env.VJS_FASTLY_API_KEY
  //     },
  //     minor: {
  //       options: {
  //         host: 'vjs.zencdn.net',
  //         urls: [
  //           version.majorMinor+'/*'
  //         ]
  //       }
  //     },
  //     patch: {
  //       options: {
  //         host: 'vjs.zencdn.net',
  //         urls: [
  //           version.full+'/*'
  //         ]
  //       }
  //     }
  //   }
  // });

  // load all the npm grunt tasks
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', [

  ]);
};
