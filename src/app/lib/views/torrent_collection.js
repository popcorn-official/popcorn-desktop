(function (App) {
	'use strict';

	var collection = path.join(require('nw.gui').App.dataPath + '/TorrentCollection/'),
		files;

	var TorrentCollection = Backbone.Marionette.ItemView.extend({
		template: '#torrent-collection-tpl',
		className: 'torrent-collection',

		events: {
			'click .file-item': 'openFileSelector',
			'click .result-item': 'katOpen',
			'click .item-delete': 'deleteItem',
			'click .item-rename': 'renameItem',
			'click .collection-delete': 'clearCollection',
			'click .collection-open': 'openCollection',
			'click .collection-import': 'importItem',
			'click .notorrents-frame': 'importItem',
			'click .kat-search': 'katSearch',
			'click .kat-back': 'katClose'
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

		katSearch: function () {
			var that = this;
			$('.katsearch-info>ul.file-list').html('');
			
			$('.kat-search').removeClass('fa-search').addClass('fa-spin fa-spinner');

			require('katsearcher-x')({
				name: $('#kat-input').val(),
				limit: 25,
				minSeeds: 40,
			}, function (err, result) {
				if (!err) {
					win.debug('Kickass search: %s results', result.length);
					result.forEach( function (item) {
						var title = item.torrentData.title,
							magnet = item.torrentData.magnetURI,
							seeds = item.torrentData.seeds,
							size = require('pretty-bytes')(
								parseInt(item.torrentData.fileSize)
							);

						that.katAddItem(title, magnet, size, seeds);
					});

					that.$('.tooltipped').tooltip({
						delay: {
							'show': 50,
							'hide': 50
						}
					});
					$('.notorrents-info,.torrents-info').hide();
					$('.kat-search').removeClass('fa-spin fa-spinner').addClass('fa-search');
					$('.katsearch-info').show();

				} else {
					$('.katsearch-info>ul.file-list').html('<br><br><div style="text-align:center;font-size:30px">' + i18n.__('No results found') + '</div>')

					$('.kat-search').removeClass('fa-spin fa-spinner').addClass('fa-search');
					$('.notorrents-info,.torrents-info').hide();
					$('.katsearch-info').show();
				}
			});
		},

		katAddItem: function (title, dataTorrent, size, seeds) {				
			$('.katsearch-info>ul.file-list').append(
				'<li class="result-item" data-file="' + dataTorrent + '"><a>' + title + '</a><div class="item-icon magnet-icon"></div><i class="kat-size tooltipped" data-toggle="tooltip" data-placement="left" title="' + i18n.__('Seeds:') + ' ' + seeds + '">' + size + '</i></li>'
			);
		},

		katOpen: function (e) {
			var file = $(e.currentTarget).context.dataset.file;
			Settings.droppedMagnet = file;
			window.handleTorrent(file);
		},

		katClose: function () {
			$('.katsearch-info>ul.file-list').html('');
			$('.katsearch-info').hide();
			this.render();
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

		onDestroy: function () {
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
