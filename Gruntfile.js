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
    php: {
      examples: {
        options: {
          port: 1789,
          directives: {
            sendmail_path:'node_modules/catchmail/bin/cli.js'
          },
          //open: '/',
          open: 'examples/2-popup.html',
          livereload: 35749
        }
      }
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      options: {
        // we don't want to lose the environment, specially the stage
        spawn: false
      },
      gruntfile: {
        files: ['Gruntfile.js']
        // no tasks, this automatically triggers a watch restart
      },
      reload: {
        files: ['mailtolink.js', 'examples/*.html', 'bower.json'],
        options: {
          livereload: 35749
        }
      },
      js: {
        files: jsFiles,
        tasks: ['test']
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
    'php:examples',
    'watch',
  ]);

  grunt.registerTask('default', [
    'build',
    'test',
    'serve'
  ]);
};
