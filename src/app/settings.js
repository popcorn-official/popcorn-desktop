var
	Settings = {},
	os = require('os'),
	data_path = require('nw.gui').App.dataPath,
	path = require('path');

/** Default settings **/

// User interface
Settings.language = 'en';
Settings.coversShowRating = false;
Settings.watchedCovers = 'fade';
Settings.showAdvancedSettings = false;

Settings.postersMinWidth = 134;
Settings.postersMaxWidth = 294;
Settings.postersMinFontSize = 0.8;
Settings.postersMaxFontSize = 1.3;
Settings.postersSizeRatio = (196 / 134);
Settings.postersWidth = Settings.postersMinWidth;
Settings.postersJump = [134, 154, 174, 194, 214, 234, 254, 274, 294];

//Playback

Settings.playNextEpisodeAuto = true;

// Advanced UI
Settings.alwaysOnTop = false;
Settings.theme = 'Official_-_Dark_theme';
Settings.ratingStars = true; //trigger on click in details
Settings.startScreen = 'Movies';
Settings.lastTab = '';

// Movies
Settings.moviesShowQuality = false;
Settings.movies_quality = 'all';

// Subtitles
Settings.subtitle_language = 'none';
Settings.subtitle_size = '28px';

// More options
Settings.tvshowApiEndpoint = 'http://eztvapi.re/';
Settings.httpApiPort = 8008;
Settings.httpApiUsername = 'popcorn';
Settings.httpApiPassword = 'popcorn';

// User settings (not set here, just init'd)
Settings.traktUsername = '';
Settings.traktPassword = '';
Settings.traktTvVersion = '0.0.2';

// Advanced options
Settings.connectionLimit = 100;
Settings.dhtLimit = 500;
Settings.streamPort = 0; // 0 = Random
Settings.tmpLocation = path.join(os.tmpDir(), 'Popcorn-Time');
Settings.databaseLocation = data_path + '/data';
Settings.deleteTmpOnClose = true;

// Hidden endpoints
Settings.updateApiEndpoint = 'http://popcorntime.io/';
/* TODO: Buy SSL for main domain + buy domain get-popcorn.re for fallback
Settings.updateApiEndpointMirror = 'https://popcorntime.cc/'; */
Settings.yifyApiEndpoint = 'http://yts.re/api/';
Settings.yifyApiEndpointMirror = 'http://yts.im/api/';
Settings.connectionCheckUrl = 'http://google.com/';

// App Settings
Settings.version = false;
Settings.dbversion = '0.1.0';
Settings.font = 'tahoma';
Settings.defaultWidth = Math.round(window.screen.availWidth * 0.8);
Settings.defaultHeight = Math.round(window.screen.availHeight * 0.8);

// Miscellaneous

Settings.tv_detail_jump_to = 'next';


var ScreenResolution = {
	get SD() {
		return window.screen.width < 1280 || window.screen.height < 720;
	},
	get HD() {
		return window.screen.width >= 1280 && window.screen.width < 1920 || window.screen.height >= 720 && window.screen.height < 1080;
	},
	get FullHD() {
		return window.screen.width >= 1920 && window.screen.width < 2000 || window.screen.height >= 1080 && window.screen.height < 1600;
	},
	get UltraHD() {
		return window.screen.width >= 2000 || window.screen.height >= 1600;
	},
	get QuadHD() {
		return window.screen.width >= 3000 || window.screen.height >= 1800;
	},
	get Standard() {
		return window.devicePixelRatio <= 1;
	},
	get Retina() {
		return window.devicePixelRatio > 1;
	}
};

var AdvSettings = {

	get: function (variable) {
		if (typeof Settings[variable] !== 'undefined') {
			return Settings[variable];
		}

		return false;
	},

	set: function (variable, newValue) {
		Database.writeSetting({
			key: variable,
			value: newValue
		}, function () {
			Settings[variable] = newValue;
		});
	},

	setup: function (callback) {
		AdvSettings.performUpgrade();
		AdvSettings.getHardwareInfo(callback);
	},

	getHardwareInfo: function (callback) {
		if (/64/.test(process.arch)) {
			AdvSettings.set('arch', 'x64');
		} else {
			AdvSettings.set('arch', 'x86');
		}

		switch (process.platform) {
		case 'darwin':
			AdvSettings.set('os', 'mac');
			break;
		case 'win32':
			AdvSettings.set('os', 'windows');
			break;
		case 'linux':
			AdvSettings.set('os', 'linux');
			break;
		default:
			AdvSettings.set('os', 'unknown');
			break;
		}

		callback();
	},

	checkApiEndpoint: function (allApis, callback) {
		var tls = require('tls'),
			URI = require('URIjs'),
			request = require('request');

		// TODO: Did we want to check api SSL at EACH load ?
		// Default timeout of 120 ms

		var numCompletedCalls = 0;
		for (var apiCheck in allApis) {
			numCompletedCalls++;
			apiCheck = allApis[apiCheck];
			var url = AdvSettings.get(apiCheck.original);
			var hostname = URI(url).hostname();
			
			if (url.match(/http:/) !== null) {
				//Not SSL
				request(url, {
					method: 'get',
				}, function (err, res, body) {
					if (err || !body || res.request.host !== hostname) {
						//If host of the response is not the same as the one we requested
						//means ISP redirected us, so go for the mirror
						Settings[apiCheck.original] = Settings[apiCheck.mirror];
					}
					if (numCompletedCalls === allApis.length) {
						callback();
					}
				});
				
			} else {
				//Is SSL
				tls.connect(443, hostname, {
					servername: hostname,
					rejectUnauthorized: false
				}, function () {
					if (!this.authorized || this.authorizationError || this.getPeerCertificate().fingerprint !== apiCheck.fingerprint) {
						// "These are not the certificates you're looking for..."
						// Seems like they even got a certificate signed for us :O
						Settings[apiCheck.original] = Settings[apiCheck.mirror];
					}

					this.end();
					if (numCompletedCalls === allApis.length) {
						callback();
					}
				}).on('error', function () {
					// No SSL support. That's convincing >.<
					Settings[apiCheck.original] = Settings[apiCheck.mirror];

					this.end();
					if (numCompletedCalls === allApis.length) {
						callback();
					}
				}).on('timeout', function () {
					// Connection timed out, we'll say its not available
					Settings[apiCheck.original] = Settings[apiCheck.mirror];
					this.end();
					if (numCompletedCalls === allApis.length) {
						callback();
					}
				}).setTimeout(10000); // Set 10 second timeout
			}
		}
	},

	performUpgrade: function () {
		// This gives the official version (the package.json one)
		gui = require('nw.gui');
		var currentVersion = gui.App.manifest.version;

		if (currentVersion !== AdvSettings.get('version')) {
			// Nuke the DB if there's a newer version
			// Todo: Make this nicer so we don't lose all the cached data
			var cacheDb = openDatabase('cachedb', '', 'Cache database', 50 * 1024 * 1024);

			cacheDb.transaction(function (tx) {
				tx.executeSql('DELETE FROM subtitle');
				tx.executeSql('DELETE FROM metadata');
			});

			// Add an upgrade flag
			window.__isUpgradeInstall = true;
		}
		AdvSettings.set('version', currentVersion);
	},
};
