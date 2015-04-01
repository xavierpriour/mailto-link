'use strict';

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt); // Load grunt tasks automatically

  var jsFiles = ['Gruntfile.js', 'mailtolink.js'];
  // Define the configuration for all the tasks
  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: true
      },
      all: jsFiles
    },

    jscs: {
      options: {
        config: '.jscsrc'
      },
      src: jsFiles
    },

    // runs a local php server
    connect: {
      examples: {
        options: {
          port: 1776,
          //base: 'examples',
          open: 'http://localhost:1776/examples/1-redirect.html',
          livereload: 35739
        }
      }
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      options: {
        spawn: false,
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      js: {
        files: ['mailtolink.js', 'examples/*.html'],
        options: {
          livereload: 35739
        }
      }
    }
  });

  grunt.registerTask('build', [
    //'clean:stage',
    //'copy',
    //'compile',
    //'patch',
    //'symlink',
  ]);

  grunt.registerTask('test', [
    'jshint',
    'jscs',
  ]);

  grunt.registerTask('serve', [
    'connect:examples',
    'watch',
  ]);

  grunt.registerTask('default', [
    //'build',
    'test',
  ]);
};
