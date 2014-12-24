(function (App) {
	'use strict';

	var UpnpC = require('dlna-js').ControlPoint;
	var MediaRendererClient = require('upnp-mediarenderer-client');
	var collection = App.Device.Collection;
	var control = UpnpC.UpnpControlPoint;
	var cp = new control();

	var makeID = function (baseID) {
		return 'dlna-' + baseID.replace(':', '');
	};

	var Dlna = App.Device.Generic.extend({
		defaults: {
			type: 'dlna'
		},
		makeID: makeID,

		initialize: function (attrs) {
			this.device = attrs.device;
			this.client = new MediaRendererClient(this.device.location);
			this.attributes.name = this.device.friendlyName;
			this.attributes.id = this.makeID(this.device.location);
		},
		play: function (streamModel) {
			var url = streamModel.get('src');
			this.client.load(url + 'video.mp4', {
				autoplay: true
			}, function (err, result) {
				if (err) {
					throw err;
				}

			});
		},
		stop: function () {

			this.client.stop();
		},
		pause: function () {

			this.client.pause();
		},
		forward: function () {

			this.client.seek(30);
		},

		backward: function () {

			this.client.seek(-30);
		},

		unpause: function () {

			this.client.play();
		}

	});
	cp.search('urn:schemas-upnp-org:device:MediaRenderer:1');


	cp.on('device', function (device) {
		collection.add(new Dlna({
			device: device
		}));
	});



	App.Device.Dlna = Dlna;
})(window.App);
