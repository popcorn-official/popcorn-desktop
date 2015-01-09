(function (App) {
	'use strict';
    
    var fs = require('fs'),
        collection = require('nw.gui').App.dataPath + '/TorrentCollection/',
		files;

	var TorrentCollection = Backbone.Marionette.ItemView.extend({
		template: '#torrent-collection-tpl',
		className: 'torrent-collection',

		events: {
			'click .close-icon': 'closeTorrentCollection'
		},
		
		initialize: function () {			
			App.vent.on('about:close', this.closeTorrentCollection);
			this.files = fs.readdirSync(collection);
		},

		onShow: function () {
			$('.filter-bar').hide();
			$('#header').addClass('header-shadow');

			Mousetrap.bind(['esc', 'backspace'], function (e) {
				App.vent.trigger('torrentCollection:close');
			});
			console.log('Show torrent collection');
			$('#movie-detail').hide();
            
            if (this.files[0]) {
				$('.notorrents-info').css('display','none');
				$('.torrents-info').css('display','block');
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