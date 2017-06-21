'use strict';

/******** 
 * setup *
 ********/
const nwVersion = '0.18.6',
    nwFlavor = 'sdk',
    // nwjs for osx32 was discontinued in 0.12.0 (Mar 5, 2015).
    availablePlatforms = ['linux32', 'linux64', 'win32', 'osx64'],
    releasesDir = 'build';


/*************** 
 * dependencies *
 ***************/
const gulp = require('gulp'),
      glp = require('gulp-load-plugins')(),
      runSequence = require('run-sequence'),
      del = require('del'),

      nwBuilder = require('nw-builder'),
      currentPlatform = require('nw-builder/lib/detectCurrentPlatform.js'),

      yargs = require('yargs'),
      nib = require('nib'),
      git = require('git-rev'),

      fs = require('fs'),
      flatpak = require('flatpak-bundler'),
      path = require('path'),
      exec = require('child_process').exec,
      spawn = require('child_process').spawn,
      pkJson = require('./package.json');


/***********
 *  custom  *
 ***********/
// returns an array of platforms that should be built
const parsePlatforms = () => {
    const requestedPlatforms = (yargs.argv.platforms || currentPlatform()).split(','),
        validPlatforms = [];

    for (let i in requestedPlatforms) {
        if (availablePlatforms.indexOf(requestedPlatforms[i]) !== -1) {
            validPlatforms.push(requestedPlatforms[i]);
        }
    }

    // for win, 32-bits works on 64, if needed
    if (availablePlatforms.indexOf('win64') === -1 && requestedPlatforms.indexOf('win64') !== -1) {
        validPlatforms.push('win32');
    }

    // remove duplicates
    validPlatforms.filter((item, pos) => {
        return validPlatforms.indexOf(item) === pos;
    });

    return requestedPlatforms[0] === 'all' ? availablePlatforms : validPlatforms;
};

// returns an array of paths with the node_modules to include in builds
const parseReqDeps = () => {
    return new Promise((resolve, reject) => {
        exec('npm ls --production=true --parseable=true', {maxBuffer: 1024 * 500}, (error, stdout, stderr) => {
            if (error || stderr) {
                reject(error || stderr);
            } else {
                // build array
                let npmList = stdout.split('\n');

                // remove empty or soon-to-be empty
                npmList = npmList.filter((line) => {
                    return line.replace(process.cwd().toString(), '');
                });

                // format for nw-builder
                npmList = npmList.map((line) => {
                    return line.replace(process.cwd(), '.') + '/**';
                });

                // return
                resolve(npmList);
            }
        });
    });
};

// handle callbacks
function promiseCallback(fn) {
    // use ES6 rest params for much cleaner code
    let args = Array.prototype.slice.call(arguments, 1);
    return new Promise((resolve, reject) => {
        fn.apply(this, args.concat([res => {
            return res ?
                resolve(res) :
                reject(res);
        }]));
    });
}

// del wrapper for `clean` tasks
const deleteAndLog = (path, what) => (
    () => (
        del(path).then(paths => {
            paths.length ?
                console.log('Deleted', what, ':\n', paths.join('\n')) :
                console.log('Nothing to delete');
        })
    )
);

// nw-builder configuration
const nw = new nwBuilder({
    files: [],
    flavor: nwFlavor,
    buildDir: releasesDir,
    zip: false,
    macIcns: './src/app/images/butter.icns',
    version: nwVersion,
    withFFmpeg: true,
    platforms: parsePlatforms(),
    downloadUrl: 'http://builds.butterproject.org/nw/'
}).on('log', console.log);


/************* 
 * gulp tasks *
 *************/
// start app in development
gulp.task('run', () => {
    return new Promise((resolve, reject) => {
        let platform = parsePlatforms()[0],
            bin = path.join('cache', nwVersion + '-' + nwFlavor, platform);        

        // path to nw binary
        switch(platform.slice(0,3)) {
            case 'osx':
                bin += '/nwjs.app/Contents/MacOS/nwjs';
                break;
            case 'lin':
                bin += '/nw';
                break;
            case 'win':
                bin += '/nw.exe';
                break;
            default: 
                reject(new Error('Unsupported %s platform', platform));
        }

        console.log('Running %s from cache', platform);

        // spawn cached binary with package.json, toggle dev flag
        const child = spawn(bin, ['.', '--development']);

        // nwjs console speaks to stderr
        child.stderr.on('data', (buf) => {
            console.log(buf.toString());
        });

        child.on('close', (exitCode) => {
            console.log('%s exited with code %d', pkJson.name, exitCode);
            resolve();
        });

        child.on('error', (error) => {
            // nw binary most probably missing
            if (error.code === 'ENOENT') {
                console.log('%s is not available in cache. Try running `gulp build` beforehand', platform);
            }
            reject(error);
        });
    });
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
        '\tExample:   `gulp build --platforms=all`',
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
    }).catch(console.log.bind(console));
});


// create .git.json (used in 'About')
gulp.task('injectgit', () => {
    return Promise.all([promiseCallback(git.branch), promiseCallback(git.long)]).then(gitInfo => (
        new Promise((resolve, reject) => {
            fs.writeFile('.git.json', JSON.stringify({
                branch: gitInfo[0],
                commit: gitInfo[1]
            }), (error) => {
                return error ?
                    reject(error) :
                    resolve(gitInfo);
            });
        })
    )).then(gitInfo => {
        console.log('Branch:', gitInfo[0]);
        console.log('Commit:', gitInfo[1].substr(0, 8));
    }).catch(error => {
        console.log(error);
        console.log('Injectgit task failed');
    });
});

// compile styl files
gulp.task('css', () => {
    const sources = 'src/app/styl/*.styl',
        dest = 'src/app/themes/';

    return gulp.src(sources)
        .pipe(glp.stylus({
            use: nib()
        }))
        .pipe(gulp.dest(dest))
        .on('end', () => {
            console.log('Stylus files compiled in %s', path.join(process.cwd(), dest));
        });
});

// compile nsis installer
gulp.task('nsis', () => {
    return Promise.all(nw.options.platforms.map((platform) => {

        // nsis is for win only
        if (platform.match(/osx|linux/) !== null) {
            console.log('No `nsis` task for', platform);
            return null;
        }

        return new Promise((resolve, reject) => {
            console.log('Packaging nsis for: %s', platform);

            // spawn isn't exec
            const makensis = process.platform === 'win32' ? 'makensis.exe' : 'makensis';

            const child = spawn(makensis, [
                '-DARCH=' + platform,
                '-DOUTDIR=' + path.join(process.cwd(), releasesDir),
                'dist/windows/installer_makensis.nsi'
            ]);

            // display log only on failed build
            const nsisLogs = [];
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
    })).catch(console.log.bind(console));
});

gulp.task('build-flatpak', () => {
    return Promise.all(nw.options.platforms.map((platform) => {
        if (platform.match(/osx|win/) !== null) {
            console.log('flatpak not available on:', platform);
            return null;
        }

        return new Promise((accept, reject) => {
            flatpak.bundle({
                id: 'org.butterproject.Desktop',
                base: 'io.atom.electron.BaseApp',
                baseFlatpakref: 'https://s3-us-west-2.amazonaws.com/electron-flatpak.endlessm.com/electron-base-app-master.flatpakref',
                runtime: 'org.freedesktop.Platform',
                runtimeVersion: '1.4',
                runtimeFlatpakref: 'https://raw.githubusercontent.com/endlessm/flatpak-bundler/master/refs/freedesktop-runtime-1.4.flatpakref',
                sdk: 'org.freedesktop.Sdk',
                files: [
                    [ './dist/linux/butter.desktop', '/share/applications/org.butterproject.Desktop.desktop'],
                    [ './src/app/images/icon.png', '/share/icons/org.butterproject.Desktop.png'],
                    [ releasesDir + '/Butter/' + platform, '/share/butter' ]
                ],
                symlinks: [
                    [ '/share/butter/Butter', '/bin/Butter' ]
                ],
                finishArgs: [
                    '--share=ipc', '--socket=x11',
                    '--socket=pulseaudio',
                    '--filesystem=home',
                    '--share=network',
                    '--device=dri'
                ]
            }, { // Build options
                arch: platform === 'linux64' ? 'x86_64': 'x86_32',
                 bundlePath: 'build/Butter/' + platform + '-flatpak/butter-desktop_x86_64.flatpak',
                 gpgSign: '36534BDEC827CE08' // Gpg key to sign with
            }, function (error) {
                if (error) {
                    return reject(error);
                }
                console.log('Flatpak built successfully.');
                return accept(true);
            });
        });
    }));
});

// compile debian packages
// TODO: https://www.npmjs.com/package/nobin-debian-installer
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

            const child = spawn('bash', [
                'dist/linux/deb-maker.sh',
                nwVersion,
                platform,
                pkJson.name,
                pkJson.version,
                releasesDir
            ]);

            // display log only on failed build
            const debLogs = [];
            child.stdout.on('data', (buf) => {
                debLogs.push(buf.toString());
            });
            child.stderr.on('data', (buf) => {
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
                console.log('%s failed to package deb', platform);
                resolve();
            });
        });
    })).catch(console.log.bind(console));
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

            const sources = path.join('build', pkJson.name, platform);

            // compress with gulp on windows
            if (currentPlatform().indexOf('win') !== -1) {

                return gulp.src(sources + '/**')
                    .pipe(glp.tar(pkJson.name + '-' + pkJson.version + '_' + platform + '.tar'))
                    .pipe(glp.gzip())
                    .pipe(gulp.dest(releasesDir))
                    .on('end', () => {
                        console.log('%s tar packaged in %s', platform, path.join(process.cwd(), releasesDir));
                        resolve();
                    });

                // compress with tar on unix*
            } else {

                // using the right directory
                const platformCwd = platform.indexOf('linux') !== -1 ? '.' : pkJson.name + '.app';

                // list of commands
                const commands = [
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
    })).catch(console.log.bind(console));
});

// prevent commiting if conditions aren't met and force beautify (bypass with `git commit -n`)
gulp.task('pre-commit', ['jshint']);

// check entire sources for potential coding issues (tweak in .jshintrc)
gulp.task('jshint', () => {
    return gulp.src(['gulpfile.js', 'src/app/lib/*.js', 'src/app/lib/**/*.js', 'src/app/vendor/videojshooks.js', 'src/app/vendor/videojsplugins.js', 'src/app/*.js'])
        .pipe(glp.jshint('.jshintrc'))
        .pipe(glp.jshint.reporter('jshint-stylish'))
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

// travis tests
gulp.task('test', (callback) => {
    runSequence('jshint', 'injectgit', 'css', callback);
});

gulp.task('flatpak', (callback) => (
    runSequence('build', 'build-flatpak', callback)
));

//TODO:
//setexecutable?
//bower_clean

//TODO: test and tweak
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
