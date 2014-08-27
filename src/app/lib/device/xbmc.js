(function(App) {
	'use strict';

	var browser = require( 'airplay-xbmc' ).createBrowser();

	var collection = App.Device.Collection;

	var makeID=  function (baseID) {
		return 'airplay-xbmc' + baseID;
	};

	var AirplayXBMC = App.Device.Airplay.extend ({
		defaults: {
			type: 'airplay-xbmc'
		},
                makeID: makeID
	});

	browser.on( 'deviceOn', function( device ) {
		collection.add(new AirplayXBMC ({device: device}));
	});

	browser.on( 'deviceOff', function( device ) {
		var model = collection.get ({id: makeID(device.id)});
		if (model) {
			model.destroy();
		}
	});

	browser.start();

	App.Device.AirplayXBMC = AirplayXBMC;
})(window.App);
