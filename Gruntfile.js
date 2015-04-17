'use strict';

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt); // Load grunt tasks automatically

  var jsFiles = ['Gruntfile.js', 'mailtolink.js', 'test/**/*.js'];
  var nonJsFiles = ['bootstrap-popup.html', 'mail-post.php'];
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

    mocha_casperjs: {
      all: {
        src: ['test/mocha-casper/*.js']
      }
    },

    //casperjs: {
    //  all: {
    //    files: ['test/casper/test.js']
    //  }
    //},

    maildev: {
      serve: {},
      test: {}
    },

    // runs a local php server
    php: {
      test: {
        options: {
          port: 1999,
          directives: {
            sendmail_path: 'catchmail'
          },
          //silent: true, // messes up Dalek output otherwise!
        }
      },
      examples: {
        options: {
          port: 1789,
          directives: {
            sendmail_path:'catchmail'
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
        files: jsFiles.concat(nonJsFiles, ['examples/*.html', 'bower.json']),
        options: {
          livereload: 35749
        }
      },
      js: {
        files: jsFiles.concat(nonJsFiles),
        tasks: ['test-run']
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

  grunt.registerTask('test-serve', [
    'maildev:test',
    'php:test',
  ]);

  grunt.registerTask('test-run', [
    'jshint',
    'jscs',
    'mocha_casperjs'
  ]);

  grunt.registerTask('test', [
    'test-serve',
    'test-run',
  ]);

  grunt.registerTask('serve', [
    'maildev:serve',
    'php:examples',
    'watch',
  ]);

  grunt.registerTask('default', [
    'build',
    'test',
    'watch'
  ]);
};
