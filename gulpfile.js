/************ 
 * variables *
 ************/
var nwVersion = '0.12.3';
var availablePlatforms = ['linux32', 'linux64', 'win32', 'win64', 'osx64'];
var releasesDir = 'build';


/*************** 
 * dependencies *
 ***************/
var gulp = require('gulp'),
    glp = require('gulp-load-plugins')(),
    runSequence = require('run-sequence'),
    guppy = require('git-guppy')(gulp),
    del = require('del'),

    nwBuilder = require('nw-builder'),
    currentPlatform = require('nw-builder/lib/detectCurrentPlatform.js'),

    yargs = require('yargs'),
    nib = require('nib'),

    fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec,
    spawn = require('child_process').spawn,
    pkJson = require('./package.json');


/***********
 *  custom  *
 ***********/
var parsePlatforms = function () {
    if (yargs.argv.platforms) {
        var req = yargs.argv.platforms.split(','),
            avail = [];
        for (var pl in req) {
            if (availablePlatforms.indexOf(req[pl]) !== -1) {
                avail.push(req[pl]);
            }
        }
        return req[0] === 'all' ? availablePlatforms : avail;
    } else {
        return [currentPlatform()];
    }
};

var log = function () {
    console.log.apply(console, arguments);
};

var nw = new nwBuilder({
    files: [],
    buildDir: releasesDir,
    zip: false,
    macIcns: './src/app/images/butter.icns',
    version: nwVersion,
    platforms: parsePlatforms(),
}).on('log', console.log);


/************* 
 * gulp tasks *
 *************/
// start app in development
gulp.task('run', function () {
    nw.options.files = './**';
    return nw.run().catch(log);
});

// build app from sources
gulp.task('build', function (callback) {
    runSequence('injectgit', 'css', 'nwjs', callback);
});

// create redistribuable packages
gulp.task('dist', function (callback) {
    runSequence('build', 'compress', 'deb', 'nsis', callback);
});

// clean gulp-created files
gulp.task('clean', ['clean:dist', 'clean:build','clean:css']);

// default is help, because we can!
gulp.task('default', function () {
    console.log('\nBasic usage:');
    console.log(' gulp run\tStart the application in dev mode');
    console.log(' gulp build\tBuild the application');
    console.log(' gulp dist\tCreate a redistribuable package');
    console.log('\nAvailable options:');
    console.log(' --platforms=<platform>');
    console.log('\tArguments: ' + availablePlatforms + ',all');
    console.log('\tExample:   `grunt build --platforms=all`');
    console.log('\nUse `gulp --tasks` to show the task dependency tree of gulpfile.js\n');
});

// download and compile nwjs
gulp.task('nwjs', function () {
    // required files
    nw.options.files = ['./src/**', '!./src/app/styl/**', './node_modules/**', '!./node_modules/**/*.bin', './package.json', './README.md', './CHANGELOG.md', './LICENSE.txt', './.git.json'];
    // remove junk files
    nw.options.files = nw.options.files.concat(['!./node_modules/**/*.c', '!./node_modules/**/*.h', '!./node_modules/**/Makefile', '!./node_modules/**/*.h', '!./**/test*/**', '!./**/doc*/**', '!./**/example*/**', '!./**/demo*/**', '!./**/bin/**', '!./**/build/**', '!./**/.*/**']);
    // remove devdeps
    for (var dep in pkJson.devDependencies) {
        nw.options.files = nw.options.files.concat(['!./node_modules/' + dep + '/**']);
    }

    return nw.build().catch(log);
});


// create .git.json (used in 'About')
gulp.task('injectgit', function () {
    return new Promise(function (resolve, reject) {
        var gitBranch, currCommit;

        try {
            gitBranch = fs.readdirSync('.git/refs/heads')[0];
            currCommit = fs.readFileSync('.git/refs/heads/' + gitBranch).toString().replace('\n', '');
        } catch (error) {
            console.log(error);
            console.log('Injectgit task failed, were sources cloned from git?');
            return resolve();
        }

        fs.writeFile('.git.json', JSON.stringify({
            branch: gitBranch,
            commit: currCommit
        }), function (error) {
            if (error) {
                console.log(error);
                console.log('Injectgit task failed, %s couldn\'t be written', path.join(process.cwd(), '.git.jon'));
            } else {
                console.log('Branch:', gitBranch);
                console.log('Commit:', currCommit.substr(0, 8));
            }
            resolve();
        });
    });
});

// compile styl files
gulp.task('css', function () {

    var sources = 'src/app/styl/*.styl',
        cssdest = 'src/app/themes/';

    return gulp.src(sources)
        .pipe(glp.stylus({
            use: nib()
        }))
        .pipe(gulp.dest(cssdest))
        .on('end', function () {
            console.log('Stylus files compiled in %s', path.join(process.cwd(), cssdest));
        });
});

// compile nsis installer
gulp.task('nsis', function () {
    return Promise.all(nw.options.platforms.map(function (platform) {

        // nsis is for win only
        if (platform.match(/osx|linux/) !== null) {
            console.log('No `nsis` task for', platform);
            return;
        }

        return new Promise(function (resolve, reject) {
            console.log('Packaging nsis for: %s', platform);

            var child = spawn('makensis', [
                '-DARCH=' + platform,
                '-DOUTDIR=' + path.join(process.cwd(), releasesDir),
                'dist/windows/installer_makensis.nsi'
            ]);

            // display log only on failed build
            var nsisLogs = [];
            child.stdout.on('data', function (buf) {
                nsisLogs.push(buf.toString());
            });

            child.on('close', function (exitCode) {
                if (!exitCode) {
                    console.log('%s nsis packaged in', platform, path.join(process.cwd(), releasesDir));
                } else {
                    if (nsisLogs.length) {
                        console.log(nsisLogs.join('\n'));
                    }
                    console.log('%s failed to package nsis', platform);
                }
                resolve();
            });

            child.on('error', function (error) {
                console.log(error);
                console.log(platform + ' failed to package nsis');
                resolve();
            });
        });
    })).catch(log);
});

// compile debian packages
gulp.task('deb', function () {
    return Promise.all(nw.options.platforms.map(function (platform) {

        // deb is for linux only
        if (platform.match(/osx|win/) !== null) {
            console.log('No `deb` task for:', platform);
            return;
        }
        if (currentPlatform().indexOf('linux') === -1) {
            console.log('Packaging deb is only possible on linux');
            return;
        }

        return new Promise(function (resolve, reject) {
            console.log('Packaging deb for: %s', platform);

            var child = spawn('bash', [
                'dist/linux/deb-maker.sh',
                nwVersion,
                platform,
                pkJson.name,
                releasesDir
            ]);

            // display log only on failed build
            var debLogs = [];
            child.stdout.on('data', function (buf) {
                debLogs.push(buf.toString());
            });

            child.on('close', function (exitCode) {
                if (!exitCode) {
                    console.log('%s deb packaged in', platform, path.join(process.cwd(), releasesDir));
                } else {
                    if (debLogs.length) {
                        console.log(debLogs.join('\n'));
                    }
                    console.log('%s failed to package deb', platform);
                }
                resolve();
            });

            child.on('error', function (error) {
                console.log(error);
                console.log(platform + ' failed to package deb');
                resolve();
            });
        });
    })).catch(log);
});

// package in tgz (win) or in xz (unix)
gulp.task('compress', function () {
    return Promise.all(nw.options.platforms.map(function (platform) {

        // don't package win, use nsis
        if (platform.indexOf('win') !== -1) {
            console.log('No `compress` task for:', platform);
            return;
        }

        return new Promise(function (resolve, reject) {
            console.log('Packaging tar for: %s', platform);

            var sources = path.join('build', pkJson.name, platform);

            // compress with gulp on windows
            if (currentPlatform().indexOf('win') !== -1) {

                return gulp.src(sources + '/**')
                    .pipe(glp.tar(pkJson.name + '-' + pkJson.version + '_' + platform + '.tar'))
                    .pipe(glp.gzip())
                    .pipe(gulp.dest(releasesDir))
                    .on('end', function () {
                        console.log('%s tar packaged in %s', platform, path.join(process.cwd(), releasesDir));
                    });

                // compress with tar on unix*
            } else {

                // using the right directory
                var platformCwd = platform.indexOf('linux') !== -1 ? '.' : pkJson.name + '.app';

                // list of commands
                var commands = [
                    'cd ' + sources,
                    'tar --exclude-vcs -c ' + platformCwd + ' | $(command -v pxz || command -v xz) -T8 -7 > "' + path.join(process.cwd(), releasesDir, pkJson.name + '-' + pkJson.version + '_' + platform + '.tar.xz') + '"',
                    'echo "' + platform + ' tar packaged in ' + path.join(process.cwd(), releasesDir) + '" || echo "' + platform + ' failed to package tar"'
                ].join(' && ');

                exec(commands, function (error, stdout, stderr) {
                    if (error || stderr) {
                        console.log(error || stderr);
                        console.log('%s failed to package tar', platform);
                        resolve();
                    } else {
                        console.log(stdout.replace('\n', ''));
                        resolve();
                    }
                });
            }
        });
    })).catch(log);
});

// prevent commiting if conditions aren't met and force beautify (bypass with `git commit -n`)
gulp.task('pre-commit', function () {
    var lintfilter = glp.filter(['*.js'], {
            restore: true
        }),
        beautifyfilter = glp.filter(['*.js', '*.json'], {
            restore: true
        });

    return gulp.src(guppy.src('pre-commit'), {
            base: './'
        })
        // verify lint
        .pipe(lintfilter)
        .pipe(glp.jshint('.jshintrc'))
        .pipe(glp.jshint.reporter('default'))
        .pipe(glp.jshint.reporter('fail')) // TODO: prevent the 'throw err' message log on jshint error, it's annoying
        .pipe(lintfilter.restore)
        // beautify
        .pipe(beautifyfilter)
        .pipe(glp.jsbeautifier({
            config: '.jsbeautifyrc'
        }))
        .pipe(glp.jsbeautifier.reporter())
        .pipe(beautifyfilter.restore)
        // commit
        .pipe(gulp.dest('./'));
});

// check entire sources for potential coding issues (tweak in .jshintrc)
gulp.task('jshint', function () {
    return gulp.src(['gulpfile.js', 'src/app/lib/*.js', 'src/app/lib/**/*.js', 'src/app/vendor/videojshooks.js', 'src/app/vendor/videojsplugins.js', 'src/app/*.js'])
        .pipe(glp.jshint('.jshintrc'))
        .pipe(glp.jshint.reporter('default'))
        .pipe(glp.jshint.reporter('fail'));
});

// beautify entire code (tweak in .jsbeautifyrc)
gulp.task('jsbeautifier', function () {
    return gulp.src(['src/app/lib/*.js', 'src/app/lib/**/*.js', 'src/app/*.js', 'src/app/vendor/videojshooks.js', 'src/app/vendor/videojsplugins.js', '*.js', '*.json'], {
            base: './'
        })
        .pipe(glp.jsbeautifier({
            config: '.jsbeautifyrc'
        }))
        .pipe(glp.jsbeautifier.reporter())
        .pipe(gulp.dest('./'));
});

// clean build files (nwjs)
gulp.task('clean:build', function () {
    return del([path.join(releasesDir, pkJson.name)])
        .then(function (paths) {
            if (paths.length) {
                console.log('Deleted build files:\n' + paths.join('\n'));
            } else {
                console.log('Nothing to delete');
            }
        });
});

// clean dist files (dist)
gulp.task('clean:dist', function () {
    return del([path.join(releasesDir, '*.*')])
        .then(function (paths) {
            if (paths.length) {
                console.log('Deleted distribuables:\n' + paths.join('\n'));
            } else {
                console.log('Nothing to delete');
            }
        });
});

// clean compiled css
gulp.task('clean:css', function () {
    return del(['src/app/themes'])
        .then(function (paths) {
            if (paths.length) {
                console.log('Deleted css files:\n' + paths.join('\n'));
            } else {
                console.log('Nothing to delete');
            }
        });
});

//setexecutable?
//clean
//bower_clean


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