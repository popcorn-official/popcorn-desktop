(function (App) {
	'use strict';

	var TorrentCollection = Backbone.Marionette.ItemView.extend({
		template: '#torrent-collection-tpl',
		className: 'torrent-collection',

		events: {
			'click .close-icon': 'closeTorrentCollection'
		},
		
		initialize: function () {
			// count aquired torrents
			var storedTorrents = this.getStoredTorrents();
			
			App.vent.on('about:close', this.closeTorrentCollection);
		},

		onShow: function () {
			$('.filter-bar').hide();
			$('#header').addClass('header-shadow');

			Mousetrap.bind(['esc', 'backspace'], function (e) {
				App.vent.trigger('torrentCollection:close');
			});
			console.log('Show torrent collection');
			$('#movie-detail').hide();
		},
		
		getStoredTorrents: function () {
			var count = 0;
			
			// TODO: calculation
			
			if (count = 0) {
				return false;
			}
		},

		onClose: function () {
			Mousetrap.unbind(['esc', 'backspace']);
			$('.filter-bar').show();
			$('#header').removeClass('header-shadow');
			$('#movie-detail').show();
		},

		closeTorrentCollection: function () {
			App.vent.trigger('torrentCollection:close');
		}

	});

	App.View.TorrentCollection = TorrentCollection;
})(window.App);