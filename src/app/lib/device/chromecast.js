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

			var media = {
				url: url,
				subtitles: [],
				cover: {
					title: streamModel.get('title'),
					url: streamModel.get('cover')
				},
				subtitles_style: {
					backgroundColor: '#00000000', // color of background - see http://dev.w3.org/csswg/css-color/#hex-notation
					foregroundColor: '#FFFFFFFF', // color of text - see http://dev.w3.org/csswg/css-color/#hex-notation
					edgeType: 'OUTLINE', // border of text - can be: "NONE", "OUTLINE", "DROP_SHADOW", "RAISED", "DEPRESSED"
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

			var subtitle = streamModel.get('subFile');
			var cover = {
				title: streamModel.get('title'),
				url: streamModel.get('cover')
			};
			if (subtitle) {
				media.subtitles.push({
					url: 'http:' + url.split(':')[1] + ':9999/subtitle.vtt',
					name: 'Subtitles',
					language: 'en-US'
				});
			}
			device.connect();
			device.on('connected', function () {
				device.play(media, function (err, status) {
					console.log('Playing ' + url + ' on ' + name);
				});
			});
		},

		pause: function () {
			this.get('device').pause(function () {});
		},

		stop: function () {
			this.get('device').stop(function () {});
		},

		forward: function () {
			this.get('device').seek(30, function () {});
		},

		backward: function () {
			this.get('device').seek(-30, function () {});
		},

		unpause: function () {
			this.get('device').unpause(function () {});
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
