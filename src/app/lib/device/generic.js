(function(App) {
	'use strict';

	var self;

	var Device = Backbone.Model.extend ({
		defaults: {
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

	var DeviceCollection = Backbone.Collection.extend ({
		selected: 'local',
		initialize: function () {
			App.vent.on('device:list', this.list);
			self = this;
		},
		list: function () {
			_.each(self.models, function (device) {
				App.vent.trigger('device:add', device);
			});
		},
		startDevice:  function (streamModel) {
			if (! this.selected) {
				return false;
			}

			return this.selected.play(streamModel);
		},

		setDevice: function(deviceID) {
			console.log(deviceID);
			this.selected = _.findWhere(self.models, {id: deviceID});
		}

	});

	var collection = new DeviceCollection (new Device());
	var ChooserView = Backbone.Marionette.ItemView.extend({
		template: '#player-chooser-tpl',
		events: {'click .playerchoicemenu li a': 'selectPlayer'},
		onRender: function () {
			$('.playerchoicemenu li#player-local a').addClass('active');
		},
		selectPlayer: function (e) {
			var player = $(e.currentTarget).parent('li').attr('id').replace('player-', '');
			collection.setDevice(player);
			$('.playerchoicemenu li a.active').removeClass('active');
			$(e.currentTarget).addClass('active');
			$('.imgplayerchoice').attr('src',  $(e.currentTarget).children('img').attr('src'));
		}
	});

	var createChooserView = function (el) {
		return new ChooserView ({
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
