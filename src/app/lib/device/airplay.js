(function(App) {
	'use strict';

	var browser = require( 'airplay-js' ).createBrowser();

	var collection = App.Device.Collection;

	var makeID=  function (baseID) {
		return 'airplay-' + baseID;
	};

	var Airplay = App.Device.Generic.extend ({
		defaults: {
			type: 'airplay'
		},
		initialize: function () {
			this.device = this.model.get('device');
			this.model.set('name', this.device.name);
			this.id = makeID(this.device.id);
		},
		play: function (device, url) {
			this.device.play(url);
		}
	});


	browser.on( 'deviceOn', function( device ) {
		collection.add(new Airplay ({device: device}));
	});

	browser.on( 'deviceOff', function( device ) {
		var model = collection.get ({id: makeID(device.id)});
		if (model) {
			model.destroy();
		}
	});

	browser.start();

	App.Device.Airplay = Airplay;
})(window.App);
