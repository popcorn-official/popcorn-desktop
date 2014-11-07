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
		'officalcss'
	]);

	grunt.registerTask('themes', [
		'shell:themes',
		'unofficalcss'
	]);

	grunt.registerTask('js', [
		'jsbeautifier:default'
	]);

	grunt.registerTask('build', [
		'css',
		'injectgit',
		'bower_clean',
		'lang',
		'nodewebkit',
		'shell:setexecutable'
	]);
	grunt.registerTask('lang', ['shell:language']);

	grunt.registerTask('dist', [
		'clean:releases',
		'clean:dist',
		'build',
		'exec:codesign', // mac
		'exec:createDmg', // mac
		'exec:createWinInstall',
		'exec:createWinUpdate',
		'exec:createLinuxInstall',
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

	grunt.registerTask('officalcss', [
		'stylus:offical'
	]);
	grunt.registerTask('unofficalcss', [
		'clean:css',
		'stylus:third_party'
	]);

	grunt.registerTask('package', [
		'shell:packageLinux64',
		'shell:packageLinux32',
		'shell:packageWin',
		'shell:packageMac'
	]);

	grunt.registerTask('injectgit', function () {
		if (grunt.file.exists('.git/')) {
			var path = require('path');
			var gitRef = grunt.file.read('.git/HEAD');
			try {
				var gitRef = gitRef.split(':')[1].trim();
				var gitBranch = path.basename(gitRef);
				var currCommit = grunt.file.read('.git/' + gitRef).trim();
			}
			catch (e) {
				var fs = require('fs');
				var currCommit = gitRef.trim();
				var items = fs.readdirSync('.git/refs/heads');
				var gitBranch = items[0];
			}
			var git = {
				branch: gitBranch,
				commit: currCommit
			}
			grunt.file.write('.git.json', JSON.stringify(git, null, '  '));
		}
	});

	grunt.initConfig({
		githooks: {
			all: {
				'pre-commit': 'jsbeautifier:verify jshint',
			}
		},

		jsbeautifier: {
			options: {
				config: ".jsbeautifyrc"
			},

			default: {
				src: ["src/app/lib/**/*.js", "src/app/*.js", "*.js", "*.json"],
			},

			verify: {
				src: ["src/app/lib/**/*.js", "src/app/*.js", "*.js", "*.json"],
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
				cwd: 'src/app/styl/third_party',
				src: '*.styl',
				dest: 'src/app/themes/',
				ext: '.css'
			},
			offical: {
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
				version: '0.9.2',
				build_dir: './build', // Where the build version of my node-webkit app is saved
				keep_nw: true,
				embed_nw: false,
				mac_icns: './src/app/images/popcorntime.icns', // Path to the Mac icon file
				macZip: buildPlatforms.win, // Zip nw for mac in windows. Prevent path too long if build all is used.
				mac: buildPlatforms.mac,
				win: buildPlatforms.win,
				linux32: buildPlatforms.linux32,
				linux64: buildPlatforms.linux64,
				download_url: 'http://cdn.popcorntime.io/nw/'
			},
			src: ['./src/**', '!./src/app/styl/**',
				'./node_modules/**', '!./node_modules/bower/**', '!./node_modules/*grunt*/**', '!./node_modules/stylus/**',
				'!./**/test*/**', '!./**/doc*/**', '!./**/example*/**', '!./**/demo*/**', '!./**/bin/**', '!./**/build/**', '!./**/.*/**',
				'./package.json', './README.md', './LICENSE.txt', './.git.json'
			]
		},

		exec: {
			win: {
				cmd: '"build/cache/win/<%= nodewebkit.options.version %>/nw.exe" .'
			},
			mac: {
				cmd: 'build/cache/mac/<%= nodewebkit.options.version %>/node-webkit.app/Contents/MacOS/node-webkit .'
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
				cmd: 'dist/mac/yoursway-create-dmg/create-dmg --volname "Popcorn Time ' + currentVersion + '" --background ./dist/mac/background.png --window-size 480 540 --icon-size 128 --app-drop-link 240 370 --icon "Popcorn-Time" 240 110 ./build/releases/Popcorn-Time/mac/Popcorn-Time-' + currentVersion + '-Mac.dmg ./build/releases/Popcorn-Time/mac/'
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
				src: ['src/app/lib/*.js', 'src/app/lib/**/*.js', 'src/app/*.js']
			}
		},

		shell: {
			themes: {
				command: [
					'git submodule init',
					'cd src/app/styl/third_party/',
					'git checkout master',
					'git pull --force',
					'cd ../../../../',
					'git submodule update',
					'cd src/app/styl/third_party/',
					'git reset --hard origin/master'
				].join('&&')
			},
			language: {
				command: [
					'git submodule init',
					'cd src/app/language/',
					'git checkout master',
					'git pull --force',
					'cd ../../../',
					'git submodule update',
					'cd src/app/language/',
					'git reset --hard origin/master'
				].join('&&')
			}, 
			setexecutable: {
				command: [
				'pct_rel="build/releases/Popcorn-Time"',
				'chmod -R +x ${pct_rel}/mac/Popcorn-Time.app || : ',
				'chmod +x ${pct_rel}/linux*/Popcorn-Time/Popcorn-Time || : '
				].join('&&')
			},
			packageLinux64: {
				command: [
				'cd build/releases/Popcorn-Time/linux64/Popcorn-Time',
				'tar -cf "../Popcorn-Time-' + currentVersion + '-Linux-64.tar.xz" *',
				'echo "Linux64 Sucessfully packaged" || echo "Linux64 failed to package"'
				].join('&&')
			},
			packageLinux32: {
				command: [
				'cd build/releases/Popcorn-Time/linux32/Popcorn-Time',
				'tar -cf "../Popcorn-Time-' + currentVersion + '-Linux-32.tar.xz" *',
				'echo "Linux32 Sucessfully packaged" || echo "Linux32 failed to package"' 
				].join('&&')
			},
			packageWin: {
				command: [
				'cd build/releases/Popcorn-Time/win/Popcorn-Time',
				'tar -cf "../Popcorn-Time-' + currentVersion + '-Win.tar.xz" *',
				'echo "Windows Sucessfully packaged" || echo "Windows failed to package"' 
				].join('&&')
			},
			packageMac: {
				command: [
				'cd build/releases/Popcorn-Time/mac/',
				'tar -cf "Popcorn-Time-' + currentVersion + '-Mac.tar.xz" Popcorn-Time.app',
				'echo "Mac Sucessfully packaged" || echo "Mac failed to package"' 
				].join('&&')
			}
		},

		compress: {
			linux32: {
				options: {
					mode: 'tgz',
					archive: 'build/releases/Popcorn-Time/linux32/Popcorn-Time-' + currentVersion + '-Linux-32.tar.gz'
				},
				expand: true,
				cwd: 'build/releases/Popcorn-Time/linux32/Popcorn-Time',
				src: '**',
				dest: 'Popcorn-Time'
			},
			linux64: {
				options: {
					mode: 'tgz',
					archive: 'build/releases/Popcorn-Time/linux64/Popcorn-Time-' + currentVersion + '-Linux-64.tar.gz'
				},
				expand: true,
				cwd: 'build/releases/Popcorn-Time/linux64/Popcorn-Time',
				src: '**',
				dest: 'Popcorn-Time'
			},
			mac: {
				options: {
					mode: 'tgz',
					archive: 'build/releases/Popcorn-Time/mac/Popcorn-Time-' + currentVersion + '-Mac.tar.gz'
				},
				expand: true,
				cwd: 'build/releases/Popcorn-Time/mac/',
				src: '**',
				dest: ''
			},
			windows: {
				options: {
					mode: 'zip',
					archive: 'build/releases/Popcorn-Time/win/Popcorn-Time-' + currentVersion + '-Win.zip'
				},
				expand: true,
				cwd: 'build/releases/Popcorn-Time/win/Popcorn-Time',
				src: '**',
				dest: 'Popcorn-Time'
			}
		},

		clean: {
			releases: ['build/releases/Popcorn-Time/**'],
			css: ['src/app/themes/**'],
			dist: ['dist/windows/Popcorn-*-Setup.exe']
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
