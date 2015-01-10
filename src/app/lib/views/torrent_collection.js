(function (App) {
	'use strict';

    var collection = path.join(require('nw.gui').App.dataPath + '/TorrentCollection/'),
		files;

	var TorrentCollection = Backbone.Marionette.ItemView.extend({
		template: '#torrent-collection-tpl',
		className: 'torrent-collection',

		events: {
			'click .close-icon': 'closeTorrentCollection',
			'click .file-item': 'openFileSelector',
			'click .item-delete': 'deleteItem'
		},

		initialize: function () {			
			App.vent.on('about:close', this.closeTorrentCollection);
			if (!fs.existsSync(collection)) fs.mkdir(collection) //create directory
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
			this.render();
		},
		
		onRender: function () {
			if (this.files[0]) {
				$('.notorrents-info').css('display','none');
				$('.torrents-info').css('display','block');
			}
		},

		openFileSelector: function (e) {
			var _file = $(e.currentTarget).context.innerText,
				file = _file.substring(0, _file.length-1); // avoid ENOENT

            if (_file.indexOf('.torrent') !== -1) {
                Settings.droppedTorrent = file;
    			handleTorrent(collection + file);
            } else { // assume magnet
                var content = fs.readFileSync(collection + file, 'utf8');
                Settings.droppedMagnet = content;
    			handleTorrent(content);
            }

			this.closeTorrentCollection();
		},
		
		deleteItem: function (e) {
			e.preventDefault();
			e.stopPropagation();

			var _file = $(e.currentTarget.parentNode).context.innerText,
				file = _file.substring(0, _file.length-1); // avoid ENOENT

			fs.unlinkSync(collection + file);
			this.render();
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