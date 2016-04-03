/* variables */
var nwVersion = '0.12.3';
var availablePlatforms = ['linux32', 'linux64', 'win32', 'osx64'];

/* gulpfile */
var gulp = require('gulp'),
    nwBuilder = require('nw-builder'),
    yargs = require('yargs'),
    nib = require('nib'),
    fs = require('fs'),
    stylus = require('gulp-stylus'),
    currentPlatform = require('nw-builder/lib/detectCurrentPlatform.js'),
    pkJson = require('./package.json'),
    parsePlatforms = function () {
        var req = yargs.argv.platforms.split(','), avail = [];
        for (var pl in req) {
            if (availablePlatforms.indexOf(req[pl]) !== -1) {
                avail.push(req[pl]);
            }
        }
        return req[0] === 'all' ? availablePlatforms : avail;
    };

var nw = new nwBuilder({
    files: [],
    zip: false,
    macIcns: './src/app/images/butter.icns',
    version: nwVersion,
    platforms: yargs.argv.platforms ? parsePlatforms() : [currentPlatform()],
}).on('log', console.log);

/* gulp tasks */
gulp.task('default', ['run']);
gulp.task('build', ['injectgit', 'css', 'nwjs']);

gulp.task('nwjs', function () { // download and compile nwjs
    // required files
    nw.options.files = ['./src/**', '!./src/app/styl/**', './node_modules/**', '!./node_modules/**/*.bin', './package.json', './README.md', './CHANGELOG.md', './LICENSE.txt', './.git.json'];
    // remove junk files
    nw.options.files = nw.options.files.concat(['!./node_modules/**/*.c', '!./node_modules/**/*.h', '!./node_modules/**/Makefile', '!./node_modules/**/*.h', '!./**/test*/**', '!./**/doc*/**', '!./**/example*/**', '!./**/demo*/**', '!./**/bin/**', '!./**/build/**', '!./**/.*/**']);
    // remove devdeps
    for (var dep in pkJson.devDependencies) {
        nw.options.files = nw.options.files.concat(['!./node_modules/'+dep+'/**']);
    }

    return nw.build().catch(function(error) {
        console.error(error);
    });
});

gulp.task('injectgit', function () { // create .git.json
    try {
        var gitBranch = fs.readdirSync('.git/refs/heads')[0],
            currCommit = fs.readFileSync('.git/refs/heads/'+gitBranch).toString().replace('\n','');

        fs.writeFileSync('.git.json', JSON.stringify({
            branch: gitBranch,
            commit: currCommit
        }));
    } catch (e) {
        console.log(e)
    }
});

gulp.task('run', function () { // run nwjs
    nw.options.files = './**';
    return nw.run().catch(function(error) {
        console.error(error);
    });
});

gulp.task('css', function () { // compile styl
    return gulp.src('src/app/styl/*.styl')
        .pipe(stylus({
            use: nib()
        }))
        .pipe(gulp.dest('src/app/themes/'));
});