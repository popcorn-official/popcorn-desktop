(function(App) {
	'use strict';

	var inherits = require('util').inherits;
	var path = require('path');
	var fs = require('fs');
	var readdir_recursive = require('fs-readdir-recursive');
	var async = require('async');

	var externalPlayers = ['VLC', 'MPlayer OSX Extended', 'MPlayer', 'mpv'];
	var playerCmds = [];
	var playerSwitches = [];
	playerCmds['VLC'] = '/Contents/MacOS/VLC';
	playerCmds['MPlayer OSX Extended'] = '/Contents/Resources/Binaries/mpextended.mpBinaries/Contents/MacOS/mplayer';

	playerSwitches['VLC'] = ' --no-video-title-show --sub-filter=marq --marq-marquee="Streaming From Popcorn Time" --marq-position=8 --marq-timeout=3000 --sub-file=';
	playerSwitches['MPlayer OSX Extended'] = ' -font "/Library/Fonts/Arial Bold.ttf" -sub ';
	playerSwitches['MPlayer'] = ' -sub ';
	playerSwitches['mpv'] = ' -sub ';

	var searchPaths = {};
	searchPaths.linux = ['/usr/bin', '/usr/local/bin'];
	searchPaths.mac = ['/Applications'];
	searchPaths.windows = ['"C:\\Program Files\\"', '"C:\\Program Files (x86)\\"'];

	var External = function () {
		App.Device.Generic.call(this);
	};

	inherits(External, App.Device.Generic);

	External.prototype.initialize = function () {
		this.type = 'external';
		console.log('EXTERNAL!!!');
		findExternalPlayers();
	};

	External.prototype.play = function(device, url) {
		var extraCmd = ''; // MAC needs to delve into the .app to get the actual executable
		if(Settings.os === 'mac') {
			extraCmd =  getPlayerCmd(device.path);
		}

		var cmd = '"'+ device.path + extraCmd +'"'; // So it behaves when spaces in path

		// TODO: Subtitles
		win.info('Launching External Player: '+ cmd + ' ' +  url);
		process.exec(cmd + ' '+  url);

	};

	function toLowerCaseArray(arr) {
		var i = arr.length;
		while ( --i >= 0 ) {
			if ( typeof arr[i] === 'string' ) {
				arr[i] = arr[i].toLowerCase();
			}
		}
		return arr;
	}

	function findExternalPlayers() {
		var folderName = '';
		var players = [];
		var search = toLowerCaseArray(externalPlayers.slice(0));
		async.each(searchPaths[Settings.os], function(folderName, pathcb) {
			console.log('Scanning: '+ folderName);
			var appIndex = -1;
			var data = readdir_recursive(folderName);
			if(data) {
				async.each(
					data,
					function(d, cb) {
						var app = d.replace(path.extname(d), '').toLowerCase();
						appIndex = search.indexOf(path.basename(app));
						if(appIndex !== -1) {
							console.log('Found External Player: '+ app + ' in '+ folderName);
							this.add({id: externalPlayers[appIndex], name: externalPlayers[appIndex], path: path.join(folderName, d)});
						}
						cb();
					},
					function(err, data) {
						pathcb();
					}
				);
			}
		},
		function(err) {
			if(err) {
				console.error(err);
				return;
			}
			else {
				console.log('Scan Finished');
				return;
			}
		});
	}

	function getPlayerName(loc) {
		return path.basename(loc).replace(path.extname(loc), '');
	}

	function getPlayerCmd(loc) {
		var name = getPlayerName(loc);
		return playerCmds[name];
	}

	App.Device.External = new External();
})(window.App);
