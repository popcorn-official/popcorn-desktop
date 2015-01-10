(function (App) {
	'use strict';

	var MediaRendererClient = require('upnp-mediarenderer-client');
	var collection = App.Device.Collection;
	var getIPAddress= function () {
		var ip, alias = 0;
		var ifaces = require('os').networkInterfaces();
		for (var dev in ifaces) {
			ifaces[dev].forEach(function (details) {
				if (details.family === 'IPv4') {
					if (!/(loopback|vmware|internal|hamachi|vboxnet)/gi.test(dev + (alias ? ':' + alias : ''))) {
						if (details.address.substring(0, 8) === '192.168.' ||
							details.address.substring(0, 7) === '172.16.' ||
							details.address.substring(0, 5) === '10.0.'
						) {
							ip = details.address;
							++alias;
						}
					}
				}
			});
		}
		return ip;
	};
	var ip= getIPAddress();
	var ssdp = require('node-ssdp').Client
	, client = new ssdp({
		unicastHost: ip
	})
	var makeID = function (baseID) {
		return 'dlna-' + baseID.replace(':', '');
	};

	var Dlna = App.Device.Generic.extend({
		defaults: {
			type: 'dlna',
			typeFamily: 'external'
		},
		makeID: makeID,

		initialize: function (attrs) {
			var self = this;
			this.info = attrs.info;
			this.device = attrs.device;
			this.client = new MediaRendererClient(this.device.LOCATION);
// Test Purpose to know Device supported protocols
			this.client.getSupportedProtocols(function(err, cap) {
				if(err) throw err;
				console.log(cap);
			});

			this.client.getDeviceDescription(function(err, description) {
				if(err) throw err;
				self.attributes.name = description.friendlyName;
			});
			self.attributes.address = this.info.address;
		},
		play: function (streamModel) {
			var url = streamModel.get('src');

			this.client.load(url + 'video.mp4', {
				autoplay: true,
				contentType: 'video/mp4'
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

	client.on('notify', function () {
		console.log('Got a notification.')
	})

	client.on('response', function inResponse(headers, code, rinfo) {
		var deviceId = makeID(headers.USN);
		if (collection.where({id: deviceId}).length === 0) {
			collection.add(new Dlna({
				id: deviceId,
				info: rinfo,
				device: headers
			}));
		}
	});

	setInterval(function() {
		client.search('urn:schemas-upnp-org:device:MediaRenderer:1')
	}, 10000)


	App.Device.Dlna = Dlna;
})(window.App);
