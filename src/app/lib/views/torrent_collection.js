(function (App) {
	'use strict';

	var collection = path.join(require('nw.gui').App.dataPath + '/TorrentCollection/'),
		files;

	var TorrentCollection = Backbone.Marionette.ItemView.extend({
		template: '#torrent-collection-tpl',
		className: 'torrent-collection',

		events: {
			'click .file-item': 'openFileSelector',
			'click .item-delete': 'deleteItem',
			'click .item-rename': 'renameItem',
			'click .collection-delete': 'clearCollection',
			'click .collection-open': 'openCollection',
			'click .collection-import': 'importItem',
			'click .notorrents-frame': 'importItem'
		},

		initialize: function () {
			if (!fs.existsSync(collection)) {
				fs.mkdir(collection); //create directory
			}
			this.files = fs.readdirSync(collection);
		},

		onShow: function () {
			Mousetrap.bind(['esc', 'backspace'], function (e) {
				App.vent.trigger('torrentCollection:close');
			});

			$('#movie-detail').hide();
			$('#nav-filters').hide();

			this.render();
		},

		onRender: function () {
			if (this.files[0]) {
				$('.notorrents-info').css('display', 'none');
				$('.collection-actions').css('display', 'block');
				$('.torrents-info').css('display', 'block');
			}

			this.$('.tooltipped').tooltip({
				delay: {
					'show': 800,
					'hide': 100
				}
			});
		},

		openFileSelector: function (e) {
			var _file = $(e.currentTarget).context.innerText,
				file = _file.substring(0, _file.length - 2); // avoid ENOENT

			if (_file.indexOf('.torrent') !== -1) {
				Settings.droppedTorrent = file;
				window.handleTorrent(collection + file);
			} else { // assume magnet
				var content = fs.readFileSync(collection + file, 'utf8');
				Settings.droppedMagnet = content;
				Settings.droppedStoredMagnet = file;
				window.handleTorrent(content);
			}
		},

		deleteItem: function (e) {
			this.$('.tooltip').css('display', 'none');
			e.preventDefault();
			e.stopPropagation();

			var _file = $(e.currentTarget.parentNode).context.innerText,
				file = _file.substring(0, _file.length - 2); // avoid ENOENT

			fs.unlinkSync(collection + file);

			// update collection
			this.files = fs.readdirSync(collection);
			this.render();
		},

		renameItem: function (e) {
			this.$('.tooltip').css('display', 'none');
			e.preventDefault();
			e.stopPropagation();

			var _file = $(e.currentTarget.parentNode).context.innerText,
				file = _file.substring(0, _file.length - 2), // avoid ENOENT
				isTorrent = false;

			if (file.endsWith('.torrent')) {
				isTorrent = 'torrent';
			}

			var newName = this.renameInput(file);
			if (!newName) {
				return;
			}

			if (isTorrent) { //torrent
				if (!newName.endsWith('.torrent')) {
					newName += '.torrent';
				}
			} else { //magnet
				if (newName.endsWith('.torrent')) {
					newName = newName.replace('.torrent', '');
				}
			}

			if (!fs.existsSync(collection + newName) && newName) {
				fs.renameSync(collection + file, collection + newName);
			} else {
				$('.notification_alert').show().text(i18n.__('This name is already taken')).delay(2500).fadeOut(400);
			}

			// update collection
			this.files = fs.readdirSync(collection);
			this.render();
		},

		renameInput: function (oldName) {
			var userInput = prompt(i18n.__('Enter new name'), oldName);
			if (!userInput || userInput === oldName) {
				return false;
			} else {
				return userInput;
			}
		},

		clearCollection: function () {
			deleteFolder(collection);
			App.vent.trigger('torrentCollection:show');
		},

		openCollection: function () {
			win.debug('Opening: ' + collection);
			gui.Shell.openItem(collection);
		},

		importItem: function () {
			this.$('.tooltip').css('display', 'none');

			var that = this;
			var input = document.querySelector('.collection-import-hidden');
			input.addEventListener('change', function (evt) {
				var file = $('.collection-import-hidden')[0].files[0];
				that.render();
				window.ondrop({
					dataTransfer: {
						files: [file]
					},
					preventDefault: function () {}
				});
			}, false);

			input.click();
		},

		onClose: function () {
			Mousetrap.unbind(['esc', 'backspace']);
			$('#movie-detail').show();
			$('#nav-filters').show();
		},

		closeTorrentCollection: function () {
			App.vent.trigger('torrentCollection:close');
		}

	});

	App.View.TorrentCollection = TorrentCollection;
})(window.App);
