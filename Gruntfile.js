var projectName = 'Butter';

var getHost = function () {
    return {
        get linux() {
            return process.platform === 'linux';
        },
        get windows() {
            return process.platform === 'win32';
        },
        get mac() {
            return process.platform === 'darwin';
        },
    };
};

var parseBuildPlatforms = function (argumentPlatform) {
    // this will make it build no platform when the platform option is specified
    // without a value which makes argumentPlatform into a boolean
    var inputPlatforms = argumentPlatform || process.platform + ";" + process.arch;

    // Do some scrubbing to make it easier to match in the regexes bellow
    inputPlatforms = inputPlatforms.replace("darwin", "mac");
    inputPlatforms = inputPlatforms.replace(/;ia|;x|;arm/, "");

    var buildAll = /^all$/.test(inputPlatforms);

    var buildPlatforms = {
        mac: /mac/.test(inputPlatforms) || buildAll,
        win: /win/.test(inputPlatforms) || buildAll,
        linux32: /linux32/.test(inputPlatforms) || buildAll,
        linux64: /linux64/.test(inputPlatforms) || buildAll
    };

    return buildPlatforms;
};

module.exports = function (grunt) {
    "use strict";

    var host = getHost();
    var buildPlatforms = parseBuildPlatforms(grunt.option('platforms'));
    var pkgJson = grunt.file.readJSON('package.json');
    var currentVersion = pkgJson.version;

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('default', [
        'css',
        'jshint',
        'bower_clean',
        'injectgit'
    ]);

    // Called from the npm hook
    grunt.registerTask('setup', [
        'githooks'
    ]);

    grunt.registerTask('css', [
        'stylus:official'
    ]);

    grunt.registerTask('themes', [
        'shell:themes',
        'clean:css',
        'stylus:official',
        'stylus:third_party'
    ]);

    grunt.registerTask('js', [
        'jsbeautifier:default'
    ]);

    grunt.registerTask('build', [
        'injectgit',
        'bower_clean',
        'lang',
        'themes',
        'nodewebkit',
        'shell:setexecutable'
    ]);
    grunt.registerTask('lang', ['shell:language']);

    grunt.registerTask('dist', [
        'clean:releases',
        'clean:dist',
        'clean:update',
        'build',
        'clean:nwjs',
        'exec:codesign', // mac
        'exec:createDmg', // mac
        'exec:createWinInstall',
        'exec:pruneProduction',
        'exec:createLinuxInstall',
        'exec:createWinUpdate',
        'package' // all platforms
    ]);


    grunt.registerTask('start', function () {
        var start = parseBuildPlatforms();
        if (start.win) {
            grunt.task.run('exec:win');
        } else if (start.mac) {
            grunt.task.run('exec:mac');
        } else if (start.linux32) {
            grunt.task.run('exec:linux32');
        } else if (start.linux64) {
            grunt.task.run('exec:linux64');
        } else {
            grunt.log.writeln('OS not supported.');
        }
    });

    grunt.registerTask('package', [
        'shell:packageLinux64',
        'shell:packageDEBLinux64',
        'shell:packageLinux32',
        'shell:packageDEBLinux32',
        'shell:packageWin',
        'shell:packageMac'
    ]);

    grunt.registerTask('injectgit', function () {
        if (grunt.file.exists('.git/')) {
            var gitBranch, currCommit;
            var path = require('path');
            var gitRef = grunt.file.read('.git/HEAD');
            try {
                gitRef = gitRef.split(':')[1].trim();
                gitBranch = path.basename(gitRef);
                currCommit = grunt.file.read('.git/' + gitRef).trim();
            } catch (e) {
                var fs = require('fs');
                currCommit = gitRef.trim();
                var items = fs.readdirSync('.git/refs/heads');
                gitBranch = items[0];
            }
            var git = {
                branch: gitBranch,
                commit: currCommit
            };
            grunt.file.write('.git.json', JSON.stringify(git, null, '  '));
        }
    });

    grunt.initConfig({
        githooks: {
            all: {
                'pre-commit': 'jsbeautifier:default jsbeautifier:verify jshint',
            }
        },

        jsbeautifier: {
            options: {
                config: ".jsbeautifyrc"
            },

            default: {
                src: ["src/app/lib/*.js", "src/app/lib/**/*.js", "src/app/*.js", "src/app/vendor/videojshooks.js", "src/app/vendor/videojsplugins.js", "*.js", "*.json"],
            },

            verify: {
                src: ["src/app/lib/*.js", "src/app/lib/**/*.js", "src/app/*.js", "src/app/vendor/videojshooks.js", "src/app/vendor/videojsplugins.js", "*.js", "*.json"],
                options: {
                    mode: 'VERIFY_ONLY'
                }
            }
        },

        stylus: {
            third_party: {
                options: {
                    'resolve url': true,
                    use: ['nib'],
                    compress: false,
                    paths: ['src/app/styl']
                },
                expand: true,
                cwd: 'src/app/styl',
                src: 'third_party/*.styl',
                dest: 'src/app/themes/',
                ext: '.css'
            },
            official: {
                options: {
                    'resolve url': true,
                    use: ['nib'],
                    compress: false,
                    paths: ['src/app/styl']
                },
                expand: true,
                cwd: 'src/app/styl',
                src: '*.styl',
                dest: 'src/app/themes/',
                ext: '.css'
            }
        },

        nodewebkit: {
            options: {
                version: '0.12.2',
                build_dir: './build', // Where the build version of my node-webkit app is saved
                keep_nw: true,
                embed_nw: false,
                mac_icns: './src/app/images/butter.icns', // Path to the Mac icon file
                macZip: buildPlatforms.win, // Zip nw for mac in windows. Prevent path too long if build all is used.
                mac: buildPlatforms.mac,
                win: buildPlatforms.win,
                linux32: buildPlatforms.linux32,
                linux64: buildPlatforms.linux64,
                download_url: 'http://get.popcorntime.io/nw/'
            },
            src: ['./src/**', '!./src/app/styl/**',
                './node_modules/**', '!./node_modules/bower/**',
                '!./node_modules/*grunt*/**', '!./node_modules/stylus/**',
                '!./node_modules/nw-gyp/**', '!./node_modules/**/*.bin',
                '!./node_modules/**/*.c', '!./node_modules/**/*.h',
                '!./node_modules/**/Makefile', '!./node_modules/**/*.h',
                '!./**/test*/**', '!./**/doc*/**', '!./**/example*/**',
                '!./**/demo*/**', '!./**/bin/**', '!./**/build/**', '!./**/.*/**',
                './package.json', './README.md', './CHANGELOG.md', './LICENSE.txt',
                './.git.json'
            ]
        },

        exec: {
            win: {
                cmd: '"build/cache/win/<%= nodewebkit.options.version %>/nw.exe" .'
            },
            mac: {
                cmd: 'build/cache/mac/<%= nodewebkit.options.version %>/node-webkit.app/Contents/MacOS/nwjs .'
            },
            linux32: {
                cmd: '"build/cache/linux32/<%= nodewebkit.options.version %>/nw" .'
            },
            linux64: {
                cmd: '"build/cache/linux64/<%= nodewebkit.options.version %>/nw" .'
            },
            codesign: {
                cmd: 'sh dist/mac/codesign.sh || echo "Codesign failed, likely caused by not being run on mac, continuing"'
            },
            createDmg: {
                cmd: 'dist/mac/yoursway-create-dmg/create-dmg --volname "' + projectName + '-' + currentVersion + '" --background ./dist/mac/background.png --window-size 480 540 --icon-size 128 --app-drop-link 240 370 --icon "'+ projectName + +'" 240 110 ./build/releases/'+ projectName + '/mac/'+ projectName + '-' + currentVersion + '-Mac.dmg ./build/releases/'+ projectName + '/mac/ || echo "Create dmg failed, likely caused by not being run on mac, continuing"'
            },
            createWinInstall: {
                cmd: 'makensis dist/windows/installer_makensis.nsi',
                maxBuffer: Infinity
            },
            createLinuxInstall: {
                cmd: 'sh dist/linux/exec_installer.sh'
            },
            createWinUpdate: {
                cmd: 'sh dist/windows/updater_package.sh'
            },
            pruneProduction: {
                cmd: 'npm prune --production'
            }
        },

        jshint: {
            gruntfile: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: 'Gruntfile.js'
            },
            src: {
                options: {
                    jshintrc: 'src/app/.jshintrc'
                },
                src: ['src/app/lib/*.js', 'src/app/lib/**/*.js', 'src/app/vendor/videojshooks.js', 'src/app/vendor/videojsplugins.js', 'src/app/*.js']
            }
        },

        shell: {
            themes: {
                command: [
                    'git submodule init',
                    'cd src/app/styl/third_party/',
                    'git submodule update --init',
                    'git pull origin master --force'
                ].join('&&')
            },
            language: {
                command: [
                    'git submodule init',
                    'cd src/app/language/',
                    'git submodule update --init',
                    'git pull origin master --force'
                ].join('&&')
            },
            setexecutable: {
                command: function () {
                    if (host.linux || host.mac) {
                        return [
                            'pct_rel="build/releases/'+projectName+'"',
                            'chmod -R +x ${pct_rel}/mac/'+projectName+'.app || : ',
                            'chmod +x ${pct_rel}/linux*/'+projectName+'/'+projectName+' || : '
                        ].join(' && ');
                    } else {
                        return 'echo ""'; // Not needed in Windows
                    }
                }
            },
            packageLinux64: {
                command: function () {
                    if (host.linux || host.mac) {
                        return [
                            'cp build/cache/linux64/<%= nodewebkit.options.version %>/icudtl.dat build/releases/'+projectName+'/linux64/'+projectName,
                            'cp -r build/cache/linux64/<%= nodewebkit.options.version %>/locales build/releases/'+projectName+'/linux64/'+projectName,
                            'cp dist/linux/linux-installer build/releases/'+projectName+'/linux64/'+projectName+'/install',
                            'cp dist/linux/butter.png build/releases/'+projectName+'/linux64/'+projectName,
                            'cd build/releases/'+projectName+'/linux64/'+projectName,
                            'chmod +x install',
                            'tar --exclude-vcs -c . | $(command -v pxz || command -v xz) -T8 -7 > "../'+projectName+'-' + currentVersion + '-Linux-64.tar.xz"',
                            'echo "Linux64 Sucessfully packaged" || echo "Linux64 failed to package"'
                        ].join(' && ');
                    } else {
                        return [
                            'cp build/cache/linux64/<%= nodewebkit.options.version %>/icudtl.dat build/releases/'+projectName+'/linux64/'+projectName,
                            'cp -r build/cache/linux64/<%= nodewebkit.options.version %>/locales build/releases/'+projectName+'/linux64/'+projectName,
                            'cp dist/linux/linux-installer build/releases/'+projectName+'/linux64/'+projectName+'/install',
                            'cp dist/linux/butter.png build/releases/'+projectName+'/linux64/'+projectName,
                            'grunt compress:linux64',
                            '( echo "Compressed sucessfully" ) || ( echo "Failed to compress" )'
                        ].join(' && ');
                    }
                }
            },
            packageLinux32: {
                command: function () {
                    if (host.linux || host.mac) {
                        return [
                            'cp build/cache/linux32/<%= nodewebkit.options.version %>/icudtl.dat build/releases/'+projectName+'/linux32/'+projectName,
                            'cp -r build/cache/linux32/<%= nodewebkit.options.version %>/locales build/releases/'+projectName+'/linux32/'+projectName,
                            'cp dist/linux/linux-installer build/releases/'+projectName+'/linux32/'+projectName+'/install',
                            'cp dist/linux/butter.png build/releases/'+projectName+'/linux32/'+projectName,
                            'cd build/releases/'+projectName+'/linux32/'+projectName,
                            'chmod +x install',
                            'tar --exclude-vcs -c . | $(command -v pxz || command -v xz) -T8 -7 > "../'+projectName+'-' + currentVersion + '-Linux-32.tar.xz"',
                            'echo "Linux32 Sucessfully packaged" || echo "Linux32 failed to package"'
                        ].join(' && ');
                    } else {
                        return [
                            'cp build/cache/linux32/<%= nodewebkit.options.version %>/icudtl.dat build/releases/'+projectName+'/linux32/'+projectName,
                            'cp -r build/cache/linux32/<%= nodewebkit.options.version %>/locales build/releases/'+projectName+'/linux32/'+projectName,
                            'cp dist/linux/linux-installer build/releases/'+projectName+'/linux32/'+projectName+'/install',
                            'cp dist/linux/butter.png build/releases/'+projectName+'/linux32/'+projectName,
                            'grunt compress:linux32',
                            '( echo "Compressed sucessfully" ) || ( echo "Failed to compress" )'
                        ].join(' && ');
                    }
                }
            },
            packageDEBLinux32: {
                command: function () {
                    if (host.linux) {
                        return [
                            'sh dist/linux/deb-maker.sh <%= nodewebkit.options.version %> linux32',
                            'echo "Linux32 Debian Package successfully built" || echo "Linux32 failed to create the Debian Package"'
                        ].join(' && ');
                    } else {
                        return [
                            'echo "Building debian package is not supported on Windows or Mac"'
                        ].join(' && ');
                    }
                }
            },
            packageDEBLinux64: {
                command: function () {
                    if (host.linux) {
                        return [
                            'sh dist/linux/deb-maker.sh <%= nodewebkit.options.version %> linux64',
                            'echo "Linux64 Debian Package successfully built" || echo "Linux64 failed to create the Debian Package"'
                        ].join(' && ');
                    } else {
                        return [
                            'echo "Building debian package is not supported on Windows or Mac"'
                        ].join(' && ');
                    }
                }
            },
            packageWin: {
                command: function () {
                    if (host.linux || host.mac) {
                        return [
                            'cp build/cache/win/<%= nodewebkit.options.version %>/icudtl.dat build/releases/'+projectName+'/win/'+projectName,
                            'cp -r build/cache/win/<%= nodewebkit.options.version %>/locales build/releases/'+projectName+'/win/'+projectName,
                            'cd build/releases/'+projectName+'/win/'+projectName,
                            'tar --exclude-vcs -c . | $(command -v pxz || command -v xz) -T8 -7 > "../'+projectName+'-' + currentVersion + '-Win.tar.xz"',
                            'echo "Windows Sucessfully packaged" || echo "Windows failed to package"'
                        ].join(' && ');
                    } else {
                        return [
                            'cp build/cache/win/<%= nodewebkit.options.version %>/icudtl.dat build/releases/'+projectName+'/win/'+projectName,
                            'cp -r build/cache/win/<%= nodewebkit.options.version %>/locales build/releases/'+projectName+'/win/'+projectName,
                            'grunt compress:windows',
                            '( echo "Compressed sucessfully" ) || ( echo "Failed to compress" )'
                        ].join(' && ');
                    }
                }
            },
            packageMac: {
                command: function () {
                    if (host.linux || host.mac) {
                        return [
                            'cd build/releases/'+projectName+'/mac/',
                            'tar --exclude-vcs -c '+projectName+'.app | $(command -v pxz || command -v xz) -T8 -7 > "'+projectName+'-' + currentVersion + '-Mac.tar.xz"',
                            'echo "Mac Sucessfully packaged" || echo "Mac failed to package"'
                        ].join(' && ');
                    } else {
                        return [
                            'grunt compress:mac',
                            '( echo "Compressed sucessfully" ) || ( echo "Failed to compress" )'
                        ].join(' && ');
                    }
                }
            }
        },

        compress: {
            linux32: {
                options: {
                    mode: 'tgz',
                    archive: 'build/releases/'+projectName+'/linux32/'+projectName+'-' + currentVersion + '-Linux-32.tar.gz'
                },
                expand: true,
                cwd: 'build/releases/'+projectName+'/linux32/'+projectName,
                src: '**',
                dest: projectName
            },
            linux64: {
                options: {
                    mode: 'tgz',
                    archive: 'build/releases/'+projectName+'/linux64/'+projectName+'-' + currentVersion + '-Linux-64.tar.gz'
                },
                expand: true,
                cwd: 'build/releases/'+projectName+'/linux64/'+projectName,
                src: '**',
                dest: projectName
            },
            mac: {
                options: {
                    mode: 'tgz',
                    archive: 'build/releases/'+projectName+'/mac/'+projectName+'-' + currentVersion + '-Mac.tar.gz'
                },
                expand: true,
                cwd: 'build/releases/'+projectName+'/mac/',
                src: '**',
                dest: projectName
            },
            windows: {
                options: {
                    mode: 'tgz',
                    archive: 'build/releases/'+projectName+'/win/'+projectName+'-' + currentVersion + '-Win.tar.gz'
                },
                expand: true,
                cwd: 'build/releases/'+projectName+'/win/'+projectName,
                src: '**',
                dest: projectName
            }
        },

        clean: {
            releases: ['build/releases/'+projectName+'/**'],
            css: ['src/app/themes/**'],
            dist: ['dist/windows/*-Setup.exe', 'dist/mac/*.dmg'],
            update: ['build/updater/*.*'],
            nwjs: ['build/cache/**/<%= nodewebkit.options.version %>/*pdf*', 'build/cache/**/<%= nodewebkit.options.version %>/*credits*']
        },

        watch: {
            options: {
                dateFormat: function (time) {
                    grunt.log.writeln('Completed in ' + time + 'ms at ' + (new Date()).toLocaleTimeString());
                    grunt.log.writeln('Waiting for more changes...');
                }
            },
            scripts: {
                files: ['./src/app/styl/*.styl', './src/app/styl/**/*.styl'],
                tasks: ['css']
            }
        }

    });

};
