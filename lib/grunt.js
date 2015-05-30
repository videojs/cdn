module.exports = function(grunt) {
  require('time-grunt')(grunt);

  let pkg = grunt.file.readJSON('./package.json');
  let verParts = pkg.version.split('.');
  let version = {
    full: pkg.version,
    major: verParts[0],
    minor: verParts[1],
    patch: verParts[2]
  };
  version.majorMinor = `${version.major}.${version.minor}`;

  let swfDir = './node_modules/videojs-swf/';
  let swfPkg = grunt.file.readJSON(swfDir+'package.json');
  let swfVersion = swfPkg.version;

  // Project configuration.
  grunt.initConfig({
    pkg: pkg,
    aws_s3: {
      options: {
        accessKeyId: process.env.VJS_S3_KEY,
        secretAccessKey: process.env.VJS_S3_SECRET,
        bucket: process.env.VJS_S3_BUCKET,
        access: 'public-read',
        uploadConcurrency: 5
      },
      swf: {
        files: [
          {
            expand: true,
            cwd: swfDir+'dist/',
            src: ['video-js.swf'],
            dest: 'vjs/swf/'+swfVersion+'/',
            params: { CacheControl: 'public, max-age=31536000' }
          }
        ]
      },
      patch: {
        files: [
          {
            expand: true,
            cwd: 'dist/cdn/',
            src: ['**'],
            dest: 'vjs/'+version.full+'/',
            params: { CacheControl: 'public, max-age=31536000' }
          }
        ]
      },
      minor: {
        files: [
          {
            expand: true,
            cwd: 'dist/cdn/',
            src: ['**'],
            dest: 'vjs/'+version.majorMinor+'/',
            params: { CacheControl: 'public, max-age=2628000' }
          }
        ]
      }
    },
    fastly: {
      options: {
        key: process.env.VJS_FASTLY_API_KEY
      },
      minor: {
        options: {
          host: 'vjs.zencdn.net',
          urls: [
            version.majorMinor+'/*'
          ]
        }
      },
      patch: {
        options: {
          host: 'vjs.zencdn.net',
          urls: [
            version.full+'/*'
          ]
        }
      }
    }
  });

  // load all the npm grunt tasks
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', [

  ]);
};
