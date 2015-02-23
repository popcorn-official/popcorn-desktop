(function (App) {
	'use strict';

	var UpnpC = require('dlna-js').ControlPoint;
	var MediaRendererClient = require('upnp-mediarenderer-client');
	var collection = App.Device.Collection;
	var control = UpnpC.UpnpControlPoint;
	var cp = new control();

	var makeID = function (baseID) {
		return 'dlna-' + baseID.replace('-', '');
	};

	var Dlna = App.Device.Generic.extend({
		defaults: {
			type: 'dlna',
			typeFamily: 'external'
		},
		makeID: makeID,

		initialize: function (attrs) {

			this.device = attrs.device;
			this.client = new MediaRendererClient(this.device.location);
			this.attributes.name = this.device.friendlyName;
			this.attributes.address = this.device.host;
		},
		play: function (streamModel) {
			var url = streamModel.get('src');
			this.client.load(url + 'video.mp4', {
				autoplay: true,
				contentType: 'video/vnd.dlna.mpeg-tts'
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

	function filterDevice(device) {
		var type = device.deviceType.replace('urn:schemas-upnp-org:device:', '');
		type = (type.split(':')[0]);

		if (type !== 'MediaRenderer') {
			return null;
		}
		return device;
	}


	cp.on('device', function (device) {
		if (!filterDevice(device)) {
			return;
		}
		var deviceId = makeID(device.uuid);
		if (collection.where({
				id: deviceId
			}).length === 0) {
			collection.add(new Dlna({
				id: deviceId,
				device: device
			}));
		}
	});


	setInterval(function () {
		cp.search();
	}, 60000);

	cp.search();

	App.Device.Dlna = Dlna;
})(window.App);
