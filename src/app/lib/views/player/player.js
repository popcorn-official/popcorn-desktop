(function (App) {
	'use strict';

	var _this;

	var Player = Backbone.Marionette.ItemView.extend({
		template: '#player-tpl',
		className: 'player',
		player: null,

		ui: {
			eyeInfo: '.eye-info-player',
			downloadSpeed: '.download_speed_player',
			uploadSpeed: '.upload_speed_player',
			activePeers: '.active_peers_player'
		},

		events: {
			'click .close-info-player': 'closePlayer',
			'click .vjs-fullscreen-control': 'toggleFullscreen',
			'click .vjs-subtitles-button': 'toggleSubtitles'
		},

		isMovie: function () {
			return this.model.get('tvdb_id') === undefined;
		},

		initialize: function () {
			this.listenTo(this.model, 'change:downloadSpeed', this.updateDownloadSpeed);
			this.listenTo(this.model, 'change:uploadSpeed', this.updateUploadSpeed);
			this.listenTo(this.model, 'change:active_peers', this.updateActivePeers);
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

		closePlayer: function () {
			var that = this;
			win.info('Player closed');
			if (this._WatchingTimer) {
				clearInterval(this._WatchingTimer);
			}
			if (this._AutoPlayCheckTimer) {
				clearInterval(this._AutoPlayCheckTimer);
			}
			// Check if >80% is watched to mark as watched by user  (maybe add value to settings
			var type = (this.isMovie() ? 'movie' : 'show');
			if (this.video.currentTime() / this.video.duration() >= 0.8) {
				App.vent.trigger(type + ':watched', this.model.attributes, 'scrobble');
			} else {
				App.Trakt[type].cancelWatching();
			}

			try {
				this.video.dispose();
			} catch (e) {
				// Stop weird Videojs errors
			}

			App.vent.trigger('player:close');


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
						progressTips: {},
						dropSubtitles: {}
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
				_this.closePlayer();

				if (_this.model.get('auto_play')) {

					var episodes = _this.model.get('episodes');

					if (_this.model.get('auto_id') !== episodes[episodes.length - 1]) {

						var auto_play_data = _this.model.get('auto_play_data');
						var current_quality = _this.model.get('quality');
						var idx;

						_.find(auto_play_data, function (data, dataIdx) {
							if (data.id == _this.model.get('auto_id')) {
								idx = dataIdx;
								return true;
							};
						});
						var next_episode = auto_play_data[idx + 1];

						next_episode.auto_play = true;
						next_episode.auto_id = parseInt(next_episode.season) * 100 + parseInt(next_episode.episode);
						next_episode.auto_play_data = auto_play_data;

						if (next_episode.torrents[current_quality].url) {
							next_episode.torrent = next_episode.torrents[current_quality].url;
						} else {
							next_episode.torrent = next_episode[next_episode.torrents.length - 1].url; //select highest quality available if user selected not found
						}

						console.log(next_episode.torrents[current_quality].url, current_quality);

						var torrentStart = new Backbone.Model(next_episode);

						App.vent.trigger('stream:start', torrentStart);
					}
				}

			});

			var checkAutoPlay = function () {
				if (!_this.isMovie()) {
					if ((_this.video.duration() - _this.video.currentTime()) < 60) {
						var count = Math.round(_this.video.duration() - _this.video.currentTime());
						$('.playing_next').show();

						$('.playing_next span').text(count);
					} else {
						$('.playing_next').hide();
						$('.playing_next span').text('');

					}
				}
			};


			var sendToTrakt = function () {
				if (_this.isMovie()) {
					win.debug('Reporting we are watching ' + _this.model.get('imdb_id') + ' ' + (_this.video.currentTime() / _this.video.duration() * 100 | 0) + '% ' + (_this.video.duration() / 60 | 0));
					App.Trakt.movie.watching(_this.model.get('imdb_id'), _this.video.currentTime() / _this.video.duration() * 100 | 0, _this.video.duration() / 60 | 0);
				} else {
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
				}
			});

			player.on('pause', function () {
				if (_this.player.scrubbing) {
					_this.wasSeek = true;
				} else {
					_this.wasSeek = false;
				}
			});

			_this.bindKeyboardShortcuts();

			// There was an issue with the video
			player.on('error', function (error) {
				if (_this.isMovie()) {
					App.Trakt.movie.cancelWatching();
				} else {
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

			Mousetrap.bind('ctrl+d', function (e) {
				_this.toggleMouseDebug();
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

			Mousetrap.unbind('ctrl+d');

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
		},

		mouseScroll: function (e) {
			if ($(e.target).parents('.vjs-subtitles-button').length) {
				return;
			}
			if (event.wheelDelta > 0) { // Scroll up
				_this.adjustVolume(0.1);
			} else { // Scroll down
				_this.adjustVolume(-0.1);
			}
		},

		adjustVolume: function (i) {
			var v = this.player.volume();
			this.player.volume(v + i);
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
				this.player.trigger('fullscreenchange');
				this.nativeWindow.leaveFullscreen();
				this.nativeWindow.focus();
			} else {
				this.player.isFullscreen(true);
				this.player.trigger('fullscreenchange');
				this.nativeWindow.enterFullscreen();
				this.nativeWindow.focus();
			}
		},

		toggleSubtitles: function () {},

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
			this.displayOverlayMsg(i18n.__('Subtitles Offset') + ': ' + this.player.options()['trackTimeOffset'].toFixed(1) + ' ' + i18n.__('secs'));
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
			var _this = this;
			if (this.model.get('type') === 'video/youtube') { // XXX Sammuel86 Trailer UI Show FIX/HACK -START
				$('.trailer_mouse_catch').remove();
			}
			$('#player_drag').hide();
			$('#header').show();
			if (!this.inFullscreen && win.isFullscreen) {
				win.leaveFullscreen();
			}
			_this.unbindKeyboardShortcuts();

			App.vent.trigger('stream:stop');
			if (this._WatchingTimer) {
				clearInterval(this._WatchingTimer);
			}
			if (this._AutoPlayCheckTimer) {
				clearInterval(this._AutoPlayCheckTimer);
			}
		}

	});
	App.View.Player = Player;
})(window.App);
