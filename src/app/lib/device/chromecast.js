(function (App) {
	'use strict';

	var inherits = require('util').inherits;
	var chromecast = require('chromecast-js');
	var collection = App.Device.Collection;

	var Chromecast = App.Device.Generic.extend({
		defaults: {
			type: 'chromecast',
		},

		play: function (streamModel) {
			// "" So it behaves when spaces in path
			// TODO: Subtitles
			var url = streamModel.get('src');
			var subtitles = null;
			var name = this.get('name');
			var device = this.get('device');
			this.set('url', url);
			var self = this;
			var media;

			var subtitle = streamModel.get('subFile');

			if (subtitle) {
				media = {
					url: url,
					subtitles: [{
						url: 'http:' + url.split(':')[1] + ':9999/subtitle.vtt',
						name: 'Subtitles',
						language: 'en-US'
					}],
					cover: {
						title: streamModel.get('title'),
						url: streamModel.get('cover')
					},
					subtitles_style: {
						backgroundColor: '#00000000', // color of background - see http://dev.w3.org/csswg/css-color/#hex-notation
						foregroundColor: AdvSettings.get('subtitle_color'), // color of text - see http://dev.w3.org/csswg/css-color/#hex-notation
						edgeType: AdvSettings.get('subtitle_shadow') ? 'DROP_SHADOW' : 'OUTLINE', // border of text - can be: "NONE", "OUTLINE", "DROP_SHADOW", "RAISED", "DEPRESSED"
						edgeColor: '#000000FF', // color of border - see http://dev.w3.org/csswg/css-color/#hex-notation
						fontScale: 1.3, // size of the text - transforms into "font-size: " + (fontScale*100) +"%"
						fontStyle: 'NORMAL', // can be: "NORMAL", "BOLD", "BOLD_ITALIC", "ITALIC",
						fontFamily: 'Helvetica',
						fontGenericFamily: 'SANS_SERIF', // can be: "SANS_SERIF", "MONOSPACED_SANS_SERIF", "SERIF", "MONOSPACED_SERIF", "CASUAL", "CURSIVE", "SMALL_CAPITALS",
						windowColor: '#00000000', // see http://dev.w3.org/csswg/css-color/#hex-notation
						windowRoundedCornerRadius: 0, // radius in px
						windowType: 'NONE' // can be: "NONE", "NORMAL", "ROUNDED_CORNERS"
					}
				};
			} else {
				media = {
					url: url,
					cover: {
						title: streamModel.get('title'),
						url: streamModel.get('cover')
					}
				};
			}

			device.connect();
			device.on('connected', function () {
				device.play(media, 0, function (err, status) {
					if (err) console.log('chromecast.play error');
					else {
						console.log('Playing ' + url + ' on ' + name);
						self.set('loadedMedia', status.media);
					}
				});
			});
			device.on('status', function(status) {
				if (status.playerState == 'IDLE') {
					self._internalStatusUpdated(status);
					console.log('chromecast.idle: listeners removed!');
					device.removeAllListeners();
				} else {
					self._internalStatusUpdated(status);
				}
			});
		},

		pause: function () {
			this.get('device').pause(function () {});
		},

		stop: function () {
			var device = this.get('device');

			device.stop(function () {
				// No need to keep a connection open to the chromecast, when not playing any media.
				// This however requires chromecast-js to create a new Client object in its connect method,
				// since close() renders the client un-reusable.
				// See https://github.com/guerrerocarlos/chromecast-js/pull/9
				device.close();
			});
		},

		seek: function(seconds) {
			console.log('chromecast.seek %s', seconds);
			this.get('device').seek(seconds, function (err, status) {
				if (err) console.log('Chromecast.seek:Error', err);
			});
		},
		
		seekTo: function(newCurrentTime) {
			console.log('chromecast.seekTo %ss', newCurrentTime);
			this.get('device').seekTo(newCurrentTime, function(err, status) {
				if (err) console.log('Chromecast.seekTo:Error', err);
			});
		},
		
		seekPercentage: function(percentage) {
			console.log('chromecast.seekPercentage %s%', percentage.toFixed(2));
			var newCurrentTime = this.get('loadedMedia').duration / 100 * percentage;
			this.seekTo(newCurrentTime.toFixed());
		},

		forward: function () {
			this.seek(30);
		},

		backward: function () {
			this.seek(-30);
		},

		unpause: function () {
			this.get('device').unpause(function () {});
		},

		updateStatus: function() {
			var self = this;
			
			this.get('device').getStatus(function(status) {
				self._internalStatusUpdated(status);
			});
		},

		_internalStatusUpdated: function(status) {
			if (status.media === undefined) {
				status.media = this.get('loadedMedia');
			}
			// If this is the active device, propagate the status event.
			if (collection.selected.id === this.id) {
				App.vent.trigger('device:status', status);
			}
		}
	});

	var browser = new chromecast.Browser();

	browser.on('deviceOn', function (device) {
		collection.add(new Chromecast({
			id: 'chromecast-' + device.config.name.replace(' ', '-'),
			name: device.config.name,
			type: 'chromecast',
			device: device
		}));
	});

	App.Device.Chromecast = Chromecast;
})(window.App);
