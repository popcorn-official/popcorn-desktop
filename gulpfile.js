/* variables */
var nwVersion = '0.12.3';
var availablePlatforms = ['linux32', 'linux64', 'win32', 'win64', 'osx64'];

/* gulpfile */
var gulp = require('gulp'),
    nwBuilder = require('nw-builder'),
    yargs = require('yargs'),
    nib = require('nib'),
    tar = require('gulp-tar'),
    gzip = require('gulp-gzip'),
    stylus = require('gulp-stylus'),
    fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec,
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
    },
    nw = new nwBuilder({
        files: [],
        zip: false,
        macIcns: './src/app/images/butter.icns',
        version: nwVersion,
        platforms: yargs.argv.platforms ? parsePlatforms() : [currentPlatform()],
    }).on('log', console.log);

/* gulp tasks */
gulp.task('default', ['run']);
gulp.task('build', ['injectgit', 'css', 'nwjs']);
gulp.task('dist', ['build', 'compress', 'createWinInstall']);

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
    } catch (error) {
        console.error(error);
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

gulp.task('createWinInstall', function () { // compile nsis installer
    return Promise.all(nw.options.platforms.map(function (platform) {
        if(platform.match(/osx|linux/) !== null) return; // nsis is for win
        exec('makensis /DARCH=' + platform + ' dist/windows/installer_makensis.nsi || echo "Create win install failed"', function (error, stdout, stderr) {
            console.log(stdout);
        });
        return;
    })).catch(function (error) {
        console.error(error);
    });

});

gulp.task('compress', function () { // package in tgz
    return Promise.all(nw.options.platforms.map(function (platform) {
        if (platform.indexOf('win') !== -1) return; // don't package win, use createWinInstall
        
        if (currentPlatform().indexOf('win') !== -1) { // compress with gulp on windows
            return gulp.src(path.join('./build', pkJson.name, platform) + '/**')
                .pipe(tar(pkJson.name+'-'+pkJson.version+'_'+platform+'.tar'))
                .pipe(gzip())
                .pipe(gulp.dest('build'));
        } else { // compress with tar on unix*

            // using the right directory
            var platformCwd = platform.indexOf('linux') !== -1 ? '.' : pkJson.name+'.app';

            // list of commands
            var commands = [
                'cd ' + path.join('./build', pkJson.name, platform),
                'tar --exclude-vcs -c '+platformCwd+' | $(command -v pxz || command -v xz) -T8 -7 > "../../'+pkJson.name+'-'+pkJson.version+'_'+platform+'.tar.xz"',
                'pl='+platform,
                'echo "$pl sucessfully packaged" || echo "$pl failed to package"'
            ].join(' && ');

            exec(commands, function (error, stdout, stderr) {
                console.log(stdout);
            });
            return;
        }

    })).catch(function (error) {
        console.error(error);
    });
});

//setexecutable?
//build-deb


/*gulp.task('codesign', function () {
    exec('sh dist/mac/codesign.sh || echo "Codesign failed, likely caused by not being run on mac, continuing"', function (error, stdout, stderr) {
        console.log(stdout);
    });
});
gulp.task('createDmg', function () {
    exec('dist/mac/yoursway-create-dmg/create-dmg --volname "' + pkJson.name + '-' + pkJson.version + '" --background ./dist/mac/background.png --window-size 480 540 --icon-size 128 --app-drop-link 240 370 --icon "' + pkJson.name + '" 240 110 ./build/releases/' + pkJson.name + '/mac/' + pkJson.name + '-' + pkJson.version + '-Mac.dmg ./build/releases/' + pkJson.name + '/mac/ || echo "Create dmg failed, likely caused by not being run on mac, continuing"', function (error, stdout, stderr) {
        console.log(stdout);
    });
});*/