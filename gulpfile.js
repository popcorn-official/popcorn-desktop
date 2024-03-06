'use strict';

/********
 * setup *
 ********/
const defaultNwVersion = '0.85.0',
  availablePlatforms = ['linux32', 'linux64', 'win32', 'win64', 'osx64'],
  releasesDir = 'build',
  nwFlavor = 'sdk';

/***************
 * dependencies *
 ***************/
const gulp = require('gulp'),
  glp = require('gulp-load-plugins')(),
  del = require('del'),
  gulpRename = require('gulp-rename'),
  nwBuilder = require('nw-builder'),
  yargs = require('yargs'),
  nib = require('nib'),
  git = require('git-describe'),
  zip = require('gulp-zip'),
  fs = require('fs'),
  path = require('path'),
  exec = require('child_process').exec,
  spawn = require('child_process').spawn,
  pkJson = require('./package.json');

const { detectCurrentPlatform } = require('nw-builder/dist/index.cjs');

const nwVersion = yargs.argv.nwVersion || defaultNwVersion;

/***********
 *  custom  *
 ***********/
// returns an array of platforms that should be built
const parsePlatforms = () => {
  const requestedPlatforms = (yargs.argv.platforms || detectCurrentPlatform(process)).split(
      ','
    ),
    validPlatforms = [];

  for (let i in requestedPlatforms) {
    if (availablePlatforms.indexOf(requestedPlatforms[i]) !== -1) {
      validPlatforms.push(requestedPlatforms[i]);
    }
  }

  // for osx and win, 32-bits works on 64, if needed
  if (
    availablePlatforms.indexOf('win64') === -1 &&
    requestedPlatforms.indexOf('win64') !== -1
  ) {
    validPlatforms.push('win32');
  }
  if (
    availablePlatforms.indexOf('osx64') === -1 &&
    requestedPlatforms.indexOf('osx64') !== -1
  ) {
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
    exec(
      'yarn list --prod --json',
      {maxBuffer: 1024 * 500},
      (error, stdout, stderr) => {
        // build array
        let npmList = JSON.parse(stdout);

        // format for nw-builder
        npmList = npmList.data.trees.map((obj) => {
          let name = obj.name;
          name = name.replace(/@[\d.]+$/, '');
          return './node_modules/' + name + '/**';
        });

        // not know why it not add
        npmList.push('./node_modules/cheerio/**');

        // return
        resolve(npmList);
        if (error || stderr) {
          console.log(error);
        }
      }
    );
  });
};

const curVersion = () => {
    if (fs.existsSync('./git.json')) {
        const gitData = require('./git.json');
        return gitData.semver;
    } else {
        return pkJson.version;
    }
};

const nwSuffix = () => {
    if (nwVersion === defaultNwVersion) {
        return '';
    }
    return '-' + nwVersion;
};

const waitProcess = function(process) {
    return new Promise((resolve, reject) => {
        // display log only on failed build
        const logs = [];
        process.stdout.on('data', (buf) => {
            logs.push(buf.toString());
        });
        process.stderr.on('data', (buf) => {
            logs.push(buf.toString());
        });

        process.on('close', (exitCode) => {
            if (!exitCode) {
                resolve();
            } else {
                if (logs.length) {
                    console.log(logs.join('\n'));
                }
                reject();
            }
        });

        process.on('error', (error) => {
            console.log(error);
            reject();
        });
    });
};

// console.log for thenable promises
const log = () => {
  console.log.apply(console, arguments);
};

// del wrapper for `clean` tasks
const deleteAndLog = (path, what) => () =>
  del(path).then((paths) => {
    paths.length
      ? console.log('Deleted', what, ':\n', paths.join('\n'))
      : console.log('Nothing to delete');
  });

const renameFile = (dir, src, dest) => {
    return new Promise((resolve, reject) => {
        return gulp
            .src(path.join(dir, src))
            .pipe(gulpRename(dest))
            .pipe(gulp.dest(dir))
            .on('end', () => resolve());
    }).then(() => del(path.join(dir, src)));
};

// clean for dist
gulp.task('cleanForDist', (done) => {
  del([path.join(releasesDir, pkJson.name)]).then((paths) => {
    paths.length
      ? console.log('Deleted: \n', paths.join('\n'))
      : console.log('Nothing to delete');
    done();
  });
});

// nw-builder configuration
const nw = new nwBuilder({
  files: [],
  buildDir: releasesDir,
  zip: false,
  macIcns: './src/app/images/butter.icns',
  version: nwVersion,
  flavor: nwFlavor,
  manifestUrl: 'https://popcorn-time.serv00.net/version.json',
  downloadUrl: 'https://popcorn-time.serv00.net/nw/',
  platforms: parsePlatforms()
}).on('log', console.log);

/*************
 * gulp tasks *
 *************/
// start app in development
// default is help, because we can!
gulp.task('default', (done) => {
  console.log(
    [
      '\nBasic usage:',
      ' gulp run\tStart the application in dev mode',
      ' gulp build\tBuild the application',
      ' gulp dist\tCreate a redistribuable package',
      '\nAvailable options:',
      ' --platforms=<platform>',
      '\tArguments: ' + availablePlatforms + ',all',
      '\tExample 1:   `gulp dist --platforms=all`',
      '\tExample 2:   `gulp dist --platforms=win64,linux64`',
      '\nUse `gulp --tasks` to show the task dependency tree of gulpfile.js\n'
    ].join('\n')
  );
  done();
});
gulp.task('run', () => {
  return new Promise((resolve, reject) => {
    let platform = parsePlatforms()[0],
      bin = path.join('cache', nwVersion + '-' + nwFlavor, platform);

    // path to nw binary
    switch (platform.slice(0, 3)) {
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
        console.log(
          '%s is not available in cache. Try running `gulp build` beforehand',
          platform
        );
      }
      reject(error);
    });
  });
});

// check entire sources for potential coding issues (tweak in .jshintrc)
gulp.task('jshint', () => {
  return gulp
    .src([
      'gulpfile.js',
      'src/app/lib/*.js',
      'src/app/lib/**/*.js',
      'src/app/vendor/videojshooks.js',
      'src/app/vendor/videojsplugins.js',
      'src/app/*.js'
    ])
    .pipe(glp.jshint('.jshintrc'))
    .pipe(glp.jshint.reporter('jshint-stylish'))
    .pipe(glp.jshint.reporter('fail'));
});
// zip compress all
gulp.task('compresszip', () => {
  return Promise.all(
    nw.options.platforms.map((platform) => {
      return new Promise((resolve, reject) => {
        console.log('Packaging zip for: %s', platform);
        var sources = path.join('build', pkJson.name, platform);
        if (platform.match(/osx64/) !== null) {
          sources = path.join('build', pkJson.name, platform, '/**.app');
        }
        return gulp
          .src(sources + '/**')
          .pipe(
            zip(pkJson.name + '-' + curVersion() + '-' + platform + nwSuffix() + '.zip')
          )
          .pipe(gulp.dest(releasesDir))
          .on('end', () => {
            console.log(
              '%s zip packaged in %s',
              platform,
              path.join(process.cwd(), releasesDir)
            );
            resolve();
          });
      });
    })
  ).catch(log);
});

// beautify entire code (tweak in .jsbeautifyrc)
gulp.task('jsbeautifier', () => {
  return gulp
    .src(
      [
        'src/app/lib/*.js',
        'src/app/lib/**/*.js',
        'src/app/*.js',
        'src/app/vendor/videojshooks.js',
        'src/app/vendor/videojsplugins.js',
        '*.js',
        '*.json'
      ],
      {
        base: './'
      }
    )
    .pipe(
      glp.jsbeautifier({
        config: '.jsbeautifyrc'
      })
    )
    .pipe(glp.jsbeautifier.reporter())
    .pipe(gulp.dest('./'));
});

// clean build files (nwjs)
gulp.task(
  'clean:build',
  deleteAndLog([path.join(releasesDir, pkJson.name)], 'build files')
);

// clean dist files (dist)
gulp.task(
  'clean:dist',
  deleteAndLog([path.join(releasesDir, '*.*')], 'distribuables')
);

// clean compiled css
gulp.task('clean:css', deleteAndLog(['src/app/themes'], 'css files'));

//TODO:
//setexecutable?
//bower_clean

//TODO: test and tweak
/*gulp.task('codesign', () => {
    exec('sh dist/mac/codesign.sh || echo "Codesign failed, likely caused by not being run on mac, continuing"', (error, stdout, stderr) => {
        console.log(stdout);
    });
});
*/
gulp.task('mac-pkg', () => {
  return Promise.all(
    nw.options.platforms.map((platform) => {
      if (detectCurrentPlatform(process).indexOf('osx') === -1) {
        console.log('Packaging deb is only possible on osx');
        return null;
      }

      return new Promise((resolve, reject) => {
        console.log('Packaging for: %s', platform);

        const child = spawn('bash', ['dist/mac/pkg-maker.sh']);

        waitProcess(child).then(() => {
            console.log('%s pkg packaged in', platform, path.join(process.cwd(), releasesDir));
            return renameFile(
                path.join(process.cwd(), releasesDir),
                pkJson.name + '-' + pkJson.version + '.pkg',
                pkJson.name + '-' + curVersion() + '-osx64' + nwSuffix() + '.pkg'
            ).then(() => resolve());
        }).catch(() => {
            console.log('%s failed to package pkg', platform);
            reject();
        });
      });
    })
  ).catch(log);
});

// download and compile nwjs
gulp.task('nwjs', () => {
  return parseReqDeps()
    .then((requiredDeps) => {
      // required files
      nw.options.files = [
        './src/**',
        '!./src/app/styl/**',
        './package.json',
        './README.md',
        './CHANGELOG.md',
        './LICENSE.txt',
        './git.json'
      ];
      // add node_modules
      nw.options.files = nw.options.files.concat(requiredDeps);
      // remove junk files
      nw.options.files = nw.options.files.concat([
        '!./node_modules/**/*.bin',
        '!./node_modules/**/*.c',
        '!./node_modules/**/*.h',
        '!./node_modules/**/Makefile',
        '!./node_modules/**/*.h',
        '!./**/test*/**',
        '!./**/doc*/**',
        '!./**/example*/**',
        '!./**/demo*/**',
        '!./*/bin/**',
        '!./**/.*/**'
      ]);

      return nw.build();
    })
    .then(() => {
      return Promise.all(
        nw.options.platforms.map((platform) => {
            if (platform.indexOf('linux') === -1) {
                return null;
            }
            const child = spawn('bash', [
                'dist/linux/copy-libatomic.sh',
                releasesDir,
                pkJson.name,
                platform
            ]);
            return waitProcess(child);
        })
      );
    })
    .catch(function(error) {
      console.error(error);
    });
});

// create git.json (used in 'About')
gulp.task('injectgit', () => {
  return git.gitDescribe()
    .then(
      (gitInfo) =>
        new Promise((resolve, reject) => {
          fs.writeFile(
            'git.json',
            JSON.stringify({
              commit: gitInfo.hash.substr(1),
              semver: gitInfo.semverString.includes(pkJson.version) ? gitInfo.semverString : gitInfo.semverString + '-' + pkJson.version.split('-').slice(1).join('-'),
            }),
            (error) => {
              return error ? reject(error) : resolve(gitInfo);
            }
          );
        })
    )
    .then((gitInfo) => {
      console.log('Hash:', gitInfo.hash.substr(1));
      console.log('Raw:', gitInfo.raw);
    })
    .catch((error) => {
      console.log(error);
      console.log('Injectgit task failed');
    });
});

// compile styl files
gulp.task('css', () => {
  const sources = 'src/app/styl/*.styl',
    dest = 'src/app/themes/';

  return gulp
    .src(sources)
    .pipe(
      glp.stylus({
        use: nib()
      })
    )
    .pipe(gulp.dest(dest))
    .on('end', () => {
      console.log(
        'Stylus files compiled in %s',
        path.join(process.cwd(), dest)
      );
    });
});

// compile nsis installer
gulp.task('nsis', () => {
  return Promise.all(
    nw.options.platforms.map((platform) => {
      // nsis is for win only
      if (platform.match(/osx|linux/) !== null) {
        console.log('No `nsis` task for', platform);
        return null;
      }

      return new Promise((resolve, reject) => {
        console.log('Packaging nsis for: %s', platform);

        const child = platform === 'win32' ? spawn('makensis.exe', ['./dist/windows/installer_makensis32.nsi', '-DOUTDIR=' + path.join(process.cwd(), releasesDir)]) : spawn('makensis', ['./dist/windows/installer_makensis64.nsi', '-DOUTDIR=' + path.join(process.cwd(), releasesDir)]);

        waitProcess(child).then(() => {
          console.log('%s nsis packaged in', platform, path.join(process.cwd(), releasesDir));
          if (pkJson.version === curVersion() && !nwSuffix()) {
            resolve();
            return;
          }
          return renameFile(
            path.join(process.cwd(), releasesDir),
            pkJson.name + '-' + pkJson.version + '-' + platform + '-Setup.exe',
            pkJson.name + '-' + curVersion() + '-' + platform + nwSuffix() + '-Setup.exe'
          ).then(() => resolve());
        }).catch(() => {
          console.log('%s failed to package nsis', platform);
          reject();
        });
      });
    })
  ).catch(log);
});

// compile debian packages
// TODO: https://www.npmjs.com/package/nobin-debian-installer
gulp.task('deb', () => {
  return Promise.all(
    nw.options.platforms.map((platform) => {
      // deb is for linux only
      if (platform.match(/osx|win/) !== null) {
        console.log('No `deb` task for:', platform);
        return null;
      }
      if (detectCurrentPlatform(process).indexOf('linux') === -1) {
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
          curVersion(),
          releasesDir
        ]);

        waitProcess(child).then(() => {
            console.log('%s deb packaged in', platform, path.join(process.cwd(), releasesDir));
            if (!nwSuffix()) {
                resolve();
                return;
            }
            const suffix = platform === 'linux64' ? 'amd64' : 'i386';
            return renameFile(
                path.join(process.cwd(), releasesDir),
                pkJson.name + '-' + curVersion() + '-' + suffix + '.deb',
                pkJson.name + '-' + curVersion() + '-' + suffix + nwSuffix() + '.deb'
            ).then(() => resolve());
        }).catch(() => {
            console.log('%s failed to package deb', platform);
            reject();
        });
      });
    })
  ).catch(log);
});

// prevent commiting if conditions aren't met and force beautify (bypass with `git commit -n`)
gulp.task(
  'pre-commit',
  gulp.series('jshint', function(done) {
    // default task code here
    done();
  })
);

// build app from sources
gulp.task(
  'build',
  gulp.series('injectgit', 'css', 'nwjs', function(done) {
    // default task code here
    done();
  })
);

// create redistribuable packages
gulp.task(
  'dist',
  gulp.series(
    'build',
    'compresszip',
    'deb',
    'mac-pkg',
    'nsis',
    'cleanForDist',
    function(done) {
      // default task code here
      done();
    }
  )
);

// clean gulp-created files
gulp.task(
  'clean',
  gulp.series('clean:dist', 'clean:build', 'clean:css', function(done) {
    // default task code here
    done();
  })
);
// travis tests
gulp.task(
  'test',
  gulp.series('jshint', 'injectgit', 'css', function(done) {
    // default task code here
    done();
  })
);
