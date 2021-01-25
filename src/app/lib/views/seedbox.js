(function (App) {
	'use strict';

	var torrentsDir = path.join(App.settings.tmpLocation + '/TorrentCache/'),
		updateInterval;

	var formatBytes = function (bytes, decimals) {
		if (bytes === 0) {
			return '0 Bytes';
		}

		let k = 1024,
			dm = decimals || 2,
			sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
			i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
	};

	var Seedbox = Marionette.View.extend({
		template: '#seedbox-tpl',
		className: 'seedbox',

		events: {
			'mousedown .file-item': 'openFileSelector',
			'mousedown .result-item': 'onlineOpen',
			'mousedown .item-delete': 'deleteItem',
			'mousedown .item-rename': 'renameItem',
			'mousedown .magnet-icon': 'openMagnet',
			'mousedown .pause-torrent': 'onPauseTorrentClicked',
			'mousedown .resume-torrent': 'onResumeTorrentClicked',
			'mousedown .trash-torrent': 'onRemoveTorrentClicked',
			'click .tab-torrent': 'clickTorrent',
			'click .file-item': 'tempf'
		},

		initialize: function () {
			torrentsDir = path.join(App.settings.tmpLocation + '/TorrentCache/');
			if (!fs.existsSync(torrentsDir)) {
				fs.mkdirSync(torrentsDir);
				console.debug('Seedbox: data directory created');
			}
		},

		onAttach: function () {
			Mousetrap.bind(['esc', 'backspace'], function (e) {
				$('#filterbar-seedbox').click();
			});

			this.render();
			this.addTorrentHooks();

			if ($('.loading .maximize-icon').is(':visible')) {
				App.WebTorrent.torrents.forEach(function(torrent) {
					torrent._servers[0] && !torrent.paused ? $('#trash-'+torrent.infoHash).addClass('disabled') : null;
				});
			}
		},

		onRender: function () {
			$('#online-input').focus();
			this.$('.tooltipped').tooltip({
				delay: {
					'show': 800,
					'hide': 100
				}
			});
		},

		addTorrentHooks() {
			App.WebTorrent.on('torrent', (torrent) => {
				this.onAddTorrent(torrent);
			});

			App.WebTorrent.torrents.forEach((torrent) => {
				this.onAddTorrent(torrent);
			});

			updateInterval = setInterval(() => {
				this.updateView($('.tab-torrent.active'));
			}, 1000);
		},

		isTorrentInList: torrent => Boolean(document.getElementById(torrent.infoHash)),

		addTorrentToList(torrent) {
			$('.notorrents-info').hide();

			let className = 'tab-torrent';
			if ($('.tab-torrent.active').length <= 0) {
				className += ' active';
			}

			$('.seedbox-torrent-list > ul.file-list').append(
				`<li class="${className}" id="${torrent.infoHash}" data-season="" data-episode="">
                <a href="#" class="episodeData">
                    <span>&nbsp;</span>
                    <div id="title-${torrent.infoHash}">${App.plugins.mediaName.getMediaName(torrent)}</div>
                </a>

                <i class="fa fa-trash watched trash-torrent" id="trash-${torrent.infoHash}"></i>
                <i class="fa fa-play watched resume-torrent" id="play-${torrent.infoHash}" style="display: ${torrent.paused ? '' : 'none'};"></i>
                <i class="fa fa-pause-circle watched pause-torrent" id="resume-${torrent.infoHash}" style="display: ${torrent.paused ? 'none' : ''};"></i>
                <i class="fa fa-upload watched" id="upload-${torrent.infoHash}"> 0 Kb/s</i>
                <i class="fa fa-download watched" id="download-${torrent.infoHash}"> 0 Kb/s</i>
              </li>`
			);

			$('.seedbox .episodeData > span').each(function (i, el) { 
				$(el).text(++i);
			});

			$('.seedbox-overview').show();
		},

		getTorrentListItem(torrent) {
			return $(`.tab-torrent#${torrent.infoHash}`);
		},

		onAddTorrent: function (torrent) {
			if (this.isTorrentInList(torrent)) {
				return;
			}

			this.addTorrentToList(torrent);

			const activeTorrentCount = App.WebTorrent.torrents.filter(item => !item.paused).length;
			if (!torrent.paused && activeTorrentCount >= Settings.maxActiveTorrents) {
				this.pauseTorrent(torrent);
				torrent.paused = true;
			}

			const onTorrentReady = () => {
				// We may have set the name to "Unknown torrent" but we have the name now that it's ready
				if (document.getElementById(`title-${torrent.infoHash}`)) {
					document.getElementById(`title-${torrent.infoHash}`).innerText = torrent.name;
				}

				this.updateView($('.tab-torrent.active'), true);
			};

			if (torrent.ready) {
				onTorrentReady();
			} else {
				torrent.on('ready', onTorrentReady);
			}

			torrent.on('error', (e) => {
				win.error(e);
				torrent.paused = true;
				this.getTorrentListItem(torrent)
					.addClass('error');
			});
		},

		getTorrentFromEvent(e, id = null) {
			const hash = id || e.currentTarget.parentNode.getAttribute('id');
			return App.WebTorrent.torrents.find(torrent => torrent.infoHash === hash);
		},

		pauseTorrent(torrent) {
			torrent.pause();

			// completely pause this torrent, stop download data (pause only stops new connections)
			for (const id in torrent._peers) {
				if (torrent._peers.hasOwnProperty(id)) {
					torrent.removePeer(id);
				}
			}

			torrent._xsRequests.forEach(req => {
				req.abort();
			});

			$(`#resume-${torrent.infoHash}`).hide();
			$(`#play-${torrent.infoHash}`).show();
		},

		onPauseTorrentClicked(e, id) {
			const torrent = this.getTorrentFromEvent(e, id);
			if (torrent) {
				this.pauseTorrent(torrent);
			}
		},

		onResumeTorrentClicked(e, id) {
			const torrent = this.getTorrentFromEvent(e, id);
			if (torrent) {
				torrent.resume();
				$(`#resume-${torrent.infoHash}`).show();
				$(`#play-${torrent.infoHash}`).hide();
			}
		},

		onRemoveTorrentClicked(e) {
			const torrent = this.getTorrentFromEvent(e);
			if (torrent) {
				torrent.destroy(() => {
					try { fs.unlinkSync(path.join(torrentsDir, torrent.infoHash)); } catch(err) {}
					rimraf(path.join(App.settings.tmpLocation, torrent.name), () => {
					});
				});
				$(`#${torrent.infoHash}`).remove();
				if ($('.tab-torrent').length <= 0) {
					$('.notorrents-info').show();
					$('.seedbox-overview').hide();
				}
			}

			if (!$('.tab-torrent').hasClass('active')) {
				$('.tab-torrent').first().addClass('active');
			}

			$('.seedbox .episodeData > span').each(function (i, el) { 
				$(el).text(++i);
			});

			this.updateView($('.tab-torrent.active'), true);
		},

		clickTorrent: function (e) {
			if (e.type) {
				e.preventDefault();
				e.stopPropagation();
			}

			$('.tab-torrent.active').removeClass('active');
			$(e.currentTarget).addClass('active');
			this.updateView($(e.currentTarget), true /*wasJustSelected*/);
		},

		tempf: function (e) {
			App.settings.os === 'windows' ? nw.Shell.openExternal(Settings.tmpLocation) : nw.Shell.openItem(Settings.tmpLocation);
		},

		updateHealth: function(torrent) {
			const healthButton = new Common.HealthButton('.health-icon', cb => Common.retrieveTorrentHealth(torrent, cb));
			healthButton.render();
		},

		updateView: function ($elem, wasJustSelected = false) {
			if (!wasJustSelected) {
				App.WebTorrent.torrents.forEach(function(torrent) {
					$(`#download-${torrent.infoHash}`).text(' ' + formatBytes(torrent.downloadSpeed) + '/s');
					$(`#upload-${torrent.infoHash}`).text(' ' + formatBytes(torrent.uploadSpeed) + '/s');
					if (torrent.paused && $(`#resume-${torrent.infoHash}`).is(':visible')) {
						$(`#resume-${torrent.infoHash}`).hide();
						$(`#play-${torrent.infoHash}`).show();
					}
				});
			}

			if ($elem.length === 0) {
				return;
			}

			const infoHash = $elem.attr('id');
			try { const stats = fs.statSync(App.settings.tmpLocation + '/TorrentCache/' + infoHash); } catch(err) {}
			const torrent = App.WebTorrent.get(infoHash);

			if (wasJustSelected) {
				this.updateHealth(torrent);
				const $fileList = $('.torrents-info > ul.file-list');
				$fileList.empty();
				for (const file of torrent.files) {
					$fileList.append(
						`<li class="file-item">
								<a>${file.name}</a>
								<i class="fa fa-folder-open item-delete tooltipped" data-toggle="tooltip" data-placement="left" title=""></i>
						</li>`
					);
				}
			}

			torrent.name ? $('.seedbox-infos-title').text(torrent.name) : $('.seedbox-infos-title').text(i18n.__('connecting'));
			$('.seedbox-downloaded').text(' ' + formatBytes(torrent.downloaded));
			$('.seedbox-uploaded').text(' ' + formatBytes(torrent.uploaded));
			try { $('.seedbox-infos-date').text(stats.ctime); } catch(err) {}
			$('.progress-bar').css('width', (torrent.progress * 100).toFixed(2) + '%');
			$('.progress-percentage>span').text((torrent.progress * 100).toFixed(2) + '%');
		},

		onBeforeDestroy: function () {
			clearInterval(updateInterval);
			App.WebTorrent.removeAllListeners('torrent');
			Mousetrap.unbind(['esc', 'backspace']);
		},

		closeTorrentCollection: function () {
			App.vent.trigger('seedbox:close');
		}
	});

	App.View.Seedbox = Seedbox;
})(window.App);
