(function (App) {
	'use strict';

	var _this;
	var autoplayisshown = false;
	var precachestarted = false;
	var next_episode_model = false;
	var remaining = false;
	var createdRemaining = false;
	var firstPlay = true;

	var Player = Backbone.Marionette.ItemView.extend({
		template: '#player-tpl',
		className: 'player',
		player: null,

		ui: {
			eyeInfo: '.eye-info-player',
			downloadSpeed: '.download_speed_player',
			uploadSpeed: '.upload_speed_player',
			activePeers: '.active_peers_player',
			downloaded: '.downloaded_player',
			pause: '.fa-pause',
			play: '.fa-play'
		},

		events: {
			'click .close-info-player': 'closePlayer',
			'click .playnownext': 'playNextNow',
			'click .vjs-fullscreen-control': 'toggleFullscreen',
			'click .playnownextNOT': 'playNextNot',
			'click .vjs-subtitles-button': 'toggleSubtitles',
			'click .vjs-text-track': 'moveSubtitles',
			'click .vjs-play-control': 'togglePlay'
		},

		isMovie: function () {
			if (this.model.get('tvdb_id') === undefined) {
				if (this.model.get('type') === 'video/youtube' || this.model.get('imdb_id') === undefined) {
					return undefined;
				} else {
					return 'movie';
				}
			} else {
				return 'show';
			}
		},

		initialize: function () {
			this.listenTo(this.model, 'change:downloadSpeed', this.updateDownloadSpeed);
			this.listenTo(this.model, 'change:uploadSpeed', this.updateUploadSpeed);
			this.listenTo(this.model, 'change:active_peers', this.updateActivePeers);
			this.listenTo(this.model, 'change:downloaded', this.updateDownloaded);

			this.video = false;
			this.inFullscreen = win.isFullscreen;
		},

		updateDownloadSpeed: function () {
			this.ui.downloadSpeed.text(this.model.get('downloadSpeed'));
		},

		updateUploadSpeed: function () {
			this.ui.uploadSpeed.text(this.model.get('uploadSpeed'));
		},

		updateActivePeers: function () {
			this.ui.activePeers.text(this.model.get('active_peers'));
		},

		updateDownloaded: function () {
			if (this.model.get('downloadedPercent').toFixed(0) < 100) {
				this.ui.downloaded.html(this.model.get('downloadedFormatted') + ' (' + this.model.get('downloadedPercent').toFixed(0) + '%)');
				$('.vjs-load-progress').css('width', this.model.get('downloadedPercent').toFixed(0) + '%');
				remaining = true;

				if (!createdRemaining) { //we create it
					createdRemaining = true;
					$('.details-info-player').append('<br><span class="remaining">' + this.remainingTime() + '</span>');
				} else { //we just update
					$('.remaining').html(this.remainingTime());
				}
			} else {
				this.ui.downloaded.text(i18n.__('Done'));
				$('.vjs-load-progress').css('width', '100%');
				remaining = false;
			}

			if (!remaining && createdRemaining) {
				$('.remaining').remove();
				createdRemaining = false;
			}
		},

		closePlayer: function () {
			win.info('Player closed');
			if (this._WatchingTimer) {
				clearInterval(this._WatchingTimer);
			}
			if (this._AutoPlayCheckTimer) {
				clearInterval(this._AutoPlayCheckTimer);
			}
			// Check if >80% is watched to mark as watched by user  (maybe add value to settings
			var type = this.isMovie();
			if (this.video.currentTime() / this.video.duration() >= 0.8 && type !== undefined) {
				App.vent.trigger(type + ':watched', this.model.attributes, 'scrobble');
			} else if (type !== undefined) {
				App.Trakt[type].cancelWatching();
			}

			try {
				this.video.dispose();
			} catch (e) {
				// Stop weird Videojs errors
			}

			this.ui.pause.dequeue();
			this.ui.play.dequeue();

			remaining = false;
			createdRemaining = false;
			firstPlay = true;

			App.vent.trigger('player:close');
			App.vent.trigger('preload:stop');
			App.vent.trigger('stream:stop');

			this.close();
		},

		onShow: function () {
			$('#header').removeClass('header-shadow').hide();
			// Test to make sure we have title
			win.info('Watching:', this.model.get('title'));
			$('.filter-bar').show();
			$('#player_drag').show();
			_this = this;

			// Double Click to toggle Fullscreen
			$('#video_player').dblclick(function (event) {
				_this.toggleFullscreen();
				// Stop any mouseup events pausing video
				event.preventDefault();
			});

			if (this.model.get('auto_play')) {

				precachestarted = false;
				autoplayisshown = false;
				next_episode_model = false;

				_this.prossessNext();
			}
			if (this.model.get('type') === 'video/youtube') {

				$('<div/>').appendTo('#main-window').addClass('trailer_mouse_catch'); // XXX Sammuel86 Trailer UI Show FIX/HACK

				this.video = videojs('video_player', {
					techOrder: ['youtube'],
					forceSSL: true,
					ytcontrols: false,
					quality: '720p'
				}).ready(function () {
					this.addClass('vjs-has-started');
				});
				this.ui.eyeInfo.hide();

				$('.trailer_mouse_catch').show().mousemove(function (event) { // XXX Sammuel86 Trailer UI Show FIX/HACK
					if (!_this.player.userActive()) {
						_this.player.userActive(true);
					}
				});
				$('.trailer_mouse_catch').click(function () { // XXX Sammuel86 Trailer UI Show FIX/HACK
					$('.vjs-play-control').click();
				});

			} else {
				this.video = videojs('video_player', {
					nativeControlsForTouch: false,
					trackTimeOffset: 0,
					plugins: {
						biggerSubtitle: {},
						smallerSubtitle: {},
						customSubtitles: {},
						progressTips: {}
					}
				});
			}
			var player = this.video.player();
			this.player = player;
			App.PlayerView = this;

			/* The following is a hack to make VideoJS listen to
               mouseup instead of mousedown for pause/play on the
               video element. Stops video pausing/playing when
               dragged. TODO: #fixit! /XC                        */
			this.player.tech.off('mousedown');
			this.player.tech.on('mouseup', function (event) {
				if (event.target.origEvent) {
					if (!event.target.origEvent.originalEvent.defaultPrevented) {
						_this.player.tech.onClick(event);
					}
					// clean up after ourselves
					delete event.target.origEvent;
				} else {
					_this.player.tech.onClick(event);
				}
			});
			// Force custom controls
			player.usingNativeControls(false);

			player.on('ended', function () {
				// For now close player. In future we will check if auto-play etc and get next episode

				if (_this.model.get('auto_play')) {
					_this.playNextNow();
				} else {
					_this.closePlayer();
				}

			});

			var checkAutoPlay = function () {
				if (_this.isMovie() === 'show' && next_episode_model) {
					if ((_this.video.duration() - _this.video.currentTime()) < 60 && _this.video.currentTime() > 30) {

						if (!autoplayisshown) {

							if (!precachestarted) {
								App.vent.trigger('preload:start', next_episode_model);
								precachestarted = true;
							}

							win.info('Showing Auto Play message');
							autoplayisshown = true;
							$('.playing_next').show();
							$('.playing_next').appendTo('div#video_player');
							if (!_this.player.userActive()) {
								_this.player.userActive(true);
							}
						}

						var count = Math.round(_this.video.duration() - _this.video.currentTime());
						$('.playing_next span').text(count + ' ' + i18n.__('Seconds'));

					} else {
						if (autoplayisshown) {
							win.info('Hiding Auto Play message');
							$('.playing_next').hide();
							$('.playing_next span').text('');
							autoplayisshown = false;
						}


					}
				}
			};


			var sendToTrakt = function () {
				if (_this.isMovie() === 'movie') {
					win.debug('Reporting we are watching ' + _this.model.get('imdb_id') + ' ' + (_this.video.currentTime() / _this.video.duration() * 100 | 0) + '% ' + (_this.video.duration() / 60 | 0));
					App.Trakt.movie.watching(_this.model.get('imdb_id'), _this.video.currentTime() / _this.video.duration() * 100 | 0, _this.video.duration() / 60 | 0);
				} else if (_this.isMovie() === 'show') {
					win.debug('Reporting we are watching ' + _this.model.get('tvdb_id') + ' ' + (_this.video.currentTime() / _this.video.duration() * 100 | 0) + '%');
					App.Trakt.show.watching(_this.model.get('tvdb_id'), _this.model.get('season'), _this.model.get('episode'), _this.video.currentTime() / _this.video.duration() * 100 | 0, _this.video.duration() / 60 | 0);
				}
			};

			player.one('play', function () {
				player.one('durationchange', sendToTrakt);
				_this._WatchingTimer = setInterval(sendToTrakt, 10 * 60 * 1000); // 10 minutes
				if (_this.model.get('auto_play')) {
					_this._AutoPlayCheckTimer = setInterval(checkAutoPlay, 10 * 100 * 1); // every 1 sec
				}

			});

			player.on('play', function () {
				// Trigger a resize so the subtitles are adjusted
				$(window).trigger('resize');

				if (_this.wasSeek) {
					sendToTrakt();
					if (_this.model.get('auto_play')) {
						checkAutoPlay();
					}
					_this.wasSeek = false;
				} else {
					if (firstPlay) {
						if (_this.model.get('type') === 'video/youtube') {
							try {
								document.getElementById('video_player_youtube_api').contentWindow.document.getElementsByClassName('video-ads')[0].style.display = 'none'; // XXX hide ads hack
							} catch(e) {}; //no ads
						}
						firstPlay = false;
						return;
					}
					_this.ui.pause.hide().dequeue();
					_this.ui.play.appendTo('div#video_player');
					_this.ui.play.show().delay(1500).queue(function () {
						_this.ui.play.hide().dequeue();
					});
					App.vent.trigger('player:play');
				}
			});

			player.on('pause', function () {
				if (_this.player.scrubbing) {
					_this.wasSeek = true;
				} else {
					_this.wasSeek = false;
					_this.ui.play.hide().dequeue();
					_this.ui.pause.appendTo('div#video_player');
					_this.ui.pause.show().delay(1500).queue(function () {
						_this.ui.pause.hide().dequeue();
					});
					App.vent.trigger('player:pause');
				}
			});

			_this.bindKeyboardShortcuts();

			// There was an issue with the video
			player.on('error', function (error) {
				if (_this.isMovie() === 'movie') {
					App.Trakt.movie.cancelWatching();
				} else if (_this.isMovie() === 'show') {
					App.Trakt.show.cancelWatching();
				}
				// TODO: user errors
				if (_this.model.get('type') === 'video/youtube') {
					setTimeout(function () {
						App.vent.trigger('player:close');
					}, 2000);
				}
				win.error('video.js error code: ' + $('#video_player').get(0).player.error().code, $('#video_player').get(0).player.error());
			});

			$('.player-header-background').appendTo('div#video_player');

			$('li:contains("subtitles off")').text(i18n.__('Disabled'));

			if (AdvSettings.get('alwaysFullscreen') && !this.inFullscreen) {
				this.toggleFullscreen();
			}
			if (this.inFullscreen) {
				this.player.isFullscreen(true);
				this.player.trigger('fullscreenchange');
			}

			this.player.volume(AdvSettings.get('playerVolume'));

			var timeout;
			$('.vjs-menu-content,.eye-info-player').hover(function () {
				timeout = setInterval(function () {
					App.PlayerView.player.userActive(true);
				}, 100);
			}, function () {
				clearInterval(timeout);
			});
		},

		playNextNow: function () {
			this.dontTouchFS = true; //XXX(xaiki): hack, don't touch fs state

			this.closePlayer();
			App.vent.trigger('stream:stop');
			App.vent.trigger('stream:start', next_episode_model);
		},
		playNextNot: function () {
			win.info('Hiding Auto Play message');
			$('.playing_next').hide();
			$('.playing_next span').text('');
			autoplayisshown ? false : true;

			this.model.set('auto_play', false);
		},
		prossessNext: function () {
			var episodes = _this.model.get('episodes');

			if (_this.model.get('auto_id') !== episodes[episodes.length - 1]) {

				var auto_play_data = _this.model.get('auto_play_data');
				var current_quality = _this.model.get('quality');
				var idx;

				_.find(auto_play_data, function (data, dataIdx) {
					if (data.id === _this.model.get('auto_id')) {
						idx = dataIdx;
						return true;
					}
				});
				var next_episode = auto_play_data[idx + 1];

				if (next_episode === undefined) {
					win.debug('This is the last episode');
					return;
				}

				next_episode.auto_play = true;
				next_episode.auto_id = parseInt(next_episode.season) * 100 + parseInt(next_episode.episode);
				next_episode.auto_play_data = auto_play_data;
				next_episode.episodes = episodes;
				next_episode.quality = current_quality;

				if (next_episode.torrents[current_quality].url) {
					next_episode.torrent = next_episode.torrents[current_quality].url;
				} else {
					next_episode.torrent = next_episode[next_episode.torrents.length - 1].url; //select highest quality available if user selected not found
				}

				next_episode_model = new Backbone.Model(next_episode);
			}
		},

		remainingTime: function () {
			var timeLeft = this.model.get('time_left');

			if (timeLeft > 3600) {
				return i18n.__('%s hour(s) remaining', Math.round(timeLeft / 3600));
			} else if (timeLeft > 60) {
				return i18n.__('%s minute(s) remaining', Math.round(timeLeft / 60));
			} else {
				return i18n.__('%s second(s) remaining', timeLeft);
			}
		},

		scaleWindow: function (scale) {
			var v = $('video')[0];
			if (v.videoWidth && v.videoHeight) {
				window.resizeTo(v.videoWidth * scale, v.videoHeight * scale);
			}
		},

		bindKeyboardShortcuts: function () {
			var _this = this;

			// add ESC toggle when full screen, go back when not
			Mousetrap.bind('esc', function (e) {
				_this.nativeWindow = require('nw.gui').Window.get();

				if (_this.nativeWindow.isFullscreen) {
					_this.leaveFullscreen();
				} else {
					_this.closePlayer();
				}
			});

			Mousetrap.bind('backspace', function (e) {
				_this.closePlayer();
			});

			Mousetrap.bind(['f', 'F'], function (e) {
				_this.toggleFullscreen();
			});

			Mousetrap.bind('h', function (e) {
				_this.adjustSubtitleOffset(-0.1);
			});

			Mousetrap.bind('g', function (e) {
				_this.adjustSubtitleOffset(0.1);
			});

			Mousetrap.bind('shift+h', function (e) {
				_this.adjustSubtitleOffset(-1);
			});

			Mousetrap.bind('shift+g', function (e) {
				_this.adjustSubtitleOffset(1);
			});

			Mousetrap.bind('ctrl+h', function (e) {
				_this.adjustSubtitleOffset(-5);
			});

			Mousetrap.bind('ctrl+g', function (e) {
				_this.adjustSubtitleOffset(5);
			});

			Mousetrap.bind(['space', 'p'], function (e) {
				$('.vjs-play-control').click();
			});

			Mousetrap.bind('right', function (e) {
				_this.seek(10);
			});

			Mousetrap.bind('shift+right', function (e) {
				_this.seek(60);
			});

			Mousetrap.bind('ctrl+right', function (e) {
				_this.seek(600);
			});

			Mousetrap.bind('left', function (e) {
				_this.seek(-10);
			});

			Mousetrap.bind('shift+left', function (e) {
				_this.seek(-60);
			});

			Mousetrap.bind('ctrl+left', function (e) {
				_this.seek(-600);
			});

			Mousetrap.bind('up', function (e) {
				_this.adjustVolume(0.1);
			});

			Mousetrap.bind('shift+up', function (e) {
				_this.adjustVolume(0.5);
			});

			Mousetrap.bind('ctrl+up', function (e) {
				_this.adjustVolume(1);
			});

			Mousetrap.bind('down', function (e) {
				_this.adjustVolume(-0.1);
			});

			Mousetrap.bind('shift+down', function (e) {
				_this.adjustVolume(-0.5);
			});

			Mousetrap.bind('ctrl+down', function (e) {
				_this.adjustVolume(-1);
			});

			Mousetrap.bind(['m', 'M'], function (e) {
				_this.toggleMute();
			});

			Mousetrap.bind(['u', 'U'], function (e) {
				_this.displayStreamURL();
			});

			Mousetrap.bind('j', function (e) {
				_this.adjustPlaybackRate(-0.1, true);
			});

			Mousetrap.bind(['k', 'shift+k', 'ctrl+k'], function (e) {
				_this.adjustPlaybackRate(1.0, false);
			});

			Mousetrap.bind(['l'], function (e) {
				_this.adjustPlaybackRate(0.1, true);
			});

			Mousetrap.bind(['shift+j', 'ctrl+j'], function (e) {
				_this.adjustPlaybackRate(0.5, false);
			});

			Mousetrap.bind('shift+l', function (e) {
				_this.adjustPlaybackRate(2.0, false);
			});

			Mousetrap.bind('ctrl+l', function (e) {
				_this.adjustPlaybackRate(4.0, false);
			});

			Mousetrap.bind('ctrl+d', function (e) {
				_this.toggleMouseDebug();
			});

			Mousetrap.bind('0', function (e) {
				_this.scaleWindow(0.5);
			});

			Mousetrap.bind('1', function (e) {
				_this.scaleWindow(1);
			});

			Mousetrap.bind('2', function (e) {
				_this.scaleWindow(2);
			});

			document.addEventListener('mousewheel', _this.mouseScroll);
		},

		unbindKeyboardShortcuts: function () {
			var _this = this;

			Mousetrap.unbind('esc');

			Mousetrap.unbind('backspace');

			Mousetrap.unbind(['f', 'F']);

			Mousetrap.unbind('h');

			Mousetrap.unbind('g');

			Mousetrap.unbind('shift+h');

			Mousetrap.unbind('shift+g');

			Mousetrap.unbind('ctrl+h');

			Mousetrap.unbind('ctrl+g');

			Mousetrap.unbind(['space', 'p']);

			Mousetrap.unbind('right');

			Mousetrap.unbind('shift+right');

			Mousetrap.unbind('ctrl+right');

			Mousetrap.unbind('left');

			Mousetrap.unbind('shift+left');

			Mousetrap.unbind('ctrl+left');

			Mousetrap.unbind('up');

			Mousetrap.unbind('shift+up');

			Mousetrap.unbind('ctrl+up');

			Mousetrap.unbind('down');

			Mousetrap.unbind('shift+down');

			Mousetrap.unbind('ctrl+down');

			Mousetrap.unbind(['m', 'M']);

			Mousetrap.unbind(['u', 'U']);

			Mousetrap.unbind(['j', 'shift+j', 'ctrl+j']);

			Mousetrap.unbind(['k', 'shift+k', 'ctrl+k']);

			Mousetrap.unbind(['l', 'shift+l', 'ctrl+l']);

			Mousetrap.unbind('ctrl+d');

			Mousetrap.unbind('0');

			Mousetrap.unbind('1');

			Mousetrap.unbind('2');

			document.removeEventListener('mousewheel', _this.mouseScroll);
		},

		toggleMouseDebug: function () {
			if (this.player.debugMouse_) {
				this.player.debugMouse_ = false;
				this.displayOverlayMsg('Mouse debug disabled');
			} else {
				this.player.debugMouse_ = true;
				this.displayOverlayMsg('Mouse debug enabled. Dont touch the mouse until disabled.');
			}
		},

		seek: function (s) {
			var t = this.player.currentTime();
			this.player.currentTime(t + s);
			this.player.trigger('mousemove'); //hack, make controls show
			App.vent.trigger('seekchange');
		},

		mouseScroll: function (e) {
			if ($(e.target).parents('.vjs-subtitles-button').length) {
				return;
			}
			var mult = (Settings.os === 'mac') ? -1 : 1; // up/down invert
			if ((event.wheelDelta * mult) > 0) { // Scroll up
				_this.adjustVolume(0.1);
			} else { // Scroll down
				_this.adjustVolume(-0.1);
			}
		},

		adjustVolume: function (i) {
			var v = this.player.volume();
			this.player.volume(v + i);
			AdvSettings.set('playerVolume', this.player.volume());
			this.displayOverlayMsg(i18n.__('Volume') + ': ' + this.player.volume().toFixed(1) * 100 + '%');
			App.vent.trigger('volumechange');
		},

		toggleMute: function () {
			this.player.muted(!this.player.muted());
		},

		toggleFullscreen: function () {

			this.nativeWindow = require('nw.gui').Window.get();

			if (this.nativeWindow.isFullscreen) {
				this.player.isFullscreen(false);
				this.nativeWindow.leaveFullscreen();
				this.nativeWindow.focus();
			} else {
				this.player.isFullscreen(true);
				this.nativeWindow.enterFullscreen();
				this.nativeWindow.focus();
			}

			this.player.trigger('fullscreenchange');
		},

		toggleSubtitles: function () {},

		moveSubtitles: function (e) {
			AdvSettings.set('playerSubPosition', $('.vjs-text-track').css('top'));
		},

		leaveFullscreen: function () {
			this.nativeWindow = require('nw.gui').Window.get();

			if (this.nativeWindow.isFullscreen) {
				this.player.isFullscreen(false);
				this.player.trigger('fullscreenchange');
				this.nativeWindow.leaveFullscreen();
				this.nativeWindow.focus();
			}
		},

		displayStreamURL: function () {
			var clipboard = require('nw.gui').Clipboard.get();
			clipboard.set($('#video_player video').attr('src'), 'text');
			this.displayOverlayMsg(i18n.__('URL of this stream was copied to the clipboard'));
		},

		adjustSubtitleOffset: function (s) {
			var o = this.player.options()['trackTimeOffset'];
			this.player.options()['trackTimeOffset'] = (o + s);
			this.displayOverlayMsg(i18n.__('Subtitles Offset') + ': ' + (-this.player.options()['trackTimeOffset'].toFixed(1)) + ' ' + i18n.__('secs'));
		},

		adjustPlaybackRate: function (rate, delta) {
			var nRate = delta ? this.player.playbackRate() + rate : rate;
			if (nRate > 0.49 && nRate < 4.01) {
				this.player.playbackRate(nRate);
				if (this.player.playbackRate() !== nRate) {
					this.displayOverlayMsg(i18n.__('Playback rate adjustment is not available for this video!'));
				} else {
					this.displayOverlayMsg(i18n.__('Playback rate') + ': ' + parseFloat(nRate.toFixed(1)) + 'x');
				}
			}
		},

		displayOverlayMsg: function (message) {
			if ($('.vjs-overlay').length > 0) {
				$('.vjs-overlay').text(message);
				clearTimeout($.data(this, 'overlayTimer'));
				$.data(this, 'overlayTimer', setTimeout(function () {
					$('.vjs-overlay').fadeOut('normal', function () {
						$(this).remove();
					});
				}, 3000));
			} else {
				$(this.player.el()).append('<div class =\'vjs-overlay vjs-overlay-top-left\'>' + message + '</div>');
				$.data(this, 'overlayTimer', setTimeout(function () {
					$('.vjs-overlay').fadeOut('normal', function () {
						$(this).remove();
					});
				}, 3000));
			}
		},

		onClose: function () {
			if (this.model.get('type') === 'video/youtube') { // XXX Sammuel86 Trailer UI Show FIX/HACK -START
				$('.trailer_mouse_catch').remove();
				this.closePlayer();
			}
			$('#player_drag').hide();
			$('#header').show();
			if (!this.dontTouchFS && !this.inFullscreen && win.isFullscreen) {
				win.leaveFullscreen();
			}
			if (this.inFullscreen && !win.isFullscreen) {
				$('.btn-os.fullscreen').removeClass('active');
			}
			this.unbindKeyboardShortcuts();
			App.vent.trigger('player:close');
		}

	});
	App.View.Player = Player;
})(window.App);
