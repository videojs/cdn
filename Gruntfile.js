/**
 * See ./lib/grunt.js for the grunt config
 * (this method allows using ES6)
 */

require('babel/register');

module.exports = function(grunt) {
  require('./lib/grunt.js')(grunt);
};
