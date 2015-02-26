(function (App) {
	'use strict';

	var path = require('path');
	var fs = require('fs');
	var readdirp = require('readdirp');
	var async = require('async');
	var collection = App.Device.Collection;
	var child = require('child_process');

	var ExtPlayer = App.Device.Generic.extend({
		defaults: {
			type: 'ext-app',
			name: i18n.__('External Player'),
		},

		play: function (streamModel) {
			// "" So it behaves when spaces in path
			var url = streamModel.attributes.src;
			var cmd = path.normalize('"' + this.get('path') + '" ') + getPlayerSwitches(this.get('id')) + ' ';
			var subtitle = streamModel.attributes.subFile || '';
			if (subtitle !== '') {

				if ((this.get('id') === 'mplayer') || (this.get('id') === 'MPlayer OSX Extended')) {
					//detect charset
					var dataBuff = fs.readFileSync(subtitle);
					var charsetDetect = require('jschardet');
					//var targetEncodingCharset = 'utf8';
					var charset = charsetDetect.detect(dataBuff);
					var detectedEncoding = charset.encoding;
					win.debug('Subtitle charset detected: %s', detectedEncoding);
					if (detectedEncoding.toLowerCase() === 'utf-8') {
						cmd += '-utf8 ';
					}
				}
				cmd += getPlayerSubSwitch(this.get('id')) + '"' + subtitle + '" ';
			}
			if (getPlayerFilenameSwitch(this.get('id')) !== '') {
				// The video file is the biggest file in the torrent
				var videoFile = _.sortBy(streamModel.attributes.torrent.info.files, function (file) {
					return -file.length;
				})[0];
				cmd += videoFile ? (getPlayerFilenameSwitch(this.get('id')) + '"' + videoFile.name + '" ') : '';
			}
			cmd += url;
			win.info('Launching External Player: ' + cmd);
			child.exec(cmd, function (error, stdout, stderr) {
				App.vent.trigger('player:close');
				App.vent.trigger('stream:stop');
				App.vent.trigger('preload:stop');
			});
		},

		pause: function () {},

		stop: function () {},

		unpause: function () {}
	});

	function getPlayerName(loc) {
		return path.basename(loc).replace(path.extname(loc), '');
	}

	function getPlayerSubSwitch(loc) {
		var name = getPlayerName(loc);
		return players[name].subswitch || '';
	}

	function getPlayerFilenameSwitch(loc) {
		var name = getPlayerName(loc);
		return players[name].filenameswitch || '';
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
			switches: '--no-video-title-show',
			subswitch: '--sub-file=',
			stop: 'vlc://quit',
			pause: 'vlc://pause'
		},
		'Fleex player': {
			type: 'fleex-player',
			cmd: '/Contents/MacOS/Fleex player',
			filenameswitch: '-file-name '
		},
		'MPlayer OSX Extended': {
			type: 'mplayer',
			cmd: '/Contents/Resources/Binaries/mpextended.mpBinaries/Contents/MacOS/mplayer',
			switches: '-font "/Library/Fonts/Arial Bold.ttf"',
			subswitch: '-sub '
		},
		'mplayer': {
			type: 'mplayer',
			cmd: 'mplayer',
			switches: '-really-quiet',
			subswitch: '-sub '
		},
		'mpv': {
			type: 'mpv',
			switches: '',
			subswitch: '--sub-file='
		},
		'MPC-HC': {
			type: 'mpc-hc',
			switches: '',
			subswitch: '/sub '
		},
		'MPC-HC64': {
			type: 'mpc-hc',
			switches: '',
			subswitch: '/sub '
		},
		'SMPlayer': {
			type: 'smplayer',
			switches: '',
			subswitch: '-sub ',
			stop: 'smplayer -send-action quit',
			pause: 'smplayer -send-action pause'
		},
	};

	/* map name back into the object as we use it in match */
	_.each(players, function (v, k) {
		players[k].name = k;
	});

	var searchPaths = {
		linux: ['/usr/bin', '/usr/local/bin'],
		darwin: ['/Applications', process.env.HOME + '/Applications'],
		win32: [process.env.SystemDrive + '\\Program Files\\']
	};

	var addPath = function (path) {
		if (fs.existsSync(path)) {
			searchPaths[process.platform].push(path);
		}
	};

	addPath(process.env.SystemDrive + '\\Program Files (x86)\\');
	addPath(process.env.LOCALAPPDATA + '\\Apps\\2.0\\');

	var folderName = '';
	var birthtimes = {};

	async.each(searchPaths[process.platform], function (folderName, pathcb) {
		folderName = path.resolve(folderName);
		win.info('Scanning: ' + folderName);
		var appIndex = -1;
		var fileStream = readdirp({
			root: folderName,
			depth: 3
		});
		fileStream.on('data', function (d) {
			var app = d.name.replace('.app', '').replace('.exe', '').toLowerCase();
			var match = _.filter(players, function (v, k) {
				return k.toLowerCase() === app;
			});

			if (match.length) {
				match = match[0];
				var birthtime = d.stat.birthtime;
				var previousBirthTime = birthtimes[match.name];
				if (!previousBirthTime || birthtime > previousBirthTime) {
					if (!previousBirthTime) {
						collection.add(new ExtPlayer({
							id: match.name,
							type: 'external-' + match.type,
							name: match.name,
							path: d.fullPath
						}));
						win.info('Found External Player: ' + match.name + ' in ' + d.fullParentDir);
					} else {
						collection.findWhere({
							id: match.name
						}).set('path', d.fullPath);
						win.info('Updated External Player: ' + app + ' with more recent version found in ' + d.fullParentDir);
					}
					birthtimes[match.name] = birthtime;
				}
			}
		});
		fileStream.on('end', function () {
			pathcb();
		});
	}, function (err) {

		if (err) {
			console.error(err);
			return;
		} else {
			win.info('External players Scan Finished');
			return;
		}
	});

	App.Device.ExtPlayer = ExtPlayer;
})(window.App);
