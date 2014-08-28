(function(App) {
	'use strict';

	var path = require('path');
	var fs = require('fs');
	var readdirp = require('readdirp');
	var async = require('async');
	var collection = App.Device.Collection;
	var child = require('child_process');

	var External = App.Device.Generic.extend ({
		defaults: {
			type: 'external',
			name: i18n.__('External Player'),
		},

		play: function(streamModel) {
			// "" So it behaves when spaces in path
			// TODO: Subtitles
			var url = streamModel.attributes.src;
			var cmd = path.normalize('"'+ this.get('path') + '"');
			var subtitle = streamModel.attributes.subFile || '';
			cmd += getPlayerSwitches(this.get('id')) + '"'+ subtitle + '" ' + url;
			win.info('Launching External Player: '+ cmd);
			child.exec(cmd);
		},

		pause: function() {
			var cmd = path.normalize('"'+ this.get('path') + '"');
			cmd += ' '+ this.get('pause');
			child.exec(cmd);
		},

		stop: function() {
			var cmd = path.normalize('"'+ this.get('path') + '"');
			cmd += ' '+ this.get('stop');
			child.exec(cmd);
		},

		unpause: function() {
			var cmd = path.normalize('"'+ this.get('path') + '"');
			cmd += ' '+ this.get('unpause');
			child.exec(cmd);
		}
	});

	function getPlayerName(loc) {
		return path.basename(loc).replace(path.extname(loc), '');
	}

	function getPlayerCmd(loc) {
		var name = getPlayerName(loc);
		return players[name].cmd;
	}

	function getPlayerSwitches(loc) {
		var name = getPlayerName(loc);
		return players[name].switches || '';
	}

	var players = {
		'VLC': {
			type: 'vlc',
			cmd: '/Contents/MacOS/VLC',
			switches: ' --no-video-title-show --sub-file=',
			stop: 'vlc://quit',
			pause: 'vlc://pause'
		},
		'MPlayer OSX Extended': {
			type: 'mplayer',
			cmd: '/Contents/Resources/Binaries/mpextended.mpBinaries/Contents/MacOS/mplayer',
			switches: ' -font "/Library/Fonts/Arial Bold.ttf" -sub '
		},
		'MPlayer': {
			type: 'mplayer',
			switches: ' -sub '
		},
		'mpv': {
			type: 'mpv',
			switches: ' --sub-file='
		},
		'MPC-HC': {
			type: 'mpc-hc',
			switches: ' /sub '
		},	
		'MPC-HC64': {
			type: 'mpc-hc',
			switches: ' /sub '
		}
	};

	/* map name back into the object as we use it in match */
	_.each(players, function (v, k) {
		players[k].name = k;
	});

	var searchPaths = {
		linux: ['/usr/bin', '/usr/local/bin'],
		darwin: ['/Applications'],
		win32: ['C:\\Program Files\\', 'C:\\Program Files (x86)\\']
	};

	var folderName = '';
	var found = {};

	async.each(searchPaths[process.platform], function(folderName, pathcb) {
		folderName = path.resolve(folderName);
		console.log('Scanning: '+ folderName);
		var appIndex = -1;
		var fileStream = readdirp({root: folderName, depth: 3});
		fileStream.on('data', function(d) {
			var app = d.name.replace('.app', '').replace('.exe', '').toLowerCase();
			var match = _.filter(players, function (v, k) {
				return k.toLowerCase() === app;
			});

			if (match.length) {
				match = match[0];
				console.log('Found External Player: '+ app + ' in '+ d.fullParentDir);
				collection.add(new External({
					id: match.name,
					type: 'external-' + match.type,
					name: match.name,
					path: d.fullPath
				}));

			}
		});
		fileStream.on('end', function() {
			pathcb();
		});
	}, function(err) {

		if(err) {
			console.error(err);
			return;
		}
		else {
			console.log('Scan Finished');
			return;
		}
	});

	App.Device.External = External;
})(window.App);
