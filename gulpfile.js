var gulp = require('gulp');
var NwBuilder = require('nw-builder');
var os = require('os');
var argv = require('yargs')
    .alias('p', 'platforms')
    .argv;
var del = require('del');
var detectCurrentPlatform = require('nw-builder/lib/detectCurrentPlatform.js');
var nw = new NwBuilder({
    files:['./src/**', '!./src/app/styl/**',
            './node_modules/**', '!./node_modules/bower/**',
            '!./node_modules/*grunt*/**', '!./node_modules/stylus/**',
            '!./node_modules/nw-gyp/**', '!./node_modules/**/*.bin',
            '!./node_modules/**/*.c', '!./node_modules/**/*.h',
            '!./node_modules/**/Makefile', '!./node_modules/**/*.h',
            '!./**/test*/**', '!./**/doc*/**', '!./**/example*/**',
            '!./**/demo*/**', '!./**/bin/**', '!./**/build/**', '!./**/.*/**',
            './package.json', './README.md', './CHANGELOG.md', './LICENSE.txt',
            './.git.json'
        ],
    version: '0.12.2',
    build_dir: './build', // Where the build version of my nwjs app is saved
    zip: false,
    macIcns: './src/app/images/popcorntime.icns', // Path to the Mac icon file
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
