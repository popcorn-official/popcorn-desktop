(function(App) {
	'use strict';

	var request = require('request');
	var AdmZip = require('adm-zip');
	var fs = require('fs');
	var async = require('async');
	var path = require('path');
	var mkdirp = require('mkdirp');
	var captions = require('node-captions');

	var self;

	var downloadZip = function(data, callback) {
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
		req.on('end', function() {
			try {
				var zip = new AdmZip(zipPath),
					zipEntries = zip.getEntries();
				zip.extractAllTo( /*target path*/ unzipPath, /*overwrite*/ true);
				fs.unlink(zipPath, function(err) {});
				win.debug('Subtitle extracted to : ' + newName);
				var files = fs.readdirSync(unzipPath);
				for (var f in files) {
					if (path.extname(files[f]) === '.srt') {
						break;
					}
				}
				fs.renameSync(path.join(unzipPath, files[f]), newName);
				return callback(newName);
			} catch (e) {
				win.error('Error downloading subtitle: ' + e);
				return callback(null);
			}
		});

	};

	var downloadSRT = function(data, callback) {
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
		req.on('end', function() {
			win.debug('Subtitle downloaded to : ' + srtPath);
			return callback(srtPath);
		});

	};
	var Subtitles = Backbone.Model.extend({
		defaults: {
			id: 'generic',
			name: 'Generic'
		},
		initialize: function() {
			App.vent.on('subtitle:download', this.download);
			App.vent.on('subtitle:convert', this.convert);
			self = this;
		},
		get: function(data) {
			win.error('Not implemented in parent model');
		},
		download: function(data) {
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
					downloadZip(data, function(location) {
						App.vent.trigger('subtitle:downloaded', location);
					});
				} else if (subExt === 'srt') {
					downloadSRT(data, function(location) {
						App.vent.trigger('subtitle:downloaded', location);
					});
				}
			} else {
				App.vent.trigger('subtitle:downloaded', null);
			}
		},
		convert: function(data) { // Converts .srt's to .vtt's
			var srt = data.path;
			var vtt = srt.replace('.srt', '.vtt');
			captions.srt.read(srt, function(err, data) {
				if (err) {
					return console.log(err);
				}
				fs.writeFile(vtt, captions.vtt.generate(captions.srt.toJSON(data), function(err, result) {
					if (err) {
						return console.log(err);
					} else {
						App.vent.trigger('subtitle:converted', vtt);
					}
				}));
			});

		},

	});

	App.Subtitles = {
		Generic: new Subtitles()
	};
})(window.App);