var gulp = require('gulp');
var NwBuilder = require('nw-builder');
var os = require('os');
var argv = require('yargs')
    .alias('p', 'platforms')
    .argv;
var del = require('del');
var detectCurrentPlatform = require('nw-builder/lib/detectCurrentPlatform.js');
var nw = new NwBuilder({
    files: ['./src/**', './node_modules/**', './package.json'],
    version: '0.12.2',
    build_dir: './build', // Where the build version of my nwjs app is saved
    zip: false,
    macIcns: './src/app/images/butter.icns', // Path to the Mac icon file
    downloadUrl: 'https://get.popcorntime.sh/repo/nw/',
    platforms: argv.p ? argv.p.split(',') : [detectCurrentPlatform()]
}).on('log', console.log);

gulp.task('run', function() {
    nw.options.files = './**';
    return nw.run().catch(function(error) {
        console.error(error);
    });
});

gulp.task('build', ['clean'], function() {
    return nw.build().catch(function(error) {
        console.error(error);
    });
});

gulp.task('clean', function() {
    return del('build/');
});
