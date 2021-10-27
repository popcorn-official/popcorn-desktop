(function (App) {
	'use strict';

	var torrentsDir = path.join(App.settings.tmpLocation + '/TorrentCache/'),
		torrentsDir2 = path.join(App.settings.downloadsLocation + '/TorrentCache/'),
		toDel = [],
		updateInterval;

	const supported = ['.mp4', '.m4v', '.avi', '.mov', '.mkv', '.wmv'];

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
			'mousedown .magnet-icon': 'openMagnet',
			'mousedown .health-icon': 'healthClicked',
			'mousedown .pause-torrent': 'onPauseTorrentClicked',
			'mousedown .resume-torrent': 'onResumeTorrentClicked',
			'mousedown .trash-torrent': 'onRemoveTorrentClicked',
			'click .tab-torrent': 'clickTorrent',
			'click .item-download': 'downloadItem',
			'click .item-play': 'playItem',
			'click .item-open': 'openItem'
		},

		initialize: function () {
			torrentsDir = path.join(App.settings.tmpLocation + '/TorrentCache/');
			torrentsDir2 = path.join(App.settings.downloadsLocation + '/TorrentCache/');
			if (!fs.existsSync(torrentsDir)) {
				fs.mkdirSync(torrentsDir);
			}
			if (App.settings.separateDownloadsDir && !fs.existsSync(torrentsDir2)) {
				fs.mkdirSync(torrentsDir2);
			}
		},

		onAttach: function () {
			Mousetrap.bind(['esc', 'backspace'], function (e) {
				$('#filterbar-seedbox').click();
			});

			this.render();
			this.addTorrentHooks();

			if ($('.loading .maximize-icon').is(':visible') || $('.player .maximize-icon').is(':visible')) {
				let currentHash;
				try { currentHash = App.LoadingView.model.attributes.streamInfo.attributes.torrentModel.attributes.torrent.infoHash; } catch(err) {}
				currentHash && $('#trash-'+currentHash)[0] ? $('#trash-'+currentHash).addClass('disabled') : null;
			}
		},

		onRender: function () {
			this.$('.tooltipped').tooltip({
				html: true,
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

			setTimeout(function() {
				$('.tab-torrent.active').click();
			}, 500);

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

                <i class="fa fa-trash watched trash-torrent tooltipped" id="trash-${torrent.infoHash}" title="Remove" data-toggle="tooltip" data-placement="left"></i>
                <i class="fa fa-play watched resume-torrent tooltipped" id="play-${torrent.infoHash}"  title="Resume" data-toggle="tooltip" data-placement="left" style="display: ${torrent.paused ? '' : 'none'};"></i>
                <i class="fa fa-pause-circle watched pause-torrent tooltipped" id="resume-${torrent.infoHash}"  title="Pause" data-toggle="tooltip" data-placement="left" style="display: ${torrent.paused ? 'none' : ''};"></i>
                <i class="fa fa-upload watched" id="upload-${torrent.infoHash}"> 0 Kb/s</i>
                <i class="fa fa-download watched" id="download-${torrent.infoHash}"> 0 Kb/s</i>
              </li>`
			);

			$('.seedbox .episodeData > span').each(function (i, el) { 
				$(el).text(++i);
			});

			$('.seedbox-overview').show();
			this.onRender();
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
			if (!torrent.paused && activeTorrentCount > Settings.maxActiveTorrents) {
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
			const removedPeers = [];
			for (const id in torrent._peers) {
				if (torrent._peers.hasOwnProperty(id)) {
					// collect peers, need to do this before calling removePeer!
					removedPeers.push(torrent._peers[id].addr);

					torrent.removePeer(id);
				}
			}
			if(removedPeers.length > 0) {
				// store removed peers, so we can re-add them when resuming
				torrent.pctRemovedPeers = removedPeers;
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
				if(torrent.pctRemovedPeers) {
					const peers = torrent.pctRemovedPeers;
					torrent.pctRemovedPeers = undefined;
					for (let peer of peers) {
						torrent.addPeer(peer);
					}
				}
			}
		},

		onRemoveTorrentClicked(e) {
			const torrent = this.getTorrentFromEvent(e);
			if (torrent) {
				if (App.settings.delSeedboxCache === 'always') {
					try {
						rimraf(path.join(App.settings.tmpLocation, torrent.name), () => {});
						if (App.settings.separateDownloadsDir) {
							rimraf(path.join(App.settings.downloadsLocation, torrent.name), () => {});
						}
					} catch(err) {}
					$('.notification_alert').stop().text(i18n.__('Cache files deleted')).fadeIn('fast').delay(1500).fadeOut('fast');
				} else if (App.settings.delSeedboxCache === 'ask') {
					toDel.push(torrent.name);
					var delCache = function () {
						App.vent.trigger('notification:close');
						for (var i = 0; i < toDel.length; i++) {
							try {
								rimraf(path.join(App.settings.tmpLocation, toDel[i]), () => {});
								if (App.settings.separateDownloadsDir) {
									rimraf(path.join(App.settings.downloadsLocation, toDel[i]), () => {});
								}
							} catch(err) {}
						}
						$('.notification_alert').stop().text(i18n.__('Cache files deleted')).fadeIn('fast').delay(1500).fadeOut('fast');
						toDel = [];
					};
					var keepCache = function () {
						App.vent.trigger('notification:close');
						toDel = [];
					};
					setTimeout(function(){
						App.vent.trigger('notification:show', new App.Model.Notification({
							title: '',
							body: '<div style="padding: 5px 0">' + i18n.__('Delete related cache ?') + (toDel.length > 1 ? '&nbsp;&nbsp;(' + toDel.length + ')':'') + '</div>',
							showClose: false,
							type: 'info',
							buttons: [{ title: '<label class="export-database" for="exportdatabase">' + i18n.__('Yes') + '</label>', action: delCache }, { title: '<label class="export-database" for="exportdatabase">' + i18n.__('No') + '</label>', action: keepCache }]
						}));
					}, 300);
				}
				torrent.destroy(() => {
					try { fs.unlinkSync(path.join(torrentsDir, torrent.infoHash)); } catch(err) {
						if (App.settings.separateDownloadsDir) {
							try { fs.unlinkSync(path.join(torrentsDir2, torrent.infoHash)); } catch(err) {}
						}
					}
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

		openItem: function () {
			const hash = $('.tab-torrent.active')[0].getAttribute('id');
			const torrent = App.WebTorrent.torrents.find(torrent => torrent.infoHash === hash);
			if (App.settings.separateDownloadsDir && !torrent._servers[0]) {
				App.settings.os === 'windows' ? nw.Shell.openExternal(Settings.downloadsLocation) : nw.Shell.openItem(Settings.downloadsLocation);
			} else {
				App.settings.os === 'windows' ? nw.Shell.openExternal(Settings.tmpLocation) : nw.Shell.openItem(Settings.tmpLocation);
			}
		},

		downloadItem: function (e) {
			const hash = $('.tab-torrent.active')[0].getAttribute('id');
			const thisTorrent = App.WebTorrent.torrents.find(torrent => torrent.infoHash === hash);
			var torrentStart = new Backbone.Model({
				torrent: thisTorrent.magnetURI,
				title: thisTorrent.name,
				defaultSubtitle: Settings.subtitle_language,
				device: App.Device.Collection.selected,
				file_name: e.target.parentNode.firstChild.innerHTML
			});
			$('#resume-'+hash).show();
			$('#play-'+hash).hide();
			e.target.parentNode.style.opacity = 1;
			e.target.parentNode.childNodes[3].style.display = 'inline-block';
			e.target.parentNode.childNodes[2].style.display = 'none';
			App.vent.trigger('stream:start', torrentStart, 'downloadOnly');
		},

		playItem: function (e) {
			const hash = $('.tab-torrent.active')[0].getAttribute('id');
			const thisTorrent = App.WebTorrent.torrents.find(torrent => torrent.infoHash === hash);
			var torrentStart = new Backbone.Model({
				torrent: thisTorrent.magnetURI,
				title: thisTorrent.name,
				defaultSubtitle: Settings.subtitle_language,
				device: App.Device.Collection.selected,
				file_name: e.target.parentNode.firstChild.innerHTML
			});
			$('#resume-'+hash).show();
			$('#play-'+hash).hide();
			$('#trash-'+hash).addClass('disabled');
			e.target.parentNode.style.opacity = 1;
			e.target.parentNode.childNodes[3].style.display = 'inline-block';
			e.target.parentNode.childNodes[2].style.display = 'none';
			App.vent.trigger('stream:start', torrentStart);
		},

		openMagnet: function (e) {
			const hash = $('.tab-torrent.active')[0].getAttribute('id');
			const torrent = App.WebTorrent.torrents.find(torrent => torrent.infoHash === hash);
			if (torrent.magnetURI) {
				var magnetLink = torrent.magnetURI.replace(/\&amp;/g, '&');
				magnetLink = magnetLink.split('&tr=')[0] + _.union(decodeURIComponent(magnetLink).replace(/\/announce/g, '').split('&tr=').slice(1), Settings.trackers.forced.toString().replace(/\/announce/g, '').split(',')).map(t => `&tr=${t}/announce`).join('');
				Common.openOrClipboardLink(e, magnetLink, i18n.__('magnet link'));
			}
		},

		healthClicked: function () {
			const hash = $('.tab-torrent.active')[0].getAttribute('id');
			const torrent = App.WebTorrent.torrents.find(torrent => torrent.infoHash === hash);
			this.updateHealth(torrent);
		},

		updateHealth: function(torrent) {
			const healthButton = new Common.HealthButton('.seedbox .health-icon', cb => Common.retrieveTorrentHealth(torrent, cb));
			healthButton.reset();
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
			var stats;
			try { stats = fs.statSync(App.settings.tmpLocation + '/TorrentCache/' + infoHash); } catch(err) {
				try { stats = fs.statSync(App.settings.downloadsLocation + '/TorrentCache/' + infoHash); } catch(err) {}
			}
			const torrent = App.WebTorrent.get(infoHash);

			if (wasJustSelected) {
				this.updateHealth(torrent);
				const $fileList = $('.torrents-info > ul.file-list');
				$fileList.empty();
				try {
					torrent.files.sort(function(a, b){
						if (a.name < b.name) { return -1; }
						if (a.name > b.name) { return 1; }
						return 0;
					});
				} catch (err) {}
				for (const file of torrent.files) {
					if (supported.indexOf(path.extname(file.name).toLowerCase()) !== -1) {
						if ($('.loading .maximize-icon').is(':visible') || $('.player .maximize-icon').is(':visible')) {
							if (torrent._selections.some(function (el) { return el.from == file._startPiece || el.to == file._endPiece; })) {
								$fileList.append(`<li class="file-item tooltipped" title="${Common.fileSize(file.length)}" data-placement="left"><a>${file.name}</a><i class="fa fa-play item-play tooltipped disabled" title="` + i18n.__('Watch Now') + `" data-placement="left"></i><i class="fa fa-download item-download tooltipped" title="` + i18n.__('Download') + `" data-placement="left" style="display:none"></i><i class="fa fa-folder-open item-open tooltipped" title="` + i18n.__('Cache Folder') + `" data-placement="left"></i></li>`);
							} else {
								$fileList.append(`<li class="file-item tooltipped" title="${Common.fileSize(file.length)}" data-placement="left" style="opacity:0.3"><a>${file.name}</a><i class="fa fa-play item-play tooltipped disabled" title="` + i18n.__('Watch Now') + `" data-placement="left"></i><i class="fa fa-download item-download tooltipped" title="` + i18n.__('Download') + `" data-placement="left"></i><i class="fa fa-folder-open item-open tooltipped" title="` + i18n.__('Cache Folder') + `" data-placement="left" style="display:none"></i></li>`);
							}
							$('.seedbox .item-play').prop('disabled', true);
						} else {
							if (torrent._selections.some(function (el) { return el.from == file._startPiece || el.to == file._endPiece; })) {
								$fileList.append(`<li class="file-item tooltipped" title="${Common.fileSize(file.length)}" data-placement="left"><a>${file.name}</a><i class="fa fa-play item-play tooltipped" title="` + i18n.__('Watch Now') + `" data-placement="left"></i><i class="fa fa-download item-download tooltipped" title="` + i18n.__('Download') + `" data-placement="left" style="display:none"></i><i class="fa fa-folder-open item-open tooltipped" title="` + i18n.__('Cache Folder') + `" data-placement="left"></i></li>`);
							} else {
								$fileList.append(`<li class="file-item tooltipped" title="${Common.fileSize(file.length)}" data-placement="left" style="opacity:0.3"><a>${file.name}</a><i class="fa fa-play item-play tooltipped" title="` + i18n.__('Watch Now') + `" data-placement="left"></i><i class="fa fa-download item-download tooltipped" title="` + i18n.__('Download') + `" data-placement="left"></i><i class="fa fa-folder-open item-open tooltipped" title="` + i18n.__('Cache Folder') + `" data-placement="left" style="display:none"></i></li>`);
							}
						}
					}
				}
			}

			torrent.name ? $('.seedbox-infos-title').text(torrent.name) : $('.seedbox-infos-title').text(i18n.__('connecting'));
			$('.seedbox-downloaded').text(' ' + formatBytes(torrent.downloaded));
			$('.seedbox-uploaded').text(' ' + formatBytes(torrent.uploaded));
			try { $('.seedbox-infos-date').text(i18n.__('added') + ' ' + dayjs(stats.ctime).fromNow()); } catch(err) {}
			$('.progress-bar').css('width', (torrent.progress * 100).toFixed(2) + '%');
			$('.progress-percentage>span').text((torrent.progress * 100).toFixed(2) + '%');
			if (torrent.progress >= 1) {
				if (!$('.progress-bar').hasClass('done')) {
					$('.progress-bar').addClass('done');
				}
			} else if ($('.progress-bar').hasClass('done')) {
				$('.progress-bar').removeClass('done');
			}
			this.$('.file-item, .item-download, .item-play, .item-open').tooltip({
				html: true,
				delay: {
					'show': 800,
					'hide': 100
				}
			}).hover(function(e){
				if ($(e.target).is('.item-download') || $(e.target).is('.item-play') || $(e.target).is('.item-open')) {
					$('.file-item').tooltip('hide');
				}
			});
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
