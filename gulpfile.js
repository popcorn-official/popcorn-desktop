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
    pkJson = require('./package.json'),
    git = require('git-rev');

/***********
 *  custom  *
 ***********/
var parsePlatforms = () => {
    if (!yargs.argv.platforms) {
        return [currentPlatform()];

    }

    var req = yargs.argv.platforms.split(','),
        avail = [];
    for (var pl in req) {
        if (availablePlatforms.indexOf(req[pl]) !== -1) {
            avail.push(req[pl]);
        }
    }
    return req[0] === 'all' ? availablePlatforms : avail;
};

var parseReqDeps = () => {
    return new Promise((resolve, reject) => {
        var depList = [];
        var npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
        var child = spawn(npm, ['ls', '--production=true', '--parseable=true']);
        child.stdout.on('data', (buf) => {
            depList = buf.toString().split('\n').filter((n) => {
                // remove empty or soon-to-be empty
                return n.replace(process.cwd().toString(), '');
            });
        });
        child.on('close', (exitCode) => {
            return Promise.all(depList.map((str) => {
                // format for nw-builder
                return str.replace(process.cwd().toString(), '.') + '/**';
            })).then(resolve);
        });
        child.on('error', reject);
    });
};

var log = () => {
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
gulp.task('run', () => {
    nw.options.files = './**';
    return nw.run().catch(log);
});

// build app from sources
gulp.task('build', (callback) => {
    runSequence('injectgit', 'css', 'nwjs', callback);
});

// create redistribuable packages
gulp.task('dist', (callback) => {
    runSequence('build', 'compress', 'deb', 'nsis', callback);
});

// clean gulp-created files
gulp.task('clean', ['clean:dist', 'clean:build', 'clean:css']);

// default is help, because we can!
gulp.task('default', () => {
    console.log([
        '\nBasic usage:',
        ' gulp run\tStart the application in dev mode',
        ' gulp build\tBuild the application',
        ' gulp dist\tCreate a redistribuable package',
        '\nAvailable options:',
        ' --platforms=<platform>',
        '\tArguments: ' + availablePlatforms + ',all',
        '\tExample:   `grunt build --platforms=all`',
        '\nUse `gulp --tasks` to show the task dependency tree of gulpfile.js\n'
    ].join('\n'));
});

// download and compile nwjs
gulp.task('nwjs', () => {
    return parseReqDeps().then((requiredDeps) => {
        // required files
        nw.options.files = ['./src/**', '!./src/app/styl/**', './package.json', './README.md', './CHANGELOG.md', './LICENSE.txt', './.git.json'];
        // add node_modules
        nw.options.files = nw.options.files.concat(requiredDeps);
        // remove junk files
        nw.options.files = nw.options.files.concat(['!./node_modules/**/*.bin', '!./node_modules/**/*.c', '!./node_modules/**/*.h', '!./node_modules/**/Makefile', '!./node_modules/**/*.h', '!./**/test*/**', '!./**/doc*/**', '!./**/example*/**', '!./**/demo*/**', '!./**/bin/**', '!./**/build/**', '!./**/.*/**']);

        return nw.build();
    }).catch(log);
});

function promiseCallback(fn) {
    //XXX(xaiki): use ES6 rest params for much cleaner code...
    var args = Array.prototype.slice.call(arguments, 1);
    return new Promise((resolve, reject) => {
        fn.apply(this, args.concat([res => {
            if (res) {
                return resolve(res);
            }
            return reject(res);
        }]));
    });
}

// create .git.json (used in 'About')
gulp.task('injectgit', () => {
    return Promise.all([promiseCallback(git.branch), promiseCallback(git.long)])
        .then(gitInfo => (
            new Promise((resolve, reject) => {
                fs.writeFile('.git.json', JSON.stringify({
                    branch: gitInfo[0],
                    commit: gitInfo[1]
                }), (error) => {
                    if (error) {
                        return reject({
                            msg: 'Injectgit task failed, %s couldn\'t be written ' + path.join(process.cwd() + '.git.json'),
                            err: error
                        });
                    }
                    return resolve(gitInfo);
                });
            })
        ))
        .then(gitInfo => {
            console.log('Branch:', gitInfo[0]);
            console.log('Commit:', gitInfo[1].substr(0, 8));
        })
        .catch(e => {
            console.error('ignoring error in inject git');
            console.error('got', e.msg, e.err);
        });
});

// compile styl files
gulp.task('css', () => {

    var sources = 'src/app/styl/*.styl',
        cssdest = 'src/app/themes/';

    return gulp.src(sources)
        .pipe(glp.stylus({
            use: nib()
        }))
        .pipe(gulp.dest(cssdest))
        .on('end', () => {
            console.log('Stylus files compiled in %s', path.join(process.cwd(), cssdest));
        });
});

// compile nsis installer
gulp.task('nsis', () => {
    var makensis = process.platform === 'win32' ? 'makensis.exe' : 'makensis';

    return Promise.all(nw.options.platforms.map((platform) => {

        // nsis is for win only
        if (platform.match(/osx|linux/) !== null) {
            console.log('No `nsis` task for', platform);
            return null;
        }

        return new Promise((resolve, reject) => {
            console.log('Packaging nsis for: %s', platform);

            var child = spawn(makensis, [
                '-DARCH=' + platform,
                '-DOUTDIR=' + path.join(process.cwd(), releasesDir),
                'dist/windows/installer_makensis.nsi'
            ]);

            // display log only on failed build
            var nsisLogs = [];
            child.stdout.on('data', (buf) => {
                nsisLogs.push(buf.toString());
            });

            child.on('close', (exitCode) => {
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

            child.on('error', (error) => {
                console.log(error);
                console.log(platform + ' failed to package nsis');
                resolve();
            });
        });
    })).catch(log);
});

// compile debian packages
gulp.task('deb', () => {
    return Promise.all(nw.options.platforms.map((platform) => {

        // deb is for linux only
        if (platform.match(/osx|win/) !== null) {
            console.log('No `deb` task for:', platform);
            return null;
        }
        if (currentPlatform().indexOf('linux') === -1) {
            console.log('Packaging deb is only possible on linux');
            return null;
        }

        return new Promise((resolve, reject) => {
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
            child.stdout.on('data', (buf) => {
                debLogs.push(buf.toString());
            });

            child.on('close', (exitCode) => {
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

            child.on('error', (error) => {
                console.log(error);
                console.log(platform + ' failed to package deb');
                resolve();
            });
        });
    })).catch(log);
});

// package in tgz (win) or in xz (unix)
gulp.task('compress', () => {
    return Promise.all(nw.options.platforms.map((platform) => {

        // don't package win, use nsis
        if (platform.indexOf('win') !== -1) {
            console.log('No `compress` task for:', platform);
            return null;
        }

        return new Promise((resolve, reject) => {
            console.log('Packaging tar for: %s', platform);

            var sources = path.join('build', pkJson.name, platform);

            // compress with gulp on windows
            if (currentPlatform().indexOf('win') !== -1) {

                return gulp.src(sources + '/**')
                    .pipe(glp.tar(pkJson.name + '-' + pkJson.version + '_' + platform + '.tar'))
                    .pipe(glp.gzip())
                    .pipe(gulp.dest(releasesDir))
                    .on('end', () => {
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

                exec(commands, (error, stdout, stderr) => {
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
gulp.task('pre-commit', () => {
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
gulp.task('jshint', () => {
    return gulp.src(['gulpfile.js', 'src/app/lib/*.js', 'src/app/lib/**/*.js', 'src/app/vendor/videojshooks.js', 'src/app/vendor/videojsplugins.js', 'src/app/*.js'])
        .pipe(glp.jshint('.jshintrc'))
        .pipe(glp.jshint.reporter('default'))
        .pipe(glp.jshint.reporter('fail'));
});

// beautify entire code (tweak in .jsbeautifyrc)
gulp.task('jsbeautifier', () => {
    return gulp.src(['src/app/lib/*.js', 'src/app/lib/**/*.js', 'src/app/*.js', 'src/app/vendor/videojshooks.js', 'src/app/vendor/videojsplugins.js', '*.js', '*.json'], {
            base: './'
        })
        .pipe(glp.jsbeautifier({
            config: '.jsbeautifyrc'
        }))
        .pipe(glp.jsbeautifier.reporter())
        .pipe(gulp.dest('./'));
});

var logDeleted = what => (
    paths => {
        paths.length ?
            console.log('Deleted ', what, ':\n', paths.join('\n')) :
            console.log('Nothing to delete');
    }
);

var deleteAndLog = (path, what) => (
    () => (
        del(path)
        .then(logDeleted(what))
    )
);

// clean build files (nwjs)
gulp.task('clean:build',
    deleteAndLog([path.join(releasesDir, pkJson.name)], 'build files')
);

// clean dist files (dist)
gulp.task('clean:dist',
    deleteAndLog([path.join(releasesDir, '*.*')], 'distribuables')
);

// clean compiled css
gulp.task('clean:css',
    deleteAndLog(['src/app/themes'], 'css files')
);

//setexecutable?
//clean
//bower_clean


/*gulp.task('codesign', () => {
    exec('sh dist/mac/codesign.sh || echo "Codesign failed, likely caused by not being run on mac, continuing"', (error, stdout, stderr) => {
        console.log(stdout);
    });
});
gulp.task('createDmg', () => {
    exec('dist/mac/yoursway-create-dmg/create-dmg --volname "' + pkJson.name + '-' + pkJson.version + '" --background ./dist/mac/background.png --window-size 480 540 --icon-size 128 --app-drop-link 240 370 --icon "' + pkJson.name + '" 240 110 ./build/releases/' + pkJson.name + '/mac/' + pkJson.name + '-' + pkJson.version + '-Mac.dmg ./build/releases/' + pkJson.name + '/mac/ || echo "Create dmg failed, likely caused by not being run on mac, continuing"',  (error, stdout, stderr) => {
        console.log(stdout);
    });
});*/