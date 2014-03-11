  module.exports = function(grunt) {

  grunt.initConfig({
    compass: {
      dist: {
        files: {
          'css/app.css': 'sass/app.scss'
        }
      }
    },
    watch: {
      files: ['sass/**/*.scss'],
      tasks: ['sass'],
      options: {
        livereload: true
      }
    },
    nodewebkit: {
      options: {
        version: '0.9.2',
        build_dir: './build', // Where the build version of my node-webkit app is saved
        mac_icns: './images/popcorntime.icns', // Path to the Mac icon file
        mac: true, // We want to build it for mac
        win: true, // We want to build it for win
        linux32: false, // We don't need linux32
        linux64: true // We don't need linux64
      },
      src: ['./css/**', './fonts/**', './images/**', './js/**', './language/**', './node_modules/**', '!./node_modules/grunt*/**', './rc/**', './tmp/empty', './Config.rb', './index.html', './package.json', './README.md' ] // Your node-webkit app './**/*'
    },
    copy: {
      main: {
        files: [
          {
            src: 'libraries/win/ffmpegsumo.dll',
            dest: 'build/releases/Popcorn-Time/win/Popcorn-Time/ffmpegsumo.dll',
            flatten: true
          },
          {
            src: 'libraries/mac/ffmpegsumo.so',
            dest: 'build/releases/Popcorn-Time/mac/Popcorn-Time.app/Contents/Frameworks/node-webkit Framework.framework/Libraries/ffmpegsumo.so',
            flatten: true
          },
          {
            src: 'libraries/linux64/libffmpegsumo.so',
            dest: 'build/releases/Popcorn-Time/linux64/Popcorn-Time/libffmpegsumo.so',
            flatten: true
          }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-node-webkit-builder');

  grunt.registerTask('css', ['compass']);
  grunt.registerTask('default', ['compass']);
  grunt.registerTask('nodewkbuild', ['nodewebkit', 'copy']);


};