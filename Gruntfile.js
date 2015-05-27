'use strict';

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt); // Load grunt tasks automatically

  // Configurable paths
  var config = {
    dist: '.dist',
    temp: '.temp'
  };

  var jsFiles = ['Gruntfile.js', 'mailtolink.js', 'test/**/*.js'];
  var nonJsFiles = ['bootstrap-popup.html', 'mail-post.php'];

  // Define the configuration for all the tasks
  grunt.initConfig({
    // Project settings
    config: config,
    time: (new Date()).toISOString().replace(/[-:]/g, '').replace(/\.\d+/g, ''),
    dist: '<%= config.dist %>/<%= stg.stage %>/<%= time %>',
    tmp: '<%= config.temp %>/<%= stg.stage %>/<%= time %>',

    // Empties folders to start fresh
    clean: {
      all: ['<%= config.dist %>/*', '<%= config.temp %>/*'],
      stage: [
        // Grunt has a bug, won't remove the symlink if its target no longer exists
        '<%= config.dist %>/<%= stg.stage %>/current',
        '<%= config.dist %>/<%= stg.stage %>/*',
        '<%= config.temp %>/<%= stg.stage %>/*'
      ]
    },

    copy: {
      dist: {
        files: [
          { // static assets
            expand: true,
            dot: true,
            dest: '<%= dist %>/',
            src: [
              'bootstrap-popup.html',
              'mail-post.php',
            ]
          },
        ]
      },
      local: {
        files: [
          { // Bower components
            expand: true,
            dot: true,
            dest: '<%= dist %>/',
            src: 'bower_components/**/*',
          },
          { // Examples
            expand: true,
            dot: true,
            dest: '<%= dist %>/',
            src: 'examples/**/*',
          },
        ]
      }
    },

    jscs: {
      options: {
        config: '.jscsrc'
      },
      src: jsFiles
    },

    jshint: {
      options: {
        jshintrc: true
      },
      all: jsFiles
    },

    maildev: {
      serve: {},
      test: {}
    },

    mocha_casperjs: {
      all: {
        src: ['test/mocha-casper/*.js']
      }
    },

    // runs a local php server to serve files + process posted form
    php: {
      test: {
        options: {
          port: 1999,
          base: '<%= dist %>',
          directives: {
            sendmail_path: 'catchmail'
          },
          silent: true, // messes up testrunner output otherwise
        }
      },
      examples: {
        options: {
          port: 1789,
          base: '<%= dist %>',
          directives: {
            sendmail_path:'catchmail'
          },
          open: 'examples/2-popup.html',
          livereload: 35749
        }
      }
    },

    stage: {
      options: {
        dir: 'config/'
      }
    },

    symlink: {
      current: {
        options: {
          overwrite: true,
        },
        files: [{
          src: '<%= dist %>',
          dest: '<%= config.dist %>/<%= stg.stage %>/current',
        }],
      },
    },

    uglify: {
      local: {
        options: {
          sourceMap: true,
          sourceMapIncludeSources: true,
        },
        files: {
          '<%= dist %>/mailtolink.min.js': ['mailtolink.js']
        }
      },
      prod: {
        options: {
          compress: true,
        },
        files: {
          '<%= dist %>/mailtolink.min.js': ['mailtolink.js']
        }
      }
    },

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      options: {
        // we don't want to lose the environment, specially the stage
        spawn: false
      },
      // don't watch Gruntfile, doesn't work with grunt-stage
      //gruntfile: {
      //  files: ['Gruntfile.js']
      //  // no tasks, this automatically triggers a watch restart
      //},
      reload: {
        files: jsFiles.concat(nonJsFiles, ['examples/*.html', 'bower.json']),
        options: {
          livereload: 35749
        }
      },
      test: {
        files: jsFiles.concat(nonJsFiles),
        tasks: [
          'copy:dist',
          'stage:copy',
          'stage:uglify',
          'test-run'
        ]
      }
    }
  });

  grunt.registerTask('build', [
    'stage:require',
    'clean:stage',
    'copy:dist',
    'stage:copy',
    'stage:uglify',
    'symlink',
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
    'stage:default:local',
    'build',
    'test-serve',
    'test-run',
  ]);

  grunt.registerTask('serve', [
    'stage:default:local',
    'maildev:serve',
    'php:examples',
    'watch',
  ]);

  grunt.registerTask('default', [
    'stage:local',
    'build',
    'test-serve',
    'test-run',
    'watch'
  ]);
};
