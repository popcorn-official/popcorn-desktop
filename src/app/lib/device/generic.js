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
		startDevice: function (streamModel) {
			if (!this.selected) {
				this.selected = this.models[0];
			}
			/* SlashmanX: Just testing for now, 
			 ** replaces localhost IP with network IP,
			 ** will remove when new streamer implemented
			 */
			var os = require('os');
			var interfaces = os.networkInterfaces();
			var addresses = [];
			for (var k in interfaces) {
				for (var k2 in interfaces[k]) {
					var address = interfaces[k][k2];
					if (address.family === 'IPv4' && !address.internal) {
						streamModel.attributes.src = streamModel.attributes.src.replace('127.0.0.1', address.address);
						addresses.push(address.address);
					}
				}
			}

			return this.selected.play(streamModel);
		},

		setDevice: function (deviceID) {
			this.selected = this.findWhere({
				id: deviceID
			});
		}

	});

	var collection = new DeviceCollection(new Device());
	collection.setDevice('local');

	var ChooserView = Backbone.Marionette.ItemView.extend({
		template: '#player-chooser-tpl',
		events: {
			'click .playerchoicemenu li a': 'selectPlayer'
		},
		onRender: function () {
			var id = this.collection.selected.get('id');
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
