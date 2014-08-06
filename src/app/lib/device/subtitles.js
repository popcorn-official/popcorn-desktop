(function(App) {
	'use strict';

	var request = require('request');
	var AdmZip = require('adm-zip');
	var fs = require('fs');
	var async = require('async');
	var path = require('path');
	var mkdirp = require('mkdirp');

	var self;

	var downloadZip = function(data, callback) {
		var filePath = data.path;
		var subUrl = data.url;

		var fileFolder = path.dirname(filePath);
		var fileExt = path.extname(filePath);
		var newName = filePath.substring(0,filePath.lastIndexOf(fileExt)) + '.srt';

		var zipPath = filePath.substring(0,filePath.lastIndexOf(fileExt)) + '.zip';

		var unzipPath = filePath.substring(0,filePath.lastIndexOf(fileExt));
		unzipPath = unzipPath.substring(0, unzipPath.lastIndexOf(path.sep));
		
		var out = fs.createWriteStream(zipPath);
		var req = request(
			{
				method: 'GET',
				uri: subUrl,
			}
		);

		req.pipe(out);
		req.on('end', function() {
			var zip = new AdmZip(zipPath),
			zipEntries = zip.getEntries();
			zip.extractAllTo(/*target path*/unzipPath, /*overwrite*/true);
			fs.unlink(zipPath, function(err){});
			win.debug('Subtitle extracted to : '+ unzipPath);
			var files = fs.readdirSync(unzipPath);
			for(var f in files) {
				if(path.extname(files[f]) === '.srt') {
					break;
				}
			}
			fs.renameSync(path.join(unzipPath, files[f]), newName);
			return callback(newName);
		});

	};

	var downloadSRT = function(data, callback) {
		var filePath = data.path;
		var subUrl = data.url;
		var fileExt = path.extname(filePath);
		var srtPath = filePath.substring(0,filePath.lastIndexOf(fileExt)) + '.srt';
		var out = fs.createWriteStream(srtPath);
		var req = request(
			{
				method: 'GET',
				uri: subUrl,
			}
		);

		req.pipe(out);
		req.on('end', function() {
			win.debug('Subtitle downloaded to : '+ srtPath);
			return callback(srtPath);
		});

	};
	var Subtitles = Backbone.Model.extend ({
		initialize: function () {
			console.log('In Subtitles');
			App.vent.on('subtitle:download', this.downloadSubtitle);
			self = this;
		},
		downloadSubtitle : function(data) {
			console.log(data);
			var fileFolder = path.dirname(data.path);
			var subExt = data.url.split('.').pop();

			try {
				mkdirp.sync(fileFolder);
			} catch(e) {
				// Ignore EEXIST
			}
			if(subExt === 'zip') {
				downloadZip(data, function(location) {
					App.vent.trigger('subtitles:downloaded', location);
				});
			}
			else if(subExt === 'srt') {
				downloadSRT(data, function(location) {
					App.vent.trigger('subtitles:downloaded', location);
				});
			}
		}
	});

	App.Device.Subtitles = new Subtitles();
})(window.App);