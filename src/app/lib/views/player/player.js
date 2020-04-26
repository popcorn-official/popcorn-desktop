(function (App) {
    'use strict';

    var Player = Marionette.View.extend({
        template: '#player-tpl',
        className: 'player',
        player: null,

        ui: {
            eyeInfo: '.eye-info-player',
            downloadSpeed: '.download_speed_player',
            uploadSpeed: '.upload_speed_player',
            activePeers: '.active_peers_player',
            downloaded: '.downloaded_player',
            pause: 'fas .fa-pause',
            play: 'fas .fa-play'
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

        initialize: function () {
            this.listenTo(this.model, 'change:downloadSpeed', this.updateDownloadSpeed);
            this.listenTo(this.model, 'change:uploadSpeed', this.updateUploadSpeed);
            this.listenTo(this.model, 'change:active_peers', this.updateActivePeers);
            this.listenTo(this.model, 'change:downloaded', this.updateDownloaded);

            this.inFullscreen = win.isFullscreen;
            this.playerWasReady = false;

            this.remaining = false;
            this.createdRemaining = false;
            this.firstPlay = true;

            this.boundedMouseScroll = this.mouseScroll.bind(this);
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
                this.remaining = true;

                if (!this.createdRemaining) { //we create it
                    this.createdRemaining = true;
                    $('.details-info-player').append('<br><span class="remaining">' + this.remainingTime() + '</span>');
                } else { //we just update
                    $('.remaining').html(this.remainingTime());
                }
            } else {
                this.ui.downloaded.text(i18n.__('Done'));
                $('.vjs-load-progress').css('width', '100%');
                this.remaining = false;
            }

            if (!this.remaining && this.createdRemaining) {
                $('.remaining').remove();
                this.createdRemaining = false;
            }
        },

        uploadSubtitles: function () {
            // verify custom subtitles not modified
            if (Settings.opensubtitlesAutoUpload && this.customSubtitles && !this.customSubtitles.modified) {
                var real_elapsedTime = (Date.now() - this.customSubtitles.added_at) / 1000;
                var player_elapsedTime = this.video.currentTime() - this.customSubtitles.timestamp;
                var perc_elapsedTime = player_elapsedTime / this.video.duration();

                // verify was played long enough
                if (real_elapsedTime >= player_elapsedTime && perc_elapsedTime >= 0.6) {
                    var upload = {
                        subpath: this.customSubtitles.subPath,
                        path: this.model.get('videoFile'),
                        imdbid: this.model.get('imdb_id')
                    };

                    win.debug('OpenSubtitles - Uploading subtitles', upload);

                    var subtitleProvider = App.Config.getProviderForType('subtitle');
                    subtitleProvider.upload(upload).then(function (data) {
                        if (data.alreadyindb) {
                            win.debug('OpenSubtitles - Already in DB', data);
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
            if (this.video.currentTime() / this.video.duration() >= 0.8 && type !== undefined && this.model.get('metadataCheckRequired') !== false) {
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

            this.remaining = false;
            this.createdRemaining = false;
            this.firstPlay = true;

            App.vent.trigger('preload:stop');
            App.vent.trigger('stream:stop');

            var vjsPlayer = document.getElementById('video_player');
            if (vjsPlayer) {
                videojs(vjsPlayer).dispose();
            }

            this.destroy();
        },

        onPlayerEnded: function () {
            if (this.model.get('auto_play')) {
                this.playNextNow();
            } else {
                this.closePlayer();
            }
        },

        checkAutoPlay: function () {
            if (this.isMovie() === 'episode' && this.next_episode_model) {
                if ((this.video.duration() - this.video.currentTime()) < 60 && this.video.currentTime() > 30) {

                    if (!this.autoplayisshown) {
                        var playingNext = $('.playing_next');

                        if (!this.precachestarted) {
                            App.vent.trigger('preload:start', this.next_episode_model);
                            this.precachestarted = true;
                        }

                        win.info('Showing Auto Play message');
                        this.autoplayisshown = true;
                        playingNext.show();
                        playingNext.appendTo('div#video_player');
                        if (!this.player.userActive()) {
                            this.player.userActive(true);
                        }
                    }

                    var count = Math.round(this.video.duration() - this.video.currentTime());
                    $('.playing_next #nextCountdown').text(count);

                } else {

                    if (this.autoplayisshown) {
                        win.info('Hiding Auto Play message');
                        $('.playing_next').hide();
                        $('.playing_next #nextCountdown').text('');
                        this.autoplayisshown = false;
                    }

                }
            }
        },

        onPlayerFirstPlay: function () {
            if (this.model.get('type') === 'video/youtube') {
                // XXX quality fix
                $('.vjs-quality-button .vjs-menu-content').remove();
                $('.vjs-quality-button').css('cursor', 'default');

                // XXX hide watermark
                try {
                    document.getElementById('video_player_youtube_api').contentWindow.document.getElementsByClassName('html5-watermark')[0].style.opacity = 0;
                } catch (e) {}
            }

            if (this.model.get('auto_play')) {
                if (this.isMovie() === 'episode' && this.next_episode_model) {
                    // autoplay player div
                    var matcher = this.next_episode_model.get('title').split(/\s-\s/i);
                    $('.playing_next_poster').attr('src', this.model.get('cover'));
                    $('.playing_next_show').text(matcher[0]);
                    $('.playing_next_episode').text(matcher[2]);
                    $('.playing_next_number').text(i18n.__('Season %s', this.next_episode_model.get('season')) + ', ' + i18n.__('Episode %s', this.next_episode_model.get('episode')));
                }

                this._AutoPlayCheckTimer = setInterval(this.checkAutoPlay, 10 * 100 * 1); // every 1 sec
            }
        },

        onPlayerReady: function () {
            win.debug('Player - data loaded in %sms', (Date.now() - this.playerWasReady));

            // set volume
            this.player.volume(Settings.playerVolume);

            // resume position
            if (Settings.lastWatchedTitle === this.model.get('title') && Settings.lastWatchedTime > 0) {
                var position = Settings.lastWatchedTime;
                win.debug('Resuming position to', position.toFixed(), 'secs');
                this.player.currentTime(position);
            } else if (Settings.traktPlayback) {
                var type = this.isMovie();
                var id = type === 'movie' ? this.model.get('imdb_id') : this.model.get('episode_id');
                App.Trakt.getPlayback(type, id).then(function (position_percent) {
                    var total = this.video.duration();
                    var position = (position_percent / 100) * total | 0;
                    if (position > 0) {
                        win.debug('Resuming position to', position.toFixed(), 'secs (reported by Trakt)');
                        this.player.currentTime(position);
                    }
                }.bind(this));
            }

            // alert Trakt
            this.sendToTrakt('start');
        },

        onPlayerPlay: function () {
            // Trigger a resize so the subtitles are adjusted
            $(window).trigger('resize');

            if (this.wasSeek) {
                if (this.model.get('auto_play')) {
                    this.checkAutoPlay();
                }
                this.wasSeek = false;
            } else {
                if (this.firstPlay) {
                    if (this.model.get('type') === 'video/youtube') {
                        try {
                            document.getElementById('video_player_youtube_api').contentWindow.document.getElementsByClassName('video-ads')[0].style.display = 'none'; // XXX hide ads hack
                        } catch (e) {} //no ads
                    }
                    this.firstPlay = false;
                    return;
                }
                this.ui.pause.hide().dequeue();
                this.ui.play.appendTo('div#video_player');
                this.ui.play.show().delay(1500).queue(function () {
                    this.ui.play.hide().dequeue();
                }.bind(this));
                App.vent.trigger('player:play');
            }

            this.sendToTrakt('start');
        },

        onPlayerPause: function () {
            if (this.player.scrubbing) {
                this.wasSeek = true;
            } else {
                this.wasSeek = false;
                this.ui.play.hide().dequeue();
                this.ui.pause.appendTo('div#video_player');
                this.ui.pause.show().delay(1500).queue(function () {
                    this.ui.pause.hide().dequeue();
                }.bind(this));
                App.vent.trigger('player:pause');
                this.sendToTrakt('pause');
            }
        },

        onPlayerError: function (error) {
            this.sendToTrakt('stop');
            // TODO: user errors
            if (this.model.get('type') === 'video/youtube') {
                setTimeout(function () {
                    App.vent.trigger('player:close');
                }, 2000);
            }
            var videoPlayer = $('#video_player');

            win.error('video.js error code: ' + videoPlayer.get(0).player.error().code, videoPlayer.get(0).player.error());
        },

        metadataCheck: function () {
            if (this.model.get('metadataCheckRequired')) {
                var matcher = this.model.get('title').split(/\s-\s/i);
                $('.verifmeta_poster').attr('src', this.model.get('poster'));
                $('.verifmeta_show').html(matcher[0]);
                if (this.model.get('episode')) {
                    $('.verifmeta_episode').html(matcher[2]);
                    $('.verifmeta_number').text(i18n.__('Season %s', this.model.get('season')) + ', ' + i18n.__('Episode %s', this.model.get('episode')));
                } else {
                    $('.verifmeta_episode').text(this.model.get('year'));
                }
                var verifyMetadata = $('.verify-metadata');

                // display it
                verifyMetadata.show();
                verifyMetadata.appendTo('div#video_player');
                if (!this.player.userActive()) {
                    this.player.userActive(true);
                }
            }
        },

        onAttach: function () {
            $('#header').removeClass('header-shadow').hide();
            // Test to make sure we have title
            win.info('Watching:', this.model.get('title'));
            $('.filter-bar').show();
            $('#player_drag').show();
            var that = this;

            // Double Click to toggle Fullscreen
            $('#video_player').dblclick(function (event) {
                that.toggleFullscreen();
                // Stop any mouseup events pausing video
                event.preventDefault();
            });

            if (this.model.get('auto_play')) {

                this.precachestarted = false;
                this.autoplayisshown = false;
                this.next_episode_model = false;

                this.processNext();
            }

            // start videojs engine
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
                        if (!that.player.userActive()) {
                            that.player.userActive(true);
                        }
                    })
                    .click(function (event) {
                        $('.vjs-play-control').click();
                        event.preventDefault();
                    })
                    .dblclick(function (event) {
                        that.toggleFullscreen();
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
                }).ready(function () {
                    that.playerWasReady = Date.now();
                });
            }
            this.player = this.video.player();
            App.PlayerView = this;

            /* The following is a hack to make VideoJS listen to
             *  mouseup instead of mousedown for pause/play on the
             *  video element. Stops video pausing/playing when
             *  dragged. TODO: #fixit!
             */
            this.player.tech.off('mousedown');
            this.player.tech.on('mouseup', function (event) {
                if (event.target.origEvent) {
                    if (!event.target.origEvent.originalEvent.defaultPrevented) {
                        that.player.tech.onClick(event);
                    }
                    // clean up after ourselves
                    delete event.target.origEvent;
                } else {
                    that.player.tech.onClick(event);
                }
            });

            // Force custom controls
            this.player.usingNativeControls(false);

            // Local subtitle hack
            App.vent.on('customSubtitles:added', function (subpath) {
                that.customSubtitles = {
                    subPath: subpath,
                    added_at: Date.now(),
                    timestamp: that.video.currentTime(),
                    modified: false
                };
                $('#video_player li:contains("' + i18n.__('Disabled') + '")').on('click', function () {
                    that.customSubtitles = undefined;
                });
            });

            this.player.on('ended', this.onPlayerEnded.bind(this));
            this.player.one('play', this.onPlayerFirstPlay.bind(this));
            this.player.on('loadeddata', this.onPlayerReady.bind(this));
            this.player.on('play', this.onPlayerPlay.bind(this));
            this.player.on('pause', this.onPlayerPause.bind(this));
            this.player.on('error', this.onPlayerError.bind(this));

            this.bindKeyboardShortcuts();
            this.metadataCheck();

            $('.player-header-background').appendTo('div#video_player');

            $('#video_player li:contains("subtitles off")').text(i18n.__('Disabled'));
            $('#video_player li:contains("local")').text(i18n.__('Local'));

            if (this.model.get('defaultSubtitle') === 'local') {
                App.vent.trigger('customSubtitles:added', this.model.get('subtitle').local);
            }

            // set fullscreen state & previous state
            if (Settings.alwaysFullscreen && !this.inFullscreen) {
                this.toggleFullscreen();
            }
            if (this.inFullscreen) {
                win.leaveFullscreen();
                this.toggleFullscreen();
            }

            // don't hide controls when hovering following classes:
            $('.vjs-menu-content, .eye-info-player, .playing_next, .verify_metadata').hover(function () {
                that._ShowUIonHover = setInterval(function () {
                    that.player.userActive(true);
                }, 100);
            }, function () {
                clearInterval(that._ShowUIonHover);
            });
        },

        sendToTrakt: function (method) {
            if (!this.video) {
                return;
            }

            var type = this.isMovie();
            var id = type === 'movie' ? this.model.get('imdb_id') : this.model.get('episode_id');
            var progress = this.video.currentTime() / this.video.duration() * 100 | 0;
            App.Trakt.scrobble(method, type, id, progress);
        },

        playNextNow: function () {
            this.dontTouchFS = true; //XXX(xaiki): hack, don't touch fs state

            this.closePlayer();

            if (this.next_episode_model) {
                App.vent.trigger('stream:start', this.next_episode_model);
            }
        },
        playNextNot: function () {
            win.info('Hiding Auto Play message');
            $('.playing_next').hide();
            $('.playing_next #nextCountdown').text('');
            !this.autoplayisshown;

            this.model.set('auto_play', false);
        },
        processNext: function () {
            var episodes = this.model.get('episodes');

            if (this.model.get('auto_id') !== episodes[episodes.length - 1]) {

                var auto_play_data = this.model.get('auto_play_data');
                var current_quality = this.model.get('quality');
                var tvdb = this.model.get('tvdb_id');
                var auto_id = this.model.get('auto_id');
                var idx;

                _.find(auto_play_data, function (data, dataIdx) {
                    if (data.id === auto_id) {
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

                this.next_episode_model = new Backbone.Model(next_episode);
            }
        },

        remainingTime: function () {
            var timeLeft = this.model.get('time_left');

            if (timeLeft === undefined) {
                return i18n.__('Unknown time remaining');
            } else if (timeLeft > 3600) {
                return i18n.__('%s hour(s) remaining', Math.round(timeLeft / 3600));
            } else if (timeLeft > 60) {
                return i18n.__('%s minute(s) remaining', Math.round(timeLeft / 60));
            } else if (timeLeft <= 60) {
                return i18n.__('%s second(s) remaining', timeLeft);
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
            var that = this;

            // add ESC toggle when full screen, go back when not
            Mousetrap.bind('esc', function (e) {
                that.nativeWindow = win;

                if (that.nativeWindow.isFullscreen) {
                    that.toggleFullscreen();
                } else {
                    that.closePlayer();
                }
            });

            Mousetrap.bind('backspace', function (e) {
                that.closePlayer();
            });

            Mousetrap.bind(['f', 'F'], function (e) {
                that.toggleFullscreen();
            }, 'keydown');

            Mousetrap.bind('h', function (e) {
                that.adjustSubtitleOffset(-0.1);
            }, 'keydown');

            Mousetrap.bind('g', function (e) {
                that.adjustSubtitleOffset(0.1);
            }, 'keydown');

            Mousetrap.bind('shift+h', function (e) {
                that.adjustSubtitleOffset(-1);
            }, 'keydown');

            Mousetrap.bind('shift+g', function (e) {
                that.adjustSubtitleOffset(1);
            }, 'keydown');

            Mousetrap.bind('ctrl+h', function (e) {
                that.adjustSubtitleOffset(-5);
            }, 'keydown');

            Mousetrap.bind('ctrl+g', function (e) {
                that.adjustSubtitleOffset(5);
            }, 'keydown');

            Mousetrap.bind(['space', 'p'], function (e) {
                $('.vjs-play-control').click();
            }, 'keydown');

            Mousetrap.bind('right', function (e) {
                that.seek(5);
            });

            Mousetrap.bind('shift+right', function (e) {
                that.seek(60);
            });

            Mousetrap.bind('ctrl+right', function (e) {
                that.seek(600);
            });

            Mousetrap.bind('left', function (e) {
                that.seek(-5);
            });

            Mousetrap.bind('shift+left', function (e) {
                that.seek(-60);
            });

            Mousetrap.bind('ctrl+left', function (e) {
                that.seek(-600);
            });

            Mousetrap.bind('up', function (e) {
                that.adjustVolume(0.1);
            });

            Mousetrap.bind('shift+up', function (e) {
                that.adjustVolume(0.5);
            });

            Mousetrap.bind('ctrl+up', function (e) {
                that.adjustVolume(1);
            });

            Mousetrap.bind('down', function (e) {
                that.adjustVolume(-0.1);
            });

            Mousetrap.bind('shift+down', function (e) {
                that.adjustVolume(-0.5);
            });

            Mousetrap.bind('ctrl+down', function (e) {
                that.adjustVolume(-1);
            });

            Mousetrap.bind(['m', 'M'], function (e) {
                that.toggleMute();
            }, 'keydown');

            Mousetrap.bind(['u', 'U'], function (e) {
                that.displayStreamURL();
            }, 'keydown');

            Mousetrap.bind('j', function (e) {
                that.adjustPlaybackRate(-0.1, true);
            }, 'keydown');

            Mousetrap.bind(['k', 'shift+k', 'ctrl+k'], function (e) {
                that.adjustPlaybackRate(1.0, false);
            }, 'keydown');

            Mousetrap.bind(['l'], function (e) {
                that.adjustPlaybackRate(0.1, true);
            }, 'keydown');

            Mousetrap.bind(['shift+j', 'ctrl+j'], function (e) {
                that.adjustPlaybackRate(0.5, false);
            }, 'keydown');

            Mousetrap.bind('shift+l', function (e) {
                that.adjustPlaybackRate(2.0, false);
            }, 'keydown');

            Mousetrap.bind('ctrl+l', function (e) {
                that.adjustPlaybackRate(4.0, false);
            }, 'keydown');

            Mousetrap.bind('ctrl+d', function (e) {
                that.toggleMouseDebug();
            }, 'keydown');

            Mousetrap.bind('0', function (e) {
                that.scaleWindow(0.5);
            });

            Mousetrap.bind('1', function (e) {
                that.scaleWindow(1);
            });

            Mousetrap.bind('2', function (e) {
                that.scaleWindow(2);
            });

            // multimedia keys
            // Change when mousetrap can be extended
            $('body').bind('keydown', function (e) {
                if (e.keyCode === 179) {
                    $('.vjs-play-control').click();
                } else if (e.keyCode === 177) {
                    that.seek(-5);
                } else if (e.keyCode === 176) {
                    that.seek(5);
                } else if (e.keyCode === 178) {
                    that.closePlayer();
                }
            });

            document.addEventListener('mousewheel', this.boundedMouseScroll);
        },

        unbindKeyboardShortcuts: function () {

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

            document.removeEventListener('mousewheel', this.boundedMouseScroll);
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
                this.adjustVolume(0.1);
            } else { // Scroll down
                this.adjustVolume(-0.1);
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
            var clipboard = nw.Clipboard.get();
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
            var vjsOverlay = $('.vjs-overlay');

            if (vjsOverlay.length > 0) {
                vjsOverlay.text(message);
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

        onBeforeDestroy: function () {
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
