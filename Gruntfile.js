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
        livereload: true,
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('css', ['compass']);

  grunt.registerTask('default', ['compass']);

};