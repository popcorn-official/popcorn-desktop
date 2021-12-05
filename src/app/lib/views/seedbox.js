(function (App) {
	'use strict';

	var torrentsDir = path.join(App.settings.tmpLocation + '/TorrentCache/'),
		torrentsDir2 = path.join(App.settings.downloadsLocation + '/TorrentCache/'),
		toDel = [],
		totalSize,
		totalDownloaded,
		totalPer,
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
			'click .pause-torrent': 'onPauseTorrentClicked',
			'click .resume-torrent': 'onResumeTorrentClicked',
			'click .trash-torrent': 'onRemoveTorrentClicked',
			'click .tab-torrent': 'clickTorrent',
			'dblclick .file-item': 'openItem',
			'click .item-play': 'addItem',
			'click .item-download': 'addItem',
			'click .item-remove': 'removeItem'
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
				currentHash && $('#trash-'+currentHash)[0] ? $('#trash-'+currentHash).addClass('disabled').prop('disabled', true) : null;
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

			setTimeout(() => this.updateView($('.tab-torrent.active'), true), 100);

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
			try { e.stopPropagation(); } catch(err) {}
			const torrent = this.getTorrentFromEvent(e, id);
			if (torrent) {
				this.pauseTorrent(torrent);
			}
		},

		onResumeTorrentClicked(e, id) {
			try { e.stopPropagation(); } catch(err) {}
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
			try { e.stopPropagation(); } catch(err) {}
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

		openItem: function (e) {
			const hash = $('.tab-torrent.active')[0].getAttribute('id');
			const torrent = App.WebTorrent.torrents.find(torrent => torrent.infoHash === hash);
			const filename = e.target.firstChild.innerHTML || e.target.innerHTML;
			const location = torrent.files.filter(obj => { return obj.name === filename; })[0].path.replace(/[^\\/]*$/, '');
			App.settings.os === 'windows' ? nw.Shell.openExternal(location) : nw.Shell.openItem(location);
		},

		addItem: function (e) {
			e.stopPropagation();
			const target = $(e.target);
			const hash = $('.tab-torrent.active')[0].getAttribute('id');
			const thisTorrent = App.WebTorrent.torrents.find(torrent => torrent.infoHash === hash);
			var torrentStart = new Backbone.Model({
				torrent: thisTorrent.magnetURI,
				title: thisTorrent.name,
				defaultSubtitle: Settings.subtitle_language,
				device: App.Device.Collection.selected,
				file_name: e.target.parentNode.firstChild.innerHTML
			});
			if (thisTorrent.paused) {
				this.onResumeTorrentClicked($('.tab-torrent.active'), hash);
				$('#resume-'+hash).show();
				$('#play-'+hash).hide();
			}
			setTimeout(() => {
				this.updateView($('.tab-torrent.active'), true);
				if (target.hasClass('item-play')) {
					$('#trash-'+hash).addClass('disabled').prop('disabled', true);
					$('.seedbox .item-play').addClass('disabled').prop('disabled', true);
				}
			}, 100);
			App.vent.trigger('stream:start', torrentStart, target.hasClass('item-play') ? '' : 'downloadOnly' );
		},

		removeItem: function (e) {
			e.stopPropagation();
			const hash = $('.tab-torrent.active')[0].getAttribute('id');
			const thisTorrent = App.WebTorrent.torrents.find(torrent => torrent.infoHash === hash);
			const filename = e.target.parentNode.firstChild.innerHTML;
			const file = thisTorrent.files.filter(obj => { return obj.name === filename; })[0];
			if (!file._fileStreams.size) {
				file.deselect(0);
				file.hidden = true;
				setTimeout(() => this.updateView($('.tab-torrent.active'), true), 100);
			}
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

		remainingTime: function (downloadSpeed) {
			var timeRemaining = Math.round((totalSize - totalDownloaded) / downloadSpeed);
			if (isNaN(timeRemaining) || timeRemaining < 0) {
				timeRemaining = 0;
			}
			if (timeRemaining === undefined || !isFinite(timeRemaining) || totalSize === 0) {
				return i18n.__('Unknown time remaining');
			} else if (timeRemaining > 3600) {
				return i18n.__('%s hour(s) remaining', Math.round(timeRemaining / 3600));
			} else if (timeRemaining > 60) {
				return i18n.__('%s minute(s) remaining', Math.round(timeRemaining / 60));
			} else if (timeRemaining <= 60) {
				return i18n.__('%s second(s) remaining', timeRemaining);
			}
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

				let active = $('.loading .maximize-icon').is(':visible') || $('.player .maximize-icon').is(':visible');
				for (const file of torrent.files) {
					if (supported.indexOf(path.extname(file.name).toLowerCase()) === -1) {
						continue;
					}
					let selected = false;
					if (!file.hidden && (file.done || torrent._selections.some(function (el) { return el.from === file._startPiece || el.to === file._endPiece; }))) {
						selected = true;
					}

					$fileList.append(`<li class="file-item tooltipped${ selected ? '' : ' unselected' }" 
						title="${Common.fileSize(file.length)}" data-placement="left"><a>${file.name}</a>
						<i class="fa fa-play item-play"></i>
						<i class="fa fa-download item-download"${ selected ? ' style="display:none"' : '' }></i>
						<i class="fa fa-trash item-remove"${ selected ? '' : ' style="display:none"' }></i>
					</li>`);
				}
				if (active) {
					$('.seedbox .item-play').addClass('disabled').prop('disabled', true);
				}

				$('.file-item').tooltip({
					html: true,
					delay: {
						'show': 800,
						'hide': 100
					}
				});
				$('.item-play, .item-download, .item-remove').hover(function(){
					$('.file-item').tooltip('hide');
				});
			}

			totalSize = 0;
			totalDownloaded = 0;
			totalPer = torrent.downloaded ? 1 : 0;

			for (const file of torrent.files) {
				if (supported.indexOf(path.extname(file.name).toLowerCase()) === -1) {
					continue;
				}
				if (!file.hidden && (file.done || torrent._selections.some(function (el) { return el.from === file._startPiece || el.to === file._endPiece; }))) {
					totalSize = totalSize + file.length;
					totalDownloaded = totalDownloaded + file.downloaded;
					try {
						let thisElement = document.evaluate("//a[text()='" + file.name + "']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.parentNode;
						$(thisElement).attr('title', Common.fileSize(file.downloaded) + ' / ' + Common.fileSize(file.length)).tooltip('fixTitle');
					} catch(err) {}
				}
			}

			if (totalSize) {
				totalPer = 1 / (totalSize / totalDownloaded);
			}

			torrent.name ? $('.seedbox-infos-title').text(torrent.name) : $('.seedbox-infos-title').text(i18n.__('connecting'));
			$('.seedbox-totalsize').text(' ' + formatBytes(totalSize));
			$('.seedbox-downloaded').text(' ' + formatBytes(totalDownloaded));
			$('.seedbox-uploaded').text(' ' + formatBytes(torrent.uploaded));
			try { $('.seedbox-infos-date').text(i18n.__('added') + ' ' + dayjs(stats.ctime).fromNow()); } catch(err) {}
			if (totalPer >= 1) {
				if (!$('.progress-bar').hasClass('done')) {
					$('.progress-bar').addClass('done');
				}
				$('.progress-label span').text(i18n.__('Downloaded'));
				totalPer = 1;
			} else if ($('.progress-bar').hasClass('done')) {
				$('.progress-bar').removeClass('done');
			} else {
				$('.progress-label span').text(this.remainingTime(torrent.downloadSpeed));
			}
			$('.progress-bar').css('width', ((totalPer || 0) * 100).toFixed(2) + '%');
			$('.progress-percentage>span').text(((totalPer || 0) * 100).toFixed(2) + '%');
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
