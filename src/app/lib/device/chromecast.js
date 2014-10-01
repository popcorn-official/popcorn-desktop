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


			var subtitle = streamModel.get('subFile');
			var cover = {
				title: streamModel.get('title'),
				url: streamModel.get('cover')
			};
			if (subtitle) {
				subtitles = {
					url: 'http:' + url.split(':')[1] + ':9999/subtitle.vtt',
					name: 'Subtitles',
					language: 'en-US'
				};
			}
			device.connect();
			device.on('connected', function () {
				device.play(url, 0, subtitles, cover, function (err, status) {
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
