var gulp = require('gulp');
var stylus = require('gulp-stylus');
var runSequence = require('run-sequence');
var NwBuilder = require('nw-builder');
var argv = require('yargs')
    .alias('p', 'platforms')
    .argv;
var del = require('del');
var detectCurrentPlatform = require('nw-builder/lib/detectCurrentPlatform.js');
var nw = new NwBuilder({
    files: ['./src/**', '!./src/app/styl/**',
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

gulp.task('nw:run', function () {
    nw.options.files = './**';
    return nw.run().catch(function (error) {
        console.error(error);
    });
});

gulp.task('nw:build', function () {
    return nw.build().catch(function (error) {
        console.error(error);
    });
});

gulp.task('clean:build', function () {
    return del('build/');
});

gulp.task('clean:css', function () {
    return del('src/app/themes/');
});

gulp.task('css', function () {
    var nib = require('nib');
    return gulp.src('src/app/styl/*.styl')
        .pipe(stylus({
            use: nib()
        }))
        .pipe(gulp.dest('src/app/themes/'));
});

gulp.task('clean', ['clean:build', 'clean:css']);

gulp.task('build', function (callback) {
    runSequence('clean', 'css', 'nw:build', callback);
});

gulp.task('start', function (callback) {
    runSequence('css', 'nw:run', callback);
});
