/**
 * See ./build/grunt.js for the grunt config
 * (this method allows using ES6)
 */

require('babel/register');

module.exports = function(grunt) {
  require('./build/grunt.js')(grunt);
};
