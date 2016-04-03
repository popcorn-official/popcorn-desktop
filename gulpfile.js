var availablePlatforms = [
    'linux32',
    'linux64',
    'win32',
    'osx64'
];

var nwVersion = '0.12.3';


/* gulpfile */
var gulp = require('gulp'),
    nwBuilder = require('nw-builder'),
    currentPlatform = require('nw-builder/lib/detectCurrentPlatform.js'),
    argv = require('yargs').argv,
    parsePlatforms = function () {
        var req = argv.platforms.split(','), avail = [];
        for (var pl in req) {
            if (availablePlatforms.indexOf(req[pl]) !== -1) {
                avail.push(req[pl]);
            }
        }
        return avail;
    };

var nw = new nwBuilder({
    files: [],
    version: nwVersion,
    platforms: argv.platforms ? parsePlatforms() : [currentPlatform()],
    buildType: 'versioned',
    macIcns: './src/app/images/butter.icns',
    quiet: true
}).on('log', console.log);

// link default task to 'build'
gulp.task('default', ['build']);

gulp.task('build', function () {
    nw.options.files = ['./src/**', '!./src/app/styl/**',
        './node_modules/**', '!./node_modules/bower/**',
        '!./node_modules/*grunt*/**', '!./node_modules/stylus/**',
        '!./node_modules/nw-gyp/**', '!./node_modules/**/*.bin',
        '!./node_modules/**/*.c', '!./node_modules/**/*.h',
        '!./node_modules/**/Makefile', '!./node_modules/**/*.h',
        '!./**/test*/**', '!./**/doc*/**', '!./**/example*/**',
        '!./**/demo*/**', '!./**/bin/**', '!./**/build/**', '!./**/.*/**',
        './package.json', './README.md', './CHANGELOG.md', './LICENSE.txt',
        './.git.json'
    ];
    return nw.build().catch(function(error) {
        console.error(error);
    });
});

gulp.task('run', function () {
    nw.options.files = './**';
    return nw.run().catch(function(error) {
        console.error(error);
    });
});