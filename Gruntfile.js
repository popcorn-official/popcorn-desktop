module.exports = function(grunt) {
  "use strict";

  var buildPlatforms = parseBuildPlatforms(grunt.option('platforms'));

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', [
    'compass'
  ]);

  grunt.registerTask('css', [
    'compass'
  ]);

  grunt.registerTask('nodewkbuild', [
    'nodewebkit:build',
    'copy:ffmpeg'
  ]);

  grunt.registerTask('build', [
    'default',
    'nodewebkit:build',
    'copy:ffmpeg'
  ]);
  
  grunt.registerTask('dist', [
    'default',
    'nodewebkit:dist',
    'copy:ffmpeg',
    'copy:package'
  ]);

  grunt.initConfig({
    compass: {
      dist: {
        options: {
          cssDir: 'css'
        },
        files: {
          'css/app.css': 'sass/app.scss'
        }
      }
    },

    nodewebkit: {
      build: {
        options: {
          version: '0.9.2',
          build_dir: './build', // Where the build version of my node-webkit app is saved
          mac_icns: './images/popcorntime.icns', // Path to the Mac icon file
          mac: buildPlatforms.mac,
          win: buildPlatforms.win,
          linux32: buildPlatforms.linux32,
          linux64: buildPlatforms.linux64
        },
        src: ['./css/**', './fonts/**', './images/**', './js/**', './language/**', './node_modules/**', '!./node_modules/grunt*/**', './rc/**', './Config.rb', './index.html', './package.json', './README.md' ] // Your node-webkit app './**/*'
      },
      dist: {
        options: {
          version: '0.9.2',
          build_dir: './build', // Where the build version of my node-webkit app is saved
          embed_nw: false, // Don't embed the .nw package in the binary
          keep_nw: true,
          mac_icns: './images/popcorntime.icns', // Path to the Mac icon file
          mac: buildPlatforms.mac,
          win: buildPlatforms.win,
          linux32: buildPlatforms.linux32,
          linux64: buildPlatforms.linux64
        },
        src: ['./css/**', './fonts/**', './images/**', './js/**', './language/**', './node_modules/**', '!./node_modules/grunt*/**', './rc/**', './Config.rb', './index.html', './package.json', './README.md' ] // Your node-webkit app './**/*'
      }
    },

    copy: {
      ffmpeg: {
        files: [
          {
            src: 'libraries/win/ffmpegsumo.dll',
            dest: 'build/releases/Popcorn-Time/win/Popcorn-Time/ffmpegsumo.dll',
            flatten: true
          },
          {
            src: 'libraries/win/ffmpegsumo.dll',
            dest: 'build/cache/win/<%= nodewebkit.build.options.version %>/ffmpegsumo.dll',
            flatten: true
          },
          {
            src: 'libraries/mac/ffmpegsumo.so',
            dest: 'build/releases/Popcorn-Time/mac/Popcorn-Time.app/Contents/Frameworks/node-webkit Framework.framework/Libraries/ffmpegsumo.so',
            flatten: true
          },
          {
            src: 'libraries/mac/ffmpegsumo.so',
            dest: 'build/cache/mac/<%= nodewebkit.build.options.version %>/node-webkit.app/Contents/Frameworks/node-webkit Framework.framework/Libraries/ffmpegsumo.so',
            flatten: true
          },
          {
            src: 'libraries/linux64/libffmpegsumo.so',
            dest: 'build/releases/Popcorn-Time/linux64/Popcorn-Time/libffmpegsumo.so',
            flatten: true
          },
          {
            src: 'libraries/linux64/libffmpegsumo.so',
            dest: 'build/cache/linux64/<%= nodewebkit.build.options.version %>/libffmpegsumo.so',
            flatten: true
          },
          {
            src: 'libraries/linux32/libffmpegsumo.so',
            dest: 'build/releases/Popcorn-Time/linux32/Popcorn-Time/libffmpegsumo.so',
            flatten: true
          },
          {
            src: 'libraries/linux32/libffmpegsumo.so',
            dest: 'build/cache/linux32/<%= nodewebkit.build.options.version %>/libffmpegsumo.so',
            flatten: true
          }
        ]
      },
      package: {
        files: [
          {
            src: 'build/releases/Popcorn-Time/Popcorn-Time.nw',
            dest: 'build/releases/Popcorn-Time/linux32/Popcorn-Time/package.nw',
            flatten: true
          },
          {
            src: 'build/releases/Popcorn-Time/Popcorn-Time.nw',
            dest: 'build/releases/Popcorn-Time/linux64/Popcorn-Time/package.nw',
            flatten: true
          }
        ]
      }
    }
  });
};

var parseBuildPlatforms = function(argumentPlatform) {
  // this will make it build no platform when the platform option is specified
  // without a value which makes argumentPlatform into a boolean
  var inputPlatforms = argumentPlatform || process.platform + ";" + process.arch;

  // Do some scrubbing to make it easier to match in the regexes bellow
  inputPlatforms = inputPlatforms.replace("darwin", "mac");
  inputPlatforms = inputPlatforms.replace(/;ia|;x|;arm/, "");

  var buildAll = /^all$/.test(inputPlatforms);

  var buildPlatforms = {
    mac: /mac/.test(inputPlatforms) || buildAll,
    win: /win/.test(inputPlatforms) || buildAll,
    linux32: /linux32/.test(inputPlatforms) || buildAll,
    linux64: /linux64/.test(inputPlatforms) || buildAll
  };

  return buildPlatforms;
}
