(function(App) {
	'use strict';

	var inherits = require('util').inherits;
	var path = require('path');
	var fs = require('fs');
	var readdirp = require('readdirp');
	var async = require('async');
	var _this;

	var externalPlayers = ['VLC', 'MPlayer OSX Extended', 'MPlayer', 'mpv'];
	var playerCmds = [];
	var playerSwitches = [];
	playerCmds['VLC'] = '/Contents/MacOS/VLC';
	playerCmds['MPlayer OSX Extended'] = '/Contents/Resources/Binaries/mpextended.mpBinaries/Contents/MacOS/mplayer';

	playerSwitches['VLC'] = ' --no-video-title-show --sub-filter=marq --marq-marquee="'+ i18n.__('Streaming From Popcorn Time') + '" --marq-position=8 --marq-timeout=3000 --sub-file=';
	playerSwitches['MPlayer OSX Extended'] = ' -font "/Library/Fonts/Arial Bold.ttf" -sub ';
	playerSwitches['MPlayer'] = ' -sub ';
	playerSwitches['mpv'] = ' -sub ';

	var searchPaths = {};
	searchPaths.linux = ['/usr/bin', '/usr/local/bin'];
	searchPaths.darwin = ['/Applications'];
	searchPaths.win32 = ['\\C:\\Program Files\\', '\\C:\\Program Files (x86)\\'];

	var External = function () {
		App.Device.Generic.call(this);
		_this = this;
	};

	inherits(External, App.Device.Generic);

	External.prototype.initialize = function () {
		this.type = 'external';
		findExternalPlayers();
	};

	External.prototype.play = function(device, url) {
		var extraCmd = ''; // MAC needs to delve into the .app to get the actual executable
		if(process.platform === 'darwin') {
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
		var found = [];
		var search = toLowerCaseArray(externalPlayers.slice(0));
		async.each(searchPaths[process.platform], function(folderName, pathcb) {
			folderName = path.resolve(folderName);
			console.log('Scanning: '+ folderName);
			var appIndex = -1;
			var fileStream = readdirp({root: folderName, depth: 3});
			fileStream.on('data', function(d) {
				var app = d.name.replace(path.extname(d.name), '').toLowerCase();
				appIndex = search.indexOf(app);
				if(appIndex !== -1) {
					if(found.indexOf(app) === -1) { // don't know why I have to do this, for some reason it finds stuff 3 times (probably cos depth is 3)
						found.push(app);
						console.log('Found External Player: '+ app + ' in '+ d.fullParentDir);
						_this.add({id: externalPlayers[appIndex], name: externalPlayers[appIndex], path: d.fullPath});
					}
				}

			});
			fileStream.on('end', function() {
				pathcb();
			});
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
