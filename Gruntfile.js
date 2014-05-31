
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
};

module.exports = function(grunt) {
	"use strict";

	var buildPlatforms = parseBuildPlatforms(grunt.option('platforms'));

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('default', [
		'stylus',
		'jshint'
	]);

	grunt.registerTask('css', [
		'stylus'
	]);

	grunt.registerTask('build', [
		'default',
		'nodewebkit'
	]);

	grunt.registerTask('start', function(){
		var start = parseBuildPlatforms();
		if(start.win){
			grunt.task.run('exec:win');
		}else if(start.mac){
			grunt.task.run('exec:mac');
		}else if(start.linux32){
			grunt.task.run('exec:linux32');
		}else if(start.linux64){
			grunt.task.run('exec:linux64');
		}else{
			grunt.log.writeln('OS not supported.');
		}
	});

	grunt.initConfig({
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
			options: {
				version: '0.9.2',
				build_dir: './build', // Where the build version of my node-webkit app is saved
				keep_nw: true,
				mac_icns: './src/app/images/popcorntime.icns', // Path to the Mac icon file
				zip: buildPlatforms.win, // Zip nw for mac in windows. Prevent path too long if build all is used.
				mac: buildPlatforms.mac,
				win: buildPlatforms.win,
				linux32: buildPlatforms.linux32,
				linux64: buildPlatforms.linux64,
				download_url: 'http://cdn.get-popcorn.com/nw/'
			},
			src: ['./src/**', '!./src/app/styl/**', 
				'./node_modules/**', '!./node_modules/bower/**', '!./node_modules/*grunt*/**', '!./node_modules/stylus/**', 
				'!./**/test*/**', '!./**/doc*/**', '!./**/example*/**', '!./**/demo*/**', '!./**/bin/**', '!./**/build/**', '!./**/.*/**', 
				'./package.json', './README.md', './LICENSE.txt' ]
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
			}
		},

		jshint: {
			gruntfile: {
				options: {
					jshintrc: '.jshintrc',
					force: true
				},
				src: 'Gruntfile.js'
			},
			src: {
				options: {
					jshintrc: 'src/app/.jshintrc',
					force: true
				},
				src: ['src/app/lib/*.js','src/app/lib/**/*.js','src/app/*.js']
			}
		},

		watch: {
			options: {
				dateFormat: function(time) {
					grunt.log.writeln('Completed in ' + time + 'ms at ' + (new Date()).toLocaleTimeString());
					grunt.log.writeln('Waiting for more changes...');
				}
			},
			scripts: {
				files: ['./src/app/styl/*.styl','./src/app/styl/**/*.styl'],
				tasks: ['css']
			}
		}

	});

};
