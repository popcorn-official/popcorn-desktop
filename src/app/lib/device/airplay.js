(function (App) {
	'use strict';

	var browser = require('airplay-js').createBrowser();

	var collection = App.Device.Collection;

	var makeID = function (baseID) {
		return 'airplay-' + baseID.replace(':', '');
	};

	var Airplay = App.Device.Generic.extend({
		defaults: {
			type: 'airplay'
		},
		makeID: makeID,
		initialize: function (attrs) {
			this.device = attrs.device;
			this.attributes.name = this.device.name || this.device.serverInfo.model;
			this.attributes.id = this.makeID(this.device.serverInfo.macAddress || this.device.serverInfo.deviceId );
		},
		play: function (streamModel) {
			var url = streamModel.attributes.src;
			this.device.play(url);
		},
		stop: function () {
			this.device.stop(function () {});
		}
	});


	browser.on('deviceOn', function (device) {
		collection.add(new Airplay({
			device: device
		}));
	});

	browser.on('deviceOff', function (device) {
		var model = collection.get({
			id: makeID(device.id)
		});
		if (model) {
			model.destroy();
		}
	});
	App.Device.Airplay = Airplay;
})(window.App);
