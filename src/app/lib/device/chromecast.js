(function (App) {
	'use strict';

	var req = require('request'),
		inherits = require('util').inherits,
		chromecast = require('chromecast-js'),
		collection = App.Device.Collection;

	var Chromecast = App.Device.Generic.extend({
		defaults: {
			type: 'chromecast',
			typeFamily: 'external'
		},

		_makeID: function (baseID) {
			return 'chromecast-' + baseID.replace(' ', '-');
		},

		initialize: function (attrs) {
			this.device = attrs.device;
			this.attributes.id = this._makeID(this.device.config.name);
			this.attributes.name = this.device.config.name;
			this.attributes.address = this.device.host;
		},

		play: function (streamModel) {
			var self = this;
			var subtitle = streamModel.get('subFile');
			var cover = streamModel.get('cover');
			var url = streamModel.get('src');
			this.attributes.url = url;
			var media;

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
						backgroundColor: AdvSettings.get('subtitle_decoration') === 'Opaque Background' ?  '#000000FF' : '#00000000', // color of background - see http://dev.w3.org/csswg/css-color/#hex-notation
						foregroundColor: AdvSettings.get('subtitle_color') + 'ff', // color of text - see http://dev.w3.org/csswg/css-color/#hex-notation
						edgeType: AdvSettings.get('subtitle_decoration') === 'Outline' ? 'OUTLINE' : 'NONE', // border of text - can be: "NONE", "OUTLINE", "DROP_SHADOW", "RAISED", "DEPRESSED"
						edgeColor: '#000000FF', // color of border - see http://dev.w3.org/csswg/css-color/#hex-notation
						fontScale: ((parseFloat(AdvSettings.get('subtitle_size')) / 28) * 1.3).toFixed(1), // size of the text - transforms into "font-size: " + (fontScale*100) +"%"
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
			win.info('chromecast: Play ' + url + ' on \'' + this.get('name') + '\'');
			win.info('chromecast: > connecting to ' + this.device.host);

			this.device.play(media, 0, function (err, status) {
				if (err) {
					win.error('chromecast.play error: ', err);
				} else {
					win.info('Playing ' + url + ' on ' + self.get('name'));
					self.set('loadedMedia', status.media);
				}
			});
			this.device.on('status', function (status) {
				self._internalStatusUpdated(status);
			});
		},

		pause: function () {
			this.get('device').pause(function () {});
		},

		stop: function () {
			var device = this.get('device');
			// Also stops player and closes connection.
			device.stop(function () {
				device.removeAllListeners();
				win.info('chromecast stopped. listeners removed!');
			});
		},

		seek: function (seconds) {
			win.info('chromecast.seek %s', seconds);
			this.get('device').seek(seconds, function (err, status) {
				if (err) {
					win.info('Chromecast.seek:Error', err);
				}
			});
		},

		seekTo: function (newCurrentTime) {
			win.info('chromecast.seekTo %ss', newCurrentTime);
			this.get('device').seekTo(newCurrentTime, function (err, status) {
				if (err) {
					win.info('Chromecast.seekTo:Error', err);
				}
			});
		},

		seekPercentage: function (percentage) {
			win.info('chromecast.seekPercentage %s%', percentage.toFixed(2));
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

		updateStatus: function () {
			var self = this;

			this.get('device').getStatus(function (status) {
				self._internalStatusUpdated(status);
			});
		},

		_internalStatusUpdated: function (status) {
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
			device: device
		}));
	});

	App.Device.Chromecast = Chromecast;
})(window.App);
