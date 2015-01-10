(function (App) {
	'use strict';

	var _this;
	var FileSelector = Backbone.Marionette.ItemView.extend({
		template: '#file-selector-tpl',
		className: 'file-selector',

		events: {
			'click .close-icon': 'closeSelector',
			'click .file-item': 'startStreaming',
            'click .store-torrent': 'storeTorrent'
		},

		initialize: function () {
			_this = this;
		},

		onShow: function () {
			App.Device.ChooserView('#player-chooser2').render();
			this.$('#watch-now').text('');
            this.isTorrentStored();

			Mousetrap.bind(['esc', 'backspace'], function (e) {
				_this.closeSelector(e);
			});
		},


		startStreaming: function (e) {
			var torrent = _this.model.get('torrent');
			var file = parseInt($(e.currentTarget).attr('data-file'));
			var actualIndex = parseInt($(e.currentTarget).attr('data-index'));
			torrent.name = torrent.files[file].name;

			var torrentStart = new Backbone.Model({
				torrent: torrent,
				torrent_read: true,
				file_index: actualIndex
			});
			App.vent.trigger('stream:start', torrentStart);
			App.vent.trigger('system:closeFileSelector');
		},
        
        isTorrentStored: function () {
            var file = AdvSettings.get('droppedTorrent'),
                target = require('nw.gui').App.dataPath + '/TorrentCollection/';
            
            // check if torrent stored
            if (!fs.existsSync(target + file)) {
                $('.store-torrent').text(i18n.__('Store this torrent'));
                return false;
            } else {
                $('.store-torrent').text(i18n.__('Remove this torrent'));
                return true;
            }
        },

        storeTorrent: function () {
            var file = AdvSettings.get('droppedTorrent'),
                source = App.settings.tmpLocation + '/',
                target = require('nw.gui').App.dataPath + '/TorrentCollection/';

            if (this.isTorrentStored()) {
                fs.unlinkSync(target + file); // remove the torrent
            } else {
                if (!fs.existsSync(target)) fs.mkdir(target); // create directory if needed
                fs.writeFileSync(target + file, fs.readFileSync(source + file)); // save torrent 
            }
            this.isTorrentStored(); // trigger button change
        },

		closeSelector: function (e) {
			Mousetrap.bind('backspace', function (e) {
				App.vent.trigger('show:closeDetail');
				App.vent.trigger('movie:closeDetail');
			});
			$('.filter-bar').show();
			$('#header').removeClass('header-shadow');
			$('#movie-detail').show();
			App.vent.trigger('system:closeFileSelector');
		},

		onClose: function () {
			AdvSettings.set('droppedTorrent', 'none');
		},

	});

	App.View.FileSelector = FileSelector;
})(window.App);
