(function(App) {
	'use strict';

	var inherits = require('util').inherits;
	var chromecast = require('chromecast-js');
	var collection = App.Device.Collection;

	var Chromecast = App.Device.Generic.extend ({
		defaults: {
			type: 'chromecast',
		},

		play: function(streamModel) {
			// "" So it behaves when spaces in path
			// TODO: Subtitles
			var url = streamModel.attributes.src;
			var name = this.get('name');
			var device = this.get('device');
			this.set('url', url);
			device.connect();
			device.on('connected', function() {
				device.load(url, 0, function() {
					console.log('Playing ' + url + ' on ' + name);
				});
			});
		},

		pause: function() {
			this.get('device').pause(function(){});
		},

		stop: function() {
			this.get('device').stop(function(){});
		},

		unpause: function() {
			this.get('device').player.play(function(){});
		}
	});

	var browser = new chromecast.Browser();

	browser.on('deviceOn', function(device) {
		console.log(device.config);
		collection.add(new Chromecast({
			id: 'chromecast-'+device.config.name.replace(' ', '-'),
			name: device.config.name,
			type: 'chromecast',
			device: device
		}));
	});

	App.Device.Chromecast = Chromecast;
})(window.App);
