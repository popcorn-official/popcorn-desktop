(function (App) {
	'use strict';
	var prettyBytes = require('pretty-bytes');

	var StreamInfo = Backbone.Model.extend({
		initialize: function () {
			var engine = this.get('engine');

			var self = this;

			engine.once('ready', function () {
				var size = 0;
				engine.files.forEach(function (file) {
					size += file.length || 0;
				});
				self.set('size', size);
			});

			this.on('change:size', function () {
				self.set('sizeFormatted', prettyBytes(self.get('size')));
			});

			this.set('size', 0);
		},

		updateStats: function () {
			var active = function (wire) {
				return !wire.peerChoking;
			};
			var engine = this.get('engine');
			var swarm = engine.swarm;
			var BUFFERING_SIZE = 10 * 1024 * 1024;
			var converted_speed = 0;
			var converted_downloaded = 0;
			var buffer_percent = 0;

			var upload_speed = swarm.uploadSpeed(); // upload speed
			var final_upload_speed = '0 B/s';
			if (!isNaN(upload_speed) && upload_speed !== 0) {
				final_upload_speed = prettyBytes(upload_speed) + '/s';
			}

			var download_speed = swarm.downloadSpeed(); // download speed
			var final_download_speed = '0 B/s';
			if (!isNaN(download_speed) && download_speed !== 0) {
				final_download_speed = prettyBytes(download_speed) + '/s';
			}

			var downloaded = swarm.downloaded || 0; // downloaded
			var final_downloaded = '0 B';
			if (downloaded !== 0) {
				final_downloaded = prettyBytes(downloaded);
			}

			var final_downloaded_percent = 100 / this.get('size') * downloaded;

			if (final_downloaded_percent >= 100) {
				final_downloaded_percent = 100;
			}

			var downloadTimeLeft = Math.round((this.get('size') - swarm.downloaded) / swarm.downloadSpeed()); // time to wait before download complete
			if (isNaN(downloadTimeLeft) || downloadTimeLeft < 0) {
				downloadTimeLeft = 0;
			}

			this.set('pieces', swarm.piecesGot);
			this.set('downloaded', downloaded);
			this.set('active_peers', swarm.wires.filter(active).length);
			this.set('total_peers', swarm.wires.length);

			this.set('uploadSpeed', final_upload_speed); // variable for Upload Speed
			this.set('downloadSpeed', final_download_speed); // variable for Download Speed
			this.set('downloadedFormatted', final_downloaded); // variable for Downloaded
			this.set('downloadedPercent', final_downloaded_percent); // variable for Downloaded percentage
			this.set('time_left', downloadTimeLeft); // variable for time left before 100% downloaded

			buffer_percent = downloaded / (BUFFERING_SIZE / 100);
			if (buffer_percent >= 100) {
				buffer_percent = 99; // wait for subtitles
			}
			this.set('buffer_percent', buffer_percent);
		}
	});

	App.Model.StreamInfo = StreamInfo;
})(window.App);
