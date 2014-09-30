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

	grunt.loadNpmTasks('grunt-bower-clean');
	grunt.loadNpmTasks('grunt-jsbeautifier');

	grunt.registerTask('default', [
		'css',
		'jshint',
		'bower_clean',
		'injectgit'
	]);

	grunt.registerTask('css', [
		'clean:css',
		'officalcss'
	]);

	grunt.registerTask('themes', [
		'update_submodules',
		'unofficalcss'
	]);

	grunt.registerTask('js', [
		'jsbeautifier'
	]);

	grunt.registerTask('build', [
		'css',
		'injectgit',
		'bower_clean',
		'nodewebkit'
	]);

	grunt.registerTask('dist', [
		'clean:releases',
		'build',
		'exec:createDmg', // mac
		'exec:createWinInstall',
		'exec:createLinuxInstall',
		'compress' // win & linux
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
		'stylus:third_party'
	]);

	grunt.registerTask('injectgit', function () {
		if (grunt.file.exists('.git/')) {
			var path = require('path');
			var gitRef = grunt.file.read('.git/HEAD').split(':')[1].trim();
			var gitBranch = path.basename(gitRef);
			if (grunt.file.exists('.git/' + gitRef)) {
				var currCommit = grunt.file.read('.git/' + gitRef).trim();
				var git = {
					branch: gitBranch,
					commit: currCommit
				};
				grunt.file.write('.git.json', JSON.stringify(git, null, '  '));
			}
		}
	});

	grunt.initConfig({

		jsbeautifier: {
			files: ["src/app/lib/**/*.js", "src/app/*.js", "*.js", "*.json"],
			options: {
				config: ".jsbeautifyrc"
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
				zip: buildPlatforms.win, // Zip nw for mac in windows. Prevent path too long if build all is used.
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
			createDmg: {
				cmd: 'dist/mac/yoursway-create-dmg/create-dmg --volname "Popcorn Time ' + currentVersion + '" --background ./dist/mac/background.png --window-size 480 540 --icon-size 128 --app-drop-link 240 370 --icon "Popcorn-Time" 240 110 ./build/releases/Popcorn-Time/mac/Popcorn-Time-' + currentVersion + '-Mac.dmg ./build/releases/Popcorn-Time/mac/'
			},
			createWinInstall: {
				cmd: 'makensis dist/windows/installer.nsi'
			},
			createLinuxInstall: {
				cmd: 'bash dist/linux/exec_installer.sh'
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

		update_submodules: {
			default: {
				options: {
					params: "--force" // specifies your own command-line parameters
				}
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
			windows: {
				options: {
					mode: 'zip',
					archive: 'build/releases/Popcorn-Time/win/Popcorn-Time-' + currentVersion + '-Win.zip'
				},
				expand: true,
				cwd: 'dist/windows',
				src: 'Popcorn Time-' + currentVersion + '-Setup.exe',
				dest: ''
			}
		},

		clean: {
			releases: ['build/releases/Popcorn-Time/**'],
			css: ['src/app/themes/**']
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
