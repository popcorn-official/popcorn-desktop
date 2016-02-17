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
            'click .playnownextNOT': 'playNextNot',
            'click .verifmetaTRUE': 'verifyMetadata',
            'click .verifmetaFALSE': 'wrongMetadata',
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
                return 'episode';
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

        uploadSubtitles: function () {
            // verify custom subtitles not modified
            if (AdvSettings.get('opensubtitlesAutoUpload') && this.customSubtitles && !this.customSubtitles.modified) {
                var real_elapsedTime = (Date.now() - this.customSubtitles.added_at) / 1000;
                var player_elapsedTime = this.player.time() - this.customSubtitles.timestamp;
                var perc_elapsedTime = player_elapsedTime / this.player.length();

                // verify was played long enough
                if (real_elapsedTime >= player_elapsedTime && perc_elapsedTime >= 0.7) {
                    var upload = {
                        subpath: this.customSubtitles.subPath,
                        path: this.model.get('videoFile'),
                        imdbid: this.model.get('imdb_id')
                    };

                    win.debug('OpenSubtitles - Uploading subtitles', upload);

                    var subtitleProvider = App.Config.getProviderForType('subtitle');
                    subtitleProvider.upload(upload).then(function (data) {
                        if (data.alreadyindb) {
                            return;
                        }
                        win.debug('OpenSubtitles - Subtitles successfully uploaded', data);
                    }).catch(function (err) {
                        win.warn('OpenSubtitles: could not upload subtitles', err);
                    });
                }
            }
        },

        closePlayer: function () {
            win.info('Player closed');
            if (this._AutoPlayCheckTimer) {
                clearInterval(this._AutoPlayCheckTimer);
            }
            if (this._ShowUIonHover) {
                clearInterval(this._ShowUIonHover);
            }

            this.uploadSubtitles();
            this.sendToTrakt('stop');

            var type = this.isMovie();
            if (type === 'episode') {
                type = 'show';
            }
            if (this.video.currentTime() / this.video.duration() >= 0.8 && type !== undefined) {
                App.vent.trigger(type + ':watched', this.model.attributes, 'database');
            }

            // remember position
            if (this.video.currentTime() / this.video.duration() < 0.8) {
                AdvSettings.set('lastWatchedTitle', this.model.get('title'));
                AdvSettings.set('lastWatchedTime', this.video.currentTime() - 5);
            } else {
                AdvSettings.set('lastWatchedTime', false);
            }

            this.ui.pause.dequeue();
            this.ui.play.dequeue();

            remaining = false;
            createdRemaining = false;
            firstPlay = true;

            App.vent.trigger('preload:stop');
            App.vent.trigger('stream:stop');

            var vjsPlayer = document.getElementById('video_player');
            if (vjsPlayer) {
                videojs(vjsPlayer).dispose();
            }

            this.destroy();
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

                _this.processNext();
            }
            if (this.model.get('type') === 'video/youtube') {

                this.video = videojs('video_player', {
                    techOrder: ['youtube'],
                    forceSSL: true,
                    ytcontrols: false,
                    quality: '720p'
                }).ready(function () {
                    this.addClass('vjs-has-started');
                });
                this.ui.eyeInfo.hide();

                // XXX Sammuel86 Trailer UI Show FIX/HACK
                $('.trailer_mouse_catch')
                    .show().appendTo('div#video_player')
                    .mousemove(function (event) {
                        if (!_this.player.userActive()) {
                            _this.player.userActive(true);
                        }
                    })
                    .click(function (event) {
                        $('.vjs-play-control').click();
                        event.preventDefault();
                    })
                    .dblclick(function (event) {
                        _this.toggleFullscreen();
                        event.preventDefault();
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

            App.vent.on('customSubtitles:added', function (subpath) {
                _this.customSubtitles = {
                    subPath: subpath,
                    added_at: Date.now(),
                    timestamp: _this.player.time(),
                    modified: false
                };
                $('#video_player li:contains("' + i18n.__('Disabled') + '")').on('click', function () {
                    _this.customSubtitles = undefined;
                });
            });

            if (this.model.get('metadataCheckRequired')) {
                var matcher = this.model.get('title').split(/\s-\s/i);
                $('.verifmeta_poster').attr('src', this.model.get('poster'));
                $('.verifmeta_show').text(matcher[0]);
                if (this.model.get('episode')) {
                    $('.verifmeta_episode').text(matcher[2]);
                    $('.verifmeta_number').text(i18n.__('Season %s', this.model.get('season')) + ', ' + i18n.__('Episode %s', this.model.get('episode')));
                } else {
                    $('.verifmeta_episode').text(this.model.get('year'));
                }

                // display it
                $('.verify-metadata').show();
                $('.verify-metadata').appendTo('div#video_player');
                if (!_this.player.userActive()) {
                    _this.player.userActive(true);
                }
            }

            var checkAutoPlay = function () {
                if (_this.isMovie() === 'episode' && next_episode_model) {
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
                        $('.playing_next #nextCountdown').text(count);

                    } else {

                        if (autoplayisshown) {
                            win.info('Hiding Auto Play message');
                            $('.playing_next').hide();
                            $('.playing_next #nextCountdown').text('');
                            autoplayisshown = false;
                        }

                    }
                }
            };

            player.one('play', function () {
                if (_this.model.get('type') === 'video/youtube') {
                    // XXX quality fix
                    $('.vjs-quality-button .vjs-menu-content').remove();
                    $('.vjs-quality-button').css('cursor', 'default');

                    // XXX hide watermark
                    try {
                        document.getElementById('video_player_youtube_api').contentWindow.document.getElementsByClassName('html5-watermark')[0].style.opacity = 0;
                    } catch (e) {}
                }

                if (_this.model.get('auto_play')) {
                    if (_this.isMovie() === 'episode' && next_episode_model) {
                        // autoplay player div
                        var matcher = next_episode_model.get('title').split(/\s-\s/i);
                        $('.playing_next_poster').attr('src', _this.model.get('cover'));
                        $('.playing_next_show').text(matcher[0]);
                        $('.playing_next_episode').text(matcher[2]);
                        $('.playing_next_number').text(i18n.__('Season %s', next_episode_model.get('season')) + ', ' + i18n.__('Episode %s', next_episode_model.get('episode')));
                    }

                    _this._AutoPlayCheckTimer = setInterval(checkAutoPlay, 10 * 100 * 1); // every 1 sec
                }
            });

            player.on('loadeddata', function () {
                // resume position
                if (AdvSettings.get('lastWatchedTitle') === _this.model.get('title') && AdvSettings.get('lastWatchedTime') > 0) {
                    var position = AdvSettings.get('lastWatchedTime');
                    win.debug('Resuming position to', position.toFixed(), 'secs');
                    player.currentTime(position);
                } else if (AdvSettings.get('traktPlayback')) {
                    var type = _this.isMovie();
                    var id = type === 'movie' ? _this.model.get('imdb_id') : _this.model.get('episode_id');
                    App.Trakt.sync.playback(type, id).then(function (position_percent) {
                        var total = _this.video.duration();
                        var position = (position_percent / 100) * total | 0;
                        if (position > 0) {
                            win.debug('Resuming position to', position.toFixed(), 'secs (reported by Trakt)');
                            player.currentTime(position);
                        }
                    });
                }

                // alert Trakt
                _this.sendToTrakt('start');
            });

            player.on('play', function () {
                // Trigger a resize so the subtitles are adjusted
                $(window).trigger('resize');

                if (_this.wasSeek) {
                    if (_this.model.get('auto_play')) {
                        checkAutoPlay();
                    }
                    _this.wasSeek = false;
                } else {
                    if (firstPlay) {
                        if (_this.model.get('type') === 'video/youtube') {
                            try {
                                document.getElementById('video_player_youtube_api').contentWindow.document.getElementsByClassName('video-ads')[0].style.display = 'none'; // XXX hide ads hack
                            } catch (e) {} //no ads
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

                _this.sendToTrakt('start');
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
                    _this.sendToTrakt('pause');
                }
            });

            _this.bindKeyboardShortcuts();

            // There was an issue with the video
            player.on('error', function (error) {
                _this.sendToTrakt('stop');
                // TODO: user errors
                if (_this.model.get('type') === 'video/youtube') {
                    setTimeout(function () {
                        App.vent.trigger('player:close');
                    }, 2000);
                }
                win.error('video.js error code: ' + $('#video_player').get(0).player.error().code, $('#video_player').get(0).player.error());
            });

            $('.player-header-background').appendTo('div#video_player');

            $('#video_player li:contains("subtitles off")').text(i18n.__('Disabled'));
            $('#video_player li:contains("local")').text(i18n.__('Local'));

            if (this.model.get('defaultSubtitle') === 'local') {
                App.vent.trigger('customSubtitles:added', _this.model.get('subtitle').local);
            }

            if (AdvSettings.get('alwaysFullscreen') && !this.inFullscreen) {
                this.toggleFullscreen();
            }
            if (this.inFullscreen) {
                win.leaveFullscreen();
                this.toggleFullscreen();
            }

            this.player.volume(AdvSettings.get('playerVolume'));

            $('.vjs-menu-content, .eye-info-player, .playing_next, .verify_metadata').hover(function () {
                _this._ShowUIonHover = setInterval(function () {
                    App.PlayerView.player.userActive(true);
                }, 100);
            }, function () {
                clearInterval(_this._ShowUIonHover);
            });
        },

        sendToTrakt: function (method) {
            var type = _this.isMovie();
            var id = type === 'movie' ? _this.model.get('imdb_id') : _this.model.get('episode_id');
            var progress = _this.video.currentTime() / _this.video.duration() * 100 | 0;
            App.Trakt.scrobble(method, type, id, progress);
        },

        playNextNow: function () {
            this.dontTouchFS = true; //XXX(xaiki): hack, don't touch fs state

            this.closePlayer();

            if (next_episode_model) {
                App.vent.trigger('stream:start', next_episode_model);
            }
        },
        playNextNot: function () {
            win.info('Hiding Auto Play message');
            $('.playing_next').hide();
            $('.playing_next #nextCountdown').text('');
            autoplayisshown ? false : true;

            this.model.set('auto_play', false);
        },
        processNext: function () {
            var episodes = _this.model.get('episodes');

            if (_this.model.get('auto_id') !== episodes[episodes.length - 1]) {

                var auto_play_data = _this.model.get('auto_play_data');
                var current_quality = _this.model.get('quality');
                var tvdb = _this.model.get('tvdb_id');
                var idx;

                _.find(auto_play_data, function (data, dataIdx) {
                    if (data.id === _this.model.get('auto_id')) {
                        idx = dataIdx;
                        return true;
                    }
                });
                var next_episode = auto_play_data[idx + 1];

                next_episode.auto_play = true;
                next_episode.auto_id = parseInt(next_episode.season) * 100 + parseInt(next_episode.episode);
                next_episode.tvdb_id = tvdb;
                next_episode.auto_play_data = auto_play_data;
                next_episode.episodes = episodes;
                next_episode.quality = current_quality;

                if (next_episode.torrents[current_quality] !== undefined && next_episode.torrents[current_quality].url) {
                    next_episode.torrent = next_episode.torrents[current_quality].url;
                } else {
                    next_episode.torrent = next_episode.torrents[next_episode.torrents.constructor.length - 1].url; //select highest quality available if user selected not found
                }

                next_episode_model = new Backbone.Model(next_episode);
            }
        },

        remainingTime: function () {
            var timeLeft = this.model.get('time_left');

            if (timeLeft === undefined) {
                return i18n.__('Unknown time remaining');
            } else if (timeLeft > 3600) {
                return i18n.__n('%s hour remaining', '%s hours remaining', Math.round(timeLeft / 3600));
            } else if (timeLeft > 60) {
                return i18n.__n('%s minute remaining', '%s minutes remaining', Math.round(timeLeft / 60));
            } else if (timeLeft <= 60) {
                return i18n.__n('%s second remaining', '%s seconds remaining', timeLeft);
            }
        },

        verifyMetadata: function () {
            $('.verify-metadata').hide();
        },

        wrongMetadata: function () {
            $('.verify-metadata').hide();

            // stop trakt
            this.sendToTrakt('stop');

            // remove wrong metadata
            var title = path.basename(this.model.get('src'));
            this.model.set('imdb_id', false);
            this.model.set('cover', false);
            this.model.set('title', title);
            this.model.set('season', false);
            this.model.set('episode', false);
            this.model.set('tvdb_id', false);
            this.model.set('episode_id', false);
            this.model.set('metadataCheckRequired', false);
            $('.player-title').text(title);

            // remove subtitles
            var subs = this.model.get('subtitle');
            if (subs && subs.local) {
                var tmpLoc = subs.local;
                this.model.set('subtitle', {
                    local: tmpLoc
                });
            }

            var item;
            for (var i = $('.vjs-subtitles-button .vjs-menu-item').length - 1; i > 0; i--) {
                item = $('.vjs-subtitles-button .vjs-menu-item')[i];
                if (item.innerText !== i18n.__('Subtitles') && item.innerText !== i18n.__('Custom...') && item.innerText !== i18n.__('Disabled')) {
                    item.remove();
                }
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
                _this.nativeWindow = win;

                if (_this.nativeWindow.isFullscreen) {
                    _this.toggleFullscreen();
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

            // multimedia keys
            // Change when mousetrap can be extended
            $('body').bind('keydown', function (e) {
                if (e.keyCode === 179) {
                    $('.vjs-play-control').click();
                } else if (e.keyCode === 177) {
                    _this.seek(-10);
                } else if (e.keyCode === 176) {
                    _this.seek(10);
                } else if (e.keyCode === 178) {
                    _this.closePlayer();
                }
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

            // multimedia keys
            // Change when mousetrap can be extended
            $('body').unbind('keydown');

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
            App.vent.trigger('volumechange');
        },

        toggleMute: function () {
            this.player.muted(!this.player.muted());
        },

        toggleFullscreen: function () {
            $('.vjs-fullscreen-control').click();
        },

        toggleSubtitles: function () {},

        moveSubtitles: function (e) {
            AdvSettings.set('playerSubPosition', $('.vjs-text-track').css('top'));
        },

        displayStreamURL: function () {
            var clipboard = gui.Clipboard.get();
            clipboard.set($('#video_player video').attr('src'), 'text');
            this.displayOverlayMsg(i18n.__('URL of this stream was copied to the clipboard'));
        },

        adjustSubtitleOffset: function (s) {
            var o = this.player.options()['trackTimeOffset'];
            this.player.options()['trackTimeOffset'] = (o + s);
            this.displayOverlayMsg(i18n.__('Subtitles Offset') + ': ' + (-this.player.options()['trackTimeOffset'].toFixed(1)) + ' ' + i18n.__('secs'));
            if (this.customSubtitles) {
                this.customSubtitles.modified = true;
            }
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

        onDestroy: function () {
            if (this.model.get('type') === 'video/youtube') { // XXX Sammuel86 Trailer UI Show FIX/HACK -START
                $('.trailer_mouse_catch').remove();
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
            var vjsPlayer = document.getElementById('video_player');
            if (vjsPlayer) {
                videojs(vjsPlayer).dispose();
            }
        }

    });
    App.View.Player = Player;
})(window.App);
