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
			device.connect();
			device.on('connected', function(){
				device.play(url, 0, function(){
					console.log('Playing '+ url + ' on '+ name);
				});
			});
		}
	});

	var browser = new chromecast.Browser();

	browser.on('deviceOn', function(device){
		console.log(device);
		collection.add(new Chromecast({
					id: 'chromecast',
					name: "Chromecast",
					type: 'chromecast',
					device: device
				}));
	});

	App.Device.Chromecast = Chromecast;
})(window.App);