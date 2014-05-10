module.exports = function(grunt) {
	"use strict";

	var buildPlatforms = parseBuildPlatforms(grunt.option('platforms'));

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('default', [
		'stylus'
	]);

	grunt.registerTask('css', [
		'stylus'
	]);

	grunt.registerTask('nodewkbuild', [
		'nodewebkit:build',
		'copy:ffmpeg'
	]);

	grunt.registerTask('build', [
		'default',
		'nodewebkit:build'
	]);

	grunt.registerTask('dist', [
		'default',
		'nodewebkit:dist',
		'copy:package'
	]);

	grunt.initConfig({
		bump: {
			options: {
				files: ['package.json'],
				pushTo: 'origin'
			}
		},

		stylus: {
			compile: {
				options: {
					compress: false,
					'resolve url': true,
					use: ['nib'],
					paths: ['src/app/styl']
				},
				files: {
					'src/app/css/app.css' : 'src/app/styl/app.styl'
				}
			}
		},

		nodewebkit: {
			build: {
				options: {
					version: '0.9.2',
					build_dir: './build', // Where the build version of my node-webkit app is saved
					mac_icns: './src/app/images/popcorntime.icns', // Path to the Mac icon file
					mac: buildPlatforms.mac,
					win: buildPlatforms.win,
					linux32: buildPlatforms.linux32,
					linux64: buildPlatforms.linux64,
					download_url: 'http://nw.get-popcorn.com/'
				},
				src: ['./src/**', './node_modules/**', '!./node_modules/bower/**', '!./node_modules/grunt*/**', '!./node_modules/stylus/**', './package.json', './README.md', './LICENSE.txt' ]
			},
			dist: {
				options: {
					version: '0.9.2',
					build_dir: './build', // Where the build version of my node-webkit app is saved
					embed_nw: false, // Don't embed the .nw package in the binary
					keep_nw: true,
					mac_icns: './src/app/images/popcorntime.icns', // Path to the Mac icon file
					mac: buildPlatforms.mac,
					win: buildPlatforms.win,
					linux32: buildPlatforms.linux32,
					linux64: buildPlatforms.linux64,
					download_url: 'http://nw.get-popcorn.com/'
				},
				src: ['./src/**', './node_modules/**', '!./node_modules/bower/**', '!./node_modules/grunt*/**', '!./node_modules/stylus/**', './package.json', './README.md', './LICENSE.txt' ]
			}
		},

		copy: {
			package: {
				files: [
					{
						src: 'build/releases/Popcorn-Time/Popcorn-Time.nw',
						dest: 'build/releases/Popcorn-Time/linux32/Popcorn-Time/package.nw',
						flatten: true
					},{
						src: 'build/releases/Popcorn-Time/Popcorn-Time.nw',
						dest: 'build/releases/Popcorn-Time/linux64/Popcorn-Time/package.nw',
						flatten: true
					}
				]
			}
		},
		
		exec: {
			win: {
				cmd: '"build/cache/win/<%= nodewebkit.build.options.version %>/nw.exe" .'
			},
			mac: {
				cmd: 'open -n "build/cache/mac/<%= nodewebkit.build.options.version %>/node-webkit.app" --args .'
			},
			linux32: {
				cmd: '"build/cache/linux32/<%= nodewebkit.build.options.version %>/nw" .'
			},
			linux64: {
				cmd: '"build/cache/linux64/<%= nodewebkit.build.options.version %>/nw" .'
			}
		},

		watch: {
			options: {
				dateFormat: function(time) {
					grunt.log.writeln('Completed in ' + time + 'ms at ' + (new Date()).toLocaleTimeString());
					grunt.log.writeln('Waiting for more changes...');
				},
			},
			scripts: {
				files: ['./src/app/styl/*.styl','./src/app/styl/**/*.styl'],
				tasks: ['css']
			},
		},
	});

};

var parseBuildPlatforms = function(argumentPlatform) {
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
}