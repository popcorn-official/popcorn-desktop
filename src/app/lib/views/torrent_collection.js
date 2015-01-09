(function (App) {
	'use strict';

    var collection = path.join(require('nw.gui').App.dataPath + '/TorrentCollection/'),
		files;

	var TorrentCollection = Backbone.Marionette.ItemView.extend({
		template: '#torrent-collection-tpl',
		className: 'torrent-collection',

		events: {
			'click .close-icon': 'closeTorrentCollection',
			'click .file-item': 'openFileSelector'
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

		openFileSelector: function (e) {
			var file = $(e.currentTarget).context.innerText;
			var _file = file.substring(0, file.length-1); // workaround for ENOENT
			
			this.closeTorrentCollection();
			handleTorrent(collection + _file);
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