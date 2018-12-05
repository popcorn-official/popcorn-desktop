'use strict';

/********
 * setup *
 ********/
const nwVersion = '0.35.0-beta1',
    availablePlatforms = ['linux32', 'linux64', 'win32', 'win64', 'osx64'],
    releasesDir = 'build',
    nwFlavor = 'sdk';


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
    zip = require('gulp-zip'),
    fs = require('fs'),
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

    // for osx and win, 32-bits works on 64, if needed
    if (availablePlatforms.indexOf('win64') === -1 && requestedPlatforms.indexOf('win64') !== -1) {
        validPlatforms.push('win32');
    }
    if (availablePlatforms.indexOf('osx64') === -1 && requestedPlatforms.indexOf('osx64') !== -1) {
        validPlatforms.push('osx32');
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
                if (error || stderr) {
                  console.log(error);
}
        });
    });
};

// console.log for thenable promises
const log = () => {
    console.log.apply(console, arguments);
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
    buildDir: releasesDir,
    zip: false,
    macIcns: './src/app/images/butter.icns',
    version: nwVersion,
    flavor: nwFlavor,
    downloadUrl: 'https://get.popcorntime.sh/repo/nw/',
    platforms: parsePlatforms()
}).on('log', console.log);


/*************
 * gulp tasks *
 *************/
// start app in development
// default is help, because we can!
gulp.task('default', (done) => {
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
    done();
  });
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

// check entire sources for potential coding issues (tweak in .jshintrc)
gulp.task('jshint', () => {
    return gulp.src(['gulpfile.js', 'src/app/lib/*.js', 'src/app/lib/**/*.js', 'src/app/vendor/videojshooks.js', 'src/app/vendor/videojsplugins.js', 'src/app/*.js'])
        .pipe(glp.jshint('.jshintrc'))
        .pipe(glp.jshint.reporter('jshint-stylish'))
        .pipe(glp.jshint.reporter('fail'));
});
// zip compress all
gulp.task('compresszip', () => {

    return Promise.all(nw.options.platforms.map((platform) => {
      if (platform.match(/linux/) !== null) {
          console.log('No `nocompresszip` task for', platform);
          return null;
      }
        return new Promise((resolve, reject) => {
            console.log('Packaging zip for: %s', platform);
            var sources = path.join('build', pkJson.name, platform);
            if (platform.match(/osx64/) !== null) {
            sources = path.join('build', pkJson.name, platform, '/**.app');
            }
            return gulp.src(sources + '/**')
                .pipe(zip(pkJson.name + '-' + pkJson.version + '_' + platform + '.zip'))
                .pipe(gulp.dest(releasesDir))
                .on('end', () => {
                    console.log('%s zip packaged in %s', platform, path.join(process.cwd(), releasesDir));
                    resolve();
                });
        });
    })).catch(log);
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


// download and compile nwjs
gulp.task('nwjs', () => {
    return parseReqDeps().then((requiredDeps) => {
        // required files
        nw.options.files = ['./src/**', '!./src/app/styl/**', './package.json', './README.md', './CHANGELOG.md', './LICENSE.txt', './.git.json'];
        // add node_modules
        nw.options.files = nw.options.files.concat(requiredDeps);
        // remove junk files
        nw.options.files = nw.options.files.concat(['!./node_modules/**/*.bin', '!./node_modules/**/*.c', '!./node_modules/**/*.h', '!./node_modules/**/Makefile', '!./node_modules/**/*.h', '!./**/test*/**', '!./**/doc*/**', '!./**/example*/**', '!./**/demo*/**', '!./*/bin/**', '!./**/.*/**']);

        return nw.build();
    }).catch(function (error) {
        console.error(error);
    });

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
                './dist/windows/installer_makensis.nsi',
                '-DARCH=' + platform,
                '-DOUTDIR=' + path.join(process.cwd(), releasesDir)
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
                    console.log(nsisLogs);
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
    })).catch(log);
});

// prevent commiting if conditions aren't met and force beautify (bypass with `git commit -n`)
gulp.task('pre-commit', gulp.series('jshint', function(done) {
    // default task code here
    done();
}));

// build app from sources
gulp.task('build', gulp.series('injectgit', 'css', 'nwjs', function(done) {

    // default task code here
    done();
}));

// create redistribuable packages
gulp.task('dist', gulp.series('build', 'compress','compresszip' , 'deb',  'nsis', function(done) {

    // default task code here
    done();
}));
// clean gulp-created files
gulp.task('clean', gulp.series('clean:dist', 'clean:build', 'clean:css', function(done) {

    // default task code here
    done();
}));
// travis tests
gulp.task('test', gulp.series('jshint', 'injectgit', 'css', function(done) {

    // default task code here
    done();
}));
