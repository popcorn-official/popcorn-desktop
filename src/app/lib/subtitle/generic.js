(function (App) {
	'use strict';

	var request = require('request');
	var AdmZip = require('adm-zip');
	var fs = require('fs');
	var async = require('async');
	var path = require('path');
	var mkdirp = require('mkdirp');
	var captions = require('node-captions');
	var iconv = require('iconv-lite');

	var self;

	var downloadZip = function (data) {
		return Q.Promise(function (resolve, reject) {
			var filePath = data.path;
			var subUrl = data.url;

			var fileFolder = path.dirname(filePath);
			var fileExt = path.extname(filePath);
			var newName = filePath.substring(0, filePath.lastIndexOf(fileExt)) + '.srt';

			var zipPath = filePath.substring(0, filePath.lastIndexOf(fileExt)) + '.zip';

			var unzipPath = filePath.substring(0, filePath.lastIndexOf(fileExt));
			unzipPath = unzipPath.substring(0, unzipPath.lastIndexOf(path.sep));

			var out = fs.createWriteStream(zipPath);
			var req = request({
				method: 'GET',
				uri: subUrl,
			});

			req.pipe(out);
			req.on('end', function () {
				try {
					var zip = new AdmZip(zipPath),
						zipEntries = zip.getEntries();
					zip.extractAllTo( /*target path*/ unzipPath, /*overwrite*/ true);
					fs.unlink(zipPath, function (err) {});
					win.debug('Subtitle extracted to : ' + newName);
					var files = fs.readdirSync(unzipPath);
					for (var f in files) {
						if (path.extname(files[f]) === '.srt') {
							break;
						}
					}
					fs.renameSync(path.join(unzipPath, files[f]), newName);
					resolve(newName);
				} catch (e) {
					win.error('Error downloading subtitle: ' + e);
					reject();
				}
			});

		});
	};

	var downloadSRT = function (data, callback) {
		return Q.Promise(function (resolve, reject) {
			var filePath = data.path;
			var subUrl = data.url;
			var fileExt = path.extname(filePath);
			var srtPath = filePath.substring(0, filePath.lastIndexOf(fileExt)) + '.srt';
			var out = fs.createWriteStream(srtPath);
			var req = request({
				method: 'GET',
				uri: subUrl,
			});

			req.pipe(out);
			req.on('end', function () {
				win.debug('Subtitle downloaded to : ' + srtPath);
				resolve(srtPath);
			});
		});

	};
	var Subtitles = Backbone.Model.extend({
		defaults: {
			id: 'generic',
			name: 'Generic'
		},
		initialize: function () {
			App.vent.on('subtitle:download', this.download);
			App.vent.on('subtitle:convert', this.convert);
			self = this;
		},
		get: function (data) {
			win.error('Not implemented in parent model');
		},
		download: function (data) {
			console.log(data);
			if (data.path && data.url) {
				var fileFolder = path.dirname(data.path);
				var subExt = data.url.split('.').pop();

				try {
					mkdirp.sync(fileFolder);
				} catch (e) {
					// Ignore EEXIST
				}
				if (subExt === 'zip') {
					downloadZip(data)
						.then(function (location) {
							App.vent.trigger('subtitle:downloaded', location);
						});
				} else if (subExt === 'srt') {
					downloadSRT(data)
						.then(function (location) {
							App.vent.trigger('subtitle:downloaded', location);
						});
				}
			} else {
				App.vent.trigger('subtitle:downloaded', null);
			}
		},
		convert: function (data, cb) { // Converts .srt's to .vtt's
			try {
				var srt = data.path;
				var vtt = srt.replace('.srt', '.vtt');
				var lang = data.language;
				var encoding = 'utf8';
				iconv.extendNodeEncodings();
				var langInfo = App.Localization.langcodes[lang] || {};
				if (langInfo.encoding !== undefined) {
					encoding = langInfo.encoding[0].replace('-', '');
				}
				win.debug(data);
				win.debug('Encoding: ' + encoding);
				captions.srt.read(srt, {
					encoding: encoding
				}, function (err, data) {
					if (err) {
						return cb(err, null);
					}
					try {
						fs.writeFile(vtt, captions.vtt.generate(captions.srt.toJSON(data)), encoding, function (err) {
							if (err) {
								return cb(err, null);
							} else {
								App.vent.trigger('subtitle:converted', vtt);
								return cb(null, {
									vtt: vtt,
									encoding: encoding
								});
							}
						});
					} catch (e) {
						win.error('Error writing vtt');
					}
				});
			} catch (e) {
				win.error('error parsing subtitles');
				App.vent.trigger('subtitle:converted', vtt);
				return cb(null, {
					vtt: '',
					encoding: 'utf8'
				});
			}

		},

	});

	App.Subtitles = {
		Generic: new Subtitles()
	};
})(window.App);
