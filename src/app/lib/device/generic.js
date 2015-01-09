(function (App) {
	'use strict';

	var self;

	var Device = Backbone.Model.extend({
		defaults: {
			id: 'local',
			type: 'local',
			name: 'Popcorn Time'
		},
		play: function (streamModel) {
			App.vent.trigger('stream:local', streamModel);
		},
		getID: function () {
			return this.id;
		}
	});

	var DeviceCollection = Backbone.Collection.extend({
		selected: 'local',
		initialize: function () {
			App.vent.on('device:list', this.list);
			App.vent.on('device:pause', this.pause);
			App.vent.on('device:unpause', this.unpause);
			App.vent.on('device:stop', this.stop);
			App.vent.on('device:forward', this.forward);
			App.vent.on('device:backward', this.backward);
			App.vent.on('device:seek', this.seek);
			App.vent.on('device:seekTo', this.seekTo);
			App.vent.on('device:seekPercentage', this.seekPercentage);
			App.vent.on('device:status:update', this.updateStatus);
			self = this;
		},
		list: function () {
			_.each(self.models, function (device) {
				App.vent.trigger('device:add', device);
			});
		},
		pause: function () {
			self.selected.pause();
		},
		unpause: function () {
			self.selected.unpause();
		},
		stop: function () {
			self.selected.stop();
		},
		forward: function () {
			self.selected.forward();
		},
		backward: function () {
			self.selected.backward();
		},
		seek: function (seconds) {
			self.selected.seekBy(seconds);
		},
		seekTo: function (newCurrentTime) {
			self.selected.seekTo(newCurrentTime);
		},
		seekPercentage: function (percentage) {
			self.selected.seekPercentage(percentage);
		},
		updateStatus: function () {
			self.selected.updateStatus();
		},
		startDevice: function (streamModel) {
			if (!this.selected) {
				this.selected = this.models[0];
			}

			/* ddaf: Temporary IP fixes until 0.4.0 arrives.
			 * Added private-IP and virtual adapter checks
			 */
			var ips = [], ifaces = require('os').networkInterfaces();
			for (var dev in ifaces) {
				// Each device can have several IPs.
				ifaces[dev].forEach(function (details) {
					if (details.family === 'IPv4' && details.internal === false && _isPrivateIPAddress(details.address)
						&& (!/(loopback|vmware|virtualbox|internal|hamachi|vboxnet)/g.test(dev.toLowerCase()))) {
						ips.push(details.address);
					}
				});
			}
			var srcIp = ips[0];

			// Experimental support for using Chromecast while on multiple private networks
			if (this.selected.get('type') === 'chromecast' && ips.length > 1) {
				var deviceIp = this.selected.get('device').config.addresses[0];
				srcIp = _getClosestIP(ips, deviceIp);
				win.info('Found internal IPs: '+ ips);
				win.info('> Picked for external playback: '+ srcIp);
			}
			streamModel.attributes.src = streamModel.attributes.src.replace('127.0.0.1', srcIp);

			return this.selected.play(streamModel);
		},

		setDevice: function (deviceID) {
			this.selected = this.findWhere({
				id: deviceID
			});
		}
	});

	var _isPrivateIPAddress = function(ip) {
		// See http://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces
		return (ip.substring(0, 8) === '192.168.') ||
			(ip.substring(0, 3) === '10.') ||
			(ip.substring(0, 4) === '172.'
				&& 15 < parseInt(ip.split('.')[1])
				&& parseInt(ip.split('.')[1]) < 32);
	};

	var _getClosestIP = function(ips, targetIp) {
		return _.max(ips, function(ip) { return _seqPartsInCommon(ip, targetIp) });
	};

	var _seqPartsInCommon = function(ip1, ip2) {
		var ip2Parts = ip2.split('.'), s = 0;
		ip1.split('.').every(function(ip1Part, idx) {
			var res = (ip1Part === ip2Parts[idx]);
			if (res) ++s; return res;
		});
		return s;
	};

	var collection = new DeviceCollection(new Device());
	collection.setDevice('local');

	var ChooserView = Backbone.Marionette.ItemView.extend({
		template: '#player-chooser-tpl',
		events: {
			'click .playerchoicemenu li a': 'selectPlayer'
		},
		onRender: function () {
			var id = this.collection.selected.get('id').replace('\'', '\\\'');
			var el = $('.playerchoicemenu li#player-' + id + ' a');
			this._selectPlayer(el);
		},
		selectPlayer: function (e) {
			this._selectPlayer($(e.currentTarget));
		},
		_selectPlayer: function (el) {
			var player = el.parent('li').attr('id').replace('player-', '');
			collection.setDevice(player);
			$('.playerchoicemenu li a.active').removeClass('active');
			el.addClass('active');
			$('.imgplayerchoice').attr('src', el.children('img').attr('src'));
		}
	});

	var createChooserView = function (el) {
		return new ChooserView({
			collection: collection,
			el: el
		});
	};

	App.Device = {
		Generic: Device,
		Collection: collection,
		ChooserView: createChooserView
	};
})(window.App);
