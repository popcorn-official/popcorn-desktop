(function (App) {
    'use strict';

    var _this;
    var Player = Marionette.View.extend({
        template: '#player-tpl',
        className: 'player',
        player: null,
        prevSub: null,
        wasFullscreen: false,
        wasMinimized: false,

        ui: {
            eyeInfo: '.eye-info-player',
            downloadSpeed: '.download_speed_player',
            uploadSpeed: '.upload_speed_player',
            activePeers: '.active_peers_player',
            downloaded: '.downloaded_player',
            downloadedPercent: '.downloadedPercent_player',
            pause: '#osd_pause',
            play: '#osd_play',
            minimizeIcon: '.minimize-icon',
            maximizeIcon: '.maximize-icon',
            maxPlayCtrlIcon: '#max_play_ctrl'
        },

        events: {
            'click .close-info-player': 'closePlayer',
            'click .playnownext': 'playNextNow',
            'click .playnownextNOT': 'playNextNot',
            'click .verifmetaTRUE': 'verifyMetadata',
            'click .verifmetaFALSE': 'wrongMetadata',
            'mousedown .vjs-subtitles-button': 'toggleSubtitles',
            'click .vjs-text-track': 'moveSubtitles',
            'mousedown .eye-info-player': 'filenametoclip',
            'mousedown .copytoclip': 'copytoclip',
            'click .minimize-icon': 'minDetails',
            'click .maximize-icon': 'minDetails',
            'click #max_play_ctrl': 'maxPlayCtrl',
            'click .vjs-play-control': 'togglePlay'
        },

        initialize: function () {
            _this = this;

            if ($('.loading .maximize-icon').is(':visible')) {
                this.wasMinimized = true;
            }

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

            this.zoom = 1.0;

            this.filters = {
                brightness: 1.0,
                contrast: 1.0,
                hue: 0,
                saturation: 1.0,
            };

            //If a child was added above this view
            App.vent.on('viewstack:push', function() {
                if (_.last(App.ViewStack) !== 'app-overlay') {
                    _this.unbindKeyboardShortcuts();
                    if (win.isFullscreen) {
                        $('.player .video-js').hide();
                        this.wasFullscreen = true;
                    }
                }
            });

            //If a child was removed from above this view
            App.vent.on('viewstack:pop', function() {
                if (_.last(App.ViewStack) === 'app-overlay') {
                    _this.bindKeyboardShortcuts();
                    if (this.wasFullscreen) {
                        $('.player .video-js').removeAttr('style');
                        this.wasFullscreen = false;
                    }
                }
            });
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

        minDetails: function () {
            if (this.ui.minimizeIcon.is(':visible')) {
                if (win.isFullscreen) {
                    this.toggleFullscreen();
                    this.wasFullscreen = true;
                }
                $('.player').css({'height': '0', 'width': '0'});
                $('.player .video-js').css('display', 'none');
                $('#content').show();
                if ($('#movie-detail') !== undefined) {
                    $('#movie-detail').show();
                }
                $('#player_drag').hide();
                $('#header').show();
                this.ui.minimizeIcon.hide();
                this.ui.maximizeIcon.show();
                this.unbindKeyboardShortcuts();
                Mousetrap.bind(['esc', 'backspace'], function (e) {
                    App.vent.trigger('show:closeDetail');
                    App.vent.trigger('movie:closeDetail');
                });
            } else {
                $('.player, .player .video-js').removeAttr('style');
                $('#content').hide();
                if ($('#movie-detail') !== undefined) {
                    $('#movie-detail').hide();
                }
                $('#player_drag').show();
                $('#header').removeClass('header-shadow').hide();
                this.ui.maximizeIcon.hide();
                this.ui.minimizeIcon.show();
                if (this.wasFullscreen) {
                    this.toggleFullscreen();
                    this.wasFullscreen = false;
                }
                this.bindKeyboardShortcuts();
            }
        },

        maxPlayCtrl: function (e) {
            e.preventDefault();
            e.stopPropagation();
            $('.vjs-play-control').click();
        },

        updateDownloaded: function () {
            if (this.model.get('downloadedPercent').toFixed(0) < 100 || this.model.get('size') === 0) {
                if (this.model.get('size') !== 0) {
                    this.ui.downloaded.html(this.model.get('downloadedPercent').toFixed(0) + '%&nbsp;&nbsp;&nbsp;(' + this.model.get('downloadedFormatted') + ' / ' + Common.fileSize(this.model.get('size')) + ')');
                    this.ui.downloadedPercent.html(this.model.get('downloadedPercent').toFixed(0) + '%');
                } else {
                    this.ui.downloaded.html('(' + this.model.get('downloadedFormatted') + ' / ' + i18n.__('Unknown') + ')');
                    this.ui.downloadedPercent.html(i18n.__('Unknown') + ' %');
                }

                $('.vjs-load-progress').css('width', this.model.get('downloadedPercent').toFixed(0) + '%');
                this.remaining = true;

                if (!this.createdRemaining) { //we create it
                    this.createdRemaining = true;
                    $('.details-info-player #dwnloading').append('<br><span class="remaining">' + this.remainingTime() + '</span>');
                } else { //we just update
                    $('.remaining').html(this.remainingTime());
                }
            } else {
                $('.details-info-player #sstatel').text(i18n.__('Downloaded'));
                this.ui.downloaded.html(this.model.get('downloadedPercent').toFixed(0) + '%&nbsp;&nbsp;&nbsp;(' + Common.fileSize(this.model.get('size')) + ')<br>');
                this.ui.downloadedPercent.html(this.model.get('downloadedPercent').toFixed(0) + '%');
                $('.details-info-player #dloaddd, .download_speed_player, .details-info-player #apeersss, .active_peers_player, .maximize-icon #maxdllb').hide();
                $('.vjs-load-progress').css('width', '100%');
                this.ui.maximizeIcon.addClass('done');
                this.remaining = false;
            }

            if (!this.remaining && this.createdRemaining) {
                $('.remaining').remove();
                this.createdRemaining = false;
            }
        },

        closePlayer: function () {
            win.info('Player closed');
            $('head > title').text('Popcorn-Time');
            if (this._AutoPlayCheckTimer) {
                clearInterval(this._AutoPlayCheckTimer);
            }
            if (this._ShowUIonHover) {
                clearInterval(this._ShowUIonHover);
            }

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
            if (this.model.get('torrentModel') && this.model.get('torrentModel').get('auto_play')) {
                this.playNextNow();
            } else {
                this.closePlayer();
            }
        },

        checkAutoPlay: function () {
            if (this.isMovie() === 'episode' && this.next_episode_model) {
                if ((!Settings.preloadNextEpisodeTime || (this.video.duration() - this.video.currentTime() < Settings.preloadNextEpisodeTime * 60)) && this.video.currentTime() > 30) {
                    if (!this.autoplayisshown) {
                        if (Settings.preloadNextEpisodeTime && !this.precachestarted) {
                            App.vent.trigger('stream:start', this.next_episode_model, 'preload');
                            this.precachestarted = true;
                        }
                        if ((this.video.duration() - this.video.currentTime()) < 60) {
                            var playingNext = $('.playing_next');
                            this.autoplayisshown = true;
                            playingNext.show();
                            playingNext.appendTo('div#video_player');
                            if (!this.player.userActive()) {
                                this.player.userActive(true);
                            }
                        }
                    }
                    var count = Math.round(this.video.duration() - this.video.currentTime());
                    $('.playing_next #nextCountdown').text(count);
                } else {
                    if (this.autoplayisshown) {
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
                    document.getElementById('video_player_youtube_api').contentWindow.document.getElementsByClassName('ytp-chrome-top ytp-show-cards-title')[0].style.opacity = 0;
                    document.getElementById('video_player_youtube_api').contentWindow.document.getElementsByClassName('ytp-gradient-top')[0].style.opacity = 0;
                    setTimeout(function() { try { document.getElementById('video_player_youtube_api').contentWindow.document.getElementsByClassName('ytp-watermark yt-uix-sessionlink')[0].style.opacity = 0; } catch (e) {}}, 3000);
                    document.getElementById('video_player_youtube_api').contentWindow.document.getElementsByClassName('ytp-pause-overlay')[0].style.opacity = 0;
                    document.getElementById('video_player_youtube_api').contentWindow.document.getElementsByClassName('html5-watermark')[0].style.opacity = 0;
                } catch (e) {}
            }

            if (this.model.get('torrentModel') && this.model.get('torrentModel').get('auto_play')) {
                if (this.isMovie() === 'episode' && this.next_episode_model) {
                    // autoplay player div
                    var matcher = this.next_episode_model.get('title').split(/\s-\s/i);
                    $('.playing_next_poster').attr('src', this.model.get('cover'));
                    $('.playing_next_show').text(matcher[0]);
                    $('.playing_next_episode').text(matcher[2]);
                    $('.playing_next_number').text(i18n.__('Season %s', this.next_episode_model.get('season')) + ', ' + i18n.__('Episode %s', this.next_episode_model.get('episode')));
                }

                this._AutoPlayCheckTimer = setInterval(this.checkAutoPlay.bind(this), 10 * 100 * 1); // every 1 sec
            }
        },

        filenametoclip: function (e) {
            var clipboard = nw.Clipboard.get();
            if (e.button === 0) {
                clipboard.set(this.model.get('filename'), 'text');
                $('.notification_alert').text(i18n.__('The filename was copied to the clipboard')).fadeIn('fast').delay(2500).fadeOut('fast');
            } else if (e.button === 2) {
                clipboard.set(this.model.get('src').replace('127.0.0.1', Settings.ipAddress), 'text');
                $('.notification_alert').text(i18n.__('The stream url was copied to the clipboard')).fadeIn('fast').delay(2500).fadeOut('fast');
            }
        },

        copytoclip: (e) => Common.openOrClipboardLink(e, e.target.textContent.replace(' - Trailer', ''), i18n.__($(e.target).data('copy')), true),

        onPlayerReady: function () {
            // set volume
            this.player.volume(Settings.playerVolume);

            // resume position
            if (Settings.lastWatchedTitle === this.model.get('title') && Settings.lastWatchedTime > 0) {
                var position = Settings.lastWatchedTime;
                win.info('Resuming position to', position.toFixed(), 'secs');
                this.player.currentTime(position);
            } else if (Settings.traktPlayback) {
                var type = this.isMovie();
                var id = type === 'movie' ? this.model.get('imdb_id') : this.model.get('episode_id');
                App.Trakt.getPlayback(type, id).then(function (position_percent) {
                    var total = this.video.duration();
                    var position = (position_percent / 100) * total | 0;
                    if (position > 0) {
                        win.info('Resuming position to', position.toFixed(), 'secs (reported by Trakt)');
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
                if (this.model.get('torrentModel') && this.model.get('torrentModel').get('auto_play')) {
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
                this.ui.pause.hide().dequeue().css('transform', 'scale(1)');
                this.ui.play.appendTo('div#video_player');
                this.ui.play.show().delay(50).queue(function () {
                    this.ui.play.css('transform', 'scale(1.8)').fadeOut(400).dequeue();
                }.bind(this));
                this.ui.maxPlayCtrlIcon.removeClass('fa-play').addClass('fa-pause');
                App.vent.trigger('player:play');
            }

            this.sendToTrakt('start');
        },

        onPlayerPause: function () {
            if (this.player.scrubbing) {
                this.wasSeek = true;
            } else {
                this.wasSeek = false;
                try { this.ui.play.hide().dequeue().css('transform', 'scale(1)'); } catch (error) {}
                try { this.ui.pause.appendTo('div#video_player'); } catch (error) {}
                try { this.ui.pause.show().delay(50).queue(function () {
                    this.ui.pause.css('transform', 'scale(1.8)').fadeOut(400).dequeue();
                }.bind(this)); } catch (error) {}
                try { this.ui.maxPlayCtrlIcon.removeClass('fa-pause').addClass('fa-play'); } catch (error) {}
                App.vent.trigger('player:pause');
                this.sendToTrakt('pause');
            }
        },

        onPlayerError: function (error) {
            this.sendToTrakt('stop');
            if (this.model.get('type') === 'video/youtube') {
                $('.vjs-error-display').hide();
                var msCatch = document.getElementsByClassName('trailer_mouse_catch')[0];
                msCatch.style.cursor = 'pointer';
                msCatch.onmouseup = function (e) { Common.openOrClipboardLink(e, _this.model.get('src'), i18n.__('link')); };
                msCatch.onclick = function () { _this.closePlayer(); };
            }
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

            $('.button:not(#download-torrent), .show-details .sdo-watch, .sdow-watchnow, .show-details #download-torrent, .file-item, .file-item a, .result-item, .collection-paste, .collection-import, .seedbox .item-play, #torrent-list .item-row, #torrent-show-list .item-row').addClass('disabled');
            $('#watch-now, #watch-trailer, .playerchoice, .file-item, .file-item a, .result-item, .result-item > *:not(.item-icon), .seedbox .item-play, #torrent-list .item-play, #torrent-show-list .item-play').prop('disabled', true);

            // Double Click to toggle Fullscreen
            $('#video_player, .state-info-player').dblclick(function (event) {
                that.toggleFullscreen();
                // Stop any mouseup events pausing video
                event.preventDefault();
            });

            if (this.model.get('torrentModel') && this.model.get('torrentModel').get('auto_play')) {
                this.precachestarted = false;
                this.autoplayisshown = false;
                this.next_episode_model = false;

                this.processNext();
            }

            if (this.model.get('localFile')) {
                this.model.set({downloaded: this.model.get('size'), downloadedPercent: 100});
            }

            this.$('.tooltipped').tooltip({
                html: true,
                delay: {
                    'show': 800,
                    'hide': 0
                }
            });

            // start videojs engine
            if (this.model.get('type') === 'video/youtube') {

                this.video = videojs('video_player', {
                    techOrder: ['youtube'],
                    forceSSL: true,
                    ytcontrols: false,
                    quality: '720p'
                }).ready(function () {
                    that.player && that.player.cache_ && that.player.cache_.volume ? that.player.volume(Settings.playerVolume) : null;
                    this.addClass('vjs-has-started');
                });
                this.ui.eyeInfo.hide();
                $('.maximize-icon #maxdllb').hide();
                $('.player-title, .player .maximize-icon .title').text(this.model.get('title') + ' - Trailer');

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
                $('head > title').text(this.model.get('title') + ' - Popcorn-Time' );
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
                var currentTime = 0;
                try { currentTime = that.video.currentTime(); } catch (error) {};
                that.customSubtitles = {
                    subPath: subpath,
                    added_at: Date.now(),
                    timestamp: currentTime,
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

            this.metadataCheck();

            $('.player-header-background').appendTo('div#video_player');

            $('#video_player li:contains("subtitles off")').text(i18n.__('Disabled'));
            $('#video_player li:contains("local")').text(i18n.__('Local'));

            if (this.model.get('defaultSubtitle') === 'local') {
                App.vent.trigger('customSubtitles:added', this.model.get('subtitle').local);
            }

            // set fullscreen state & previous state
            if (Settings.alwaysFullscreen && !this.inFullscreen) {
                if (this.wasMinimized) {
                    this.wasFullscreen = true;
                } else {
                    this.toggleFullscreen();
                }
            }
            if (this.inFullscreen) {
                win.leaveFullscreen();
                this.toggleFullscreen();
            }
            if (this.wasMinimized) {
                $('.player').css({'height': '0', 'width': '0'});
                $('.player .video-js').css('display', 'none');
                $('#player_drag').hide();
                $('#header').show();
                this.ui.minimizeIcon.hide();
                this.ui.maximizeIcon.show();
                this.unbindKeyboardShortcuts();
                Mousetrap.bind(['esc', 'backspace'], function (e) {
                    App.vent.trigger('show:closeDetail');
                    App.vent.trigger('movie:closeDetail');
                });
            } else {
                this.bindKeyboardShortcuts();
            }

            Mousetrap.bind('ctrl+v', function (e) {
                e.preventDefault();
            });

            // don't hide controls when hovering following classes:
            $('.vjs-menu-content, .eye-info-player, .playing_next, .verify_metadata').hover(function () {
                that._ShowUIonHover = setInterval(function () {
                    that.player.userActive(true);
                }, 100);
            }, function () {
                clearInterval(that._ShowUIonHover);
            });
            for(let i = 0; i < $('.vjs-menu-item').length; i++) {
                let curSub = $('.vjs-menu-item')[i];
                if (!curSub.innerHTML.includes(i18n.__('Disabled'))) {
                    curSub.onclick = function() {
                        that.prevSub = this;
                    };
                }
            }
            this.prevSub = this.model.get('defaultSubtitle') === 'none' && Settings.subtitle_language !== 'none' ? $('.vjs-menu-item:contains("' + App.Localization.langcodes[Settings.subtitle_language].nativeName +'")')[0] || $('.vjs-selected')[0] : $('.vjs-selected')[0];
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
            $('.playing_next').hide();
            $('.playing_next #nextCountdown').text('');
            !this.autoplayisshown;

            this.model.get('torrentModel').set('auto_play', false);
        },
        processNext: function () {
            var torrentModel = this.model.get('torrentModel');
            var episodes = torrentModel.get('episodes');

            if (torrentModel.get('auto_id') !== episodes[episodes.length - 1]) {

                var auto_play_data = torrentModel.get('auto_play_data');
                var current_quality = torrentModel.get('quality');
                var tvdb = torrentModel.get('tvdb_id');
                var auto_id = torrentModel.get('auto_id');
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
                    next_episode.file_name = next_episode.torrents[current_quality].file || '';
                } else {
                    next_episode.torrent = next_episode.torrents[next_episode.torrents.constructor.length - 1].url; //select highest quality available if user selected not found
                    next_episode.file_name = next_episode.torrents[next_episode.torrents.constructor.length - 1].file || '';
                }

                this.next_episode_model = new Backbone.Model(next_episode);
            }
        },

        remainingTime: function () {
            var timeLeft = this.model.get('time_left');

            if (timeLeft === undefined || this.model.get('size') === 0) {
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
            var title = this.model.get('filename') || path.basename(this.model.get('src'));
            this.model.set('imdb_id', false);
            this.model.set('cover', false);
            this.model.set('title', title);
            this.model.set('season', false);
            this.model.set('episode', false);
            this.model.set('tvdb_id', false);
            this.model.set('episode_id', false);
            this.model.set('metadataCheckRequired', false);
            $('.player-title, .player .maximize-icon .title').text(title);

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
                if (item.innerText !== i18n.__('Subtitles') && item.innerText !== i18n.__('Custom...') && item.innerText !== i18n.__('Disabled') && item.innerText !== i18n.__('Local')) {
                    if (item.classList.contains('vjs-selected')) {
                        this.prevSub = $('.vjs-subtitles-button .vjs-menu-item')[0];
                        this.prevSub.click();
                    }
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

        adjustZoom: function (difference) {
            var v = $('video')[0];
            this.zoom += difference;
            if (this.zoom < 0) {
                this.zoom = 0;
            }
            v.style.transform = this.zoom === 1 ? '' : `scale(${this.zoom})`;
            this.displayOverlayMsg(i18n.__('Zoom') + ': ' + (this.zoom * 100).toFixed(0) + '%');
            $('.vjs-overlay').css('opacity', '1');
        },

        adjustBrightness: function (difference) {
            this.filters.brightness += difference;
            if (this.filters.brightness < 0) {
                this.filters.brightness = 0;
            }
            this.applyFilters();
            this.displayOverlayMsg(i18n.__('Brightness') + ': ' + (this.filters.brightness * 100).toFixed(0) + '%');
            $('.vjs-overlay').css('opacity', '1');
        },

        adjustContrast: function (difference) {
            this.filters.contrast += difference;
            if (this.filters.contrast < 0) {
                this.filters.contrast = 0;
            }
            this.applyFilters();
            this.displayOverlayMsg(i18n.__('Contrast') + ': ' + (this.filters.contrast * 100).toFixed(0) + '%');
            $('.vjs-overlay').css('opacity', '1');
        },

        adjustHue: function (difference) {
            this.filters.hue += difference;
            if (this.filters.hue < -180) {
                this.filters.hue += 360;
            } else if (this.filters.hue > 180) {
                this.filters.hue -= 360;
            }
            this.applyFilters();
            this.displayOverlayMsg(i18n.__('Hue') + ': ' + this.filters.hue.toFixed(0));
            $('.vjs-overlay').css('opacity', '1');
        },

        adjustSaturation: function (difference) {
            this.filters.saturation += difference;
            if (this.filters.saturation < 0) {
                this.filters.saturation = 0;
            }
            this.applyFilters();
            this.displayOverlayMsg(i18n.__('Saturation') + ': ' + (this.filters.saturation * 100).toFixed(0) + '%');
            $('.vjs-overlay').css('opacity', '1');
        },

        applyFilters: function (difference) {
            const { brightness, contrast, hue, saturation } = this.filters;
            var curVideo = $('#video_player_html5_api');
            // On some devices, the image turns orange if both hue-rotate() and saturate() are used!
            // So we only add the hue-rotate() filter if requested by the user.
            const hueAdjustment = hue === 0 ? '' : `hue-rotate(${hue}deg)`;
            // By default, increasing brightness in HTML5 also visually increases saturation and contrast
            // To match other players, we reduce contrast and saturation, to keep the other filters steady
            const deltaB = brightness - 1.0;
            const finalContrast = contrast - deltaB * 0.333;
            const finalSaturation = saturation - deltaB * 0.5;
            curVideo[0].style.filter = `brightness(${brightness}) contrast(${finalContrast}) ${hueAdjustment} saturate(${finalSaturation})`;
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

            Mousetrap.bind(['c', 'C'], function (e) {
                that.toggleCrop();
            }, 'keydown');

            Mousetrap.bind(['v', 'V'], function (e) {
                that.subtitlesOnOff();
            }, 'keydown');

            Mousetrap.bind(['f', 'F'], function (e) {
                that.toggleFullscreen();
            }, 'keydown');

            Mousetrap.bind('h', function (e) {
                that.adjustSubtitleOffset(-0.1);
            }, 'keydown');

            Mousetrap.bind('g', function (e) {
                that.adjustSubtitleOffset(0.1);
            }, 'keydown');

            Mousetrap.bind('ctrl', function (e) {
                if (!e.repeat) {
                    $('.vjs-text-track').css('pointer-events', 'auto');
                }
            }, 'keydown');

            Mousetrap.bind('ctrl', function (e) {
                $('.vjs-text-track').css('pointer-events', 'none');
            }, 'keyup');

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

            Mousetrap.bind('w', function (e) {
                that.adjustZoom(-0.05);
            }, 'keydown');

            Mousetrap.bind('e', function (e) {
                that.adjustZoom(+0.05);
            }, 'keydown');

            Mousetrap.bind('shift+1', function (e) {
                that.adjustContrast(-0.05);
            }, 'keydown');

            Mousetrap.bind('shift+2', function (e) {
                that.adjustContrast(+0.05);
            }, 'keydown');

            Mousetrap.bind('shift+3', function (e) {
                that.adjustBrightness(-0.05);
            }, 'keydown');

            Mousetrap.bind('shift+4', function (e) {
                that.adjustBrightness(+0.05);
            }, 'keydown');

            Mousetrap.bind('shift+5', function (e) {
                that.adjustHue(-1);
            }, 'keydown');

            Mousetrap.bind('shift+6', function (e) {
                that.adjustHue(+1);
            }, 'keydown');

            Mousetrap.bind('shift+7', function (e) {
                that.adjustSaturation(-0.05);
            }, 'keydown');

            Mousetrap.bind('shift+8', function (e) {
                that.adjustSaturation(+0.05);
            }, 'keydown');

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

            Mousetrap.unbind(['c', 'C']);

            Mousetrap.unbind(['v', 'V']);

            Mousetrap.unbind(['f', 'F']);

            Mousetrap.unbind('h');

            Mousetrap.unbind('g');

            Mousetrap.unbind('ctrl');

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

            Mousetrap.unbind(['j', 'shift+j', 'ctrl+j']);

            Mousetrap.unbind(['k', 'shift+k', 'ctrl+k']);

            Mousetrap.unbind(['l', 'shift+l', 'ctrl+l']);

            Mousetrap.unbind('ctrl+d');

            Mousetrap.unbind('0');

            Mousetrap.unbind('1');

            Mousetrap.unbind('2');

            Mousetrap.unbind('w');

            Mousetrap.unbind('e');

            Mousetrap.unbind('shift+1');

            Mousetrap.unbind('shift+2');

            Mousetrap.unbind('shift+3');

            Mousetrap.unbind('shift+4');

            Mousetrap.unbind('shift+5');

            Mousetrap.unbind('shift+6');

            Mousetrap.unbind('shift+7');

            Mousetrap.unbind('shift+8');

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
            if ((_.last(App.ViewStack) !== 'app-overlay' && _.last(App.ViewStack) !== 'player') || $(e.target).parents('.vjs-subtitles-button').length) {
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
            this.player.volume((v + i).toFixed(1));
            var v2 = this.player.volume();
            if (v - v2 > 0.105 && v - v2 < 0.205) {
                this.player.volume((v2 + 0.1).toFixed(1));
            } else if (v - v2 < -0.105 && v - v2 > -0.205) {
                this.player.volume((v2 - 0.1).toFixed(1));
            }
            App.vent.trigger('volumechange');
        },

        toggleMute: function () {
            this.player.muted(!this.player.muted());
        },

        toggleCrop: function () {
            var curVideo = $('#video_player_html5_api');
            if (curVideo[0]) {
                var multPer = ((curVideo[0].videoWidth / curVideo[0].videoHeight) / (screen.width / screen.height))*100;
                if (curVideo.width() > $('#video_player').width() || curVideo.height() > $('#video_player').height()) {
                    curVideo.removeAttr('style');
                    this.displayOverlayMsg(i18n.__('Original'));
                } else if (multPer > 100) {
                    curVideo.css({'width': multPer + '%', 'left': 50-multPer/2 + '%', 'border': 'none'});
                    this.displayOverlayMsg(i18n.__('Fit screen'));
                } else if (multPer < 100) {
                    curVideo.css({'height': 10000/multPer + '%', 'top': 50-5000/multPer + '%', 'border': 'none'});
                    this.displayOverlayMsg(i18n.__('Fit screen'));
                } else {
                    this.displayOverlayMsg(i18n.__('Video already fits screen'));
                }
                $('.vjs-overlay').css('opacity', '1');
            }
        },

        subtitlesOnOff: function () {
            $('.vjs-selected')[0].innerHTML.includes(i18n.__('Disabled')) ? this.prevSub.click() : $('.vjs-menu-item')[0].click();
            this.displayOverlayMsg(i18n.__('Subtitles') + ': ' + i18n.__($('.vjs-selected')[0].innerHTML));
            $('.vjs-overlay').css('opacity', '1');
        },

        toggleFullscreen: function () {
            $('.vjs-fullscreen-control').click();
        },

        toggleSubtitles: function (e) {
            if (e.button === 2) {
                nw.Shell.openExternal('https://www.opensubtitles.org/search/' + (this.model.get('imdb_id') ? this.model.get('imdb_id').replace('tt', 'imdbid-') : ''));
            }
        },

        moveSubtitles: function (e) {
            AdvSettings.set('playerSubPosition', $('.vjs-text-track').css('top'));
        },

        adjustSubtitleOffset: function (s) {
            var o = this.player.options()['trackTimeOffset'];
            this.player.options()['trackTimeOffset'] = (o + s);
            this.displayOverlayMsg(i18n.__('Subtitles Offset') + ': ' + (-this.player.options()['trackTimeOffset'].toFixed(1)) + ' ' + i18n.__('secs'));
            if (this.customSubtitles) {
                this.customSubtitles.modified = true;
            }
            $('.vjs-overlay').css('opacity', '1');
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
            $('.vjs-overlay').css('opacity', '1');
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
                }, 1200));
            } else {
                $(this.player.el()).append('<div class =\'vjs-overlay vjs-overlay-top-left\'>' + message + '</div>');
                $.data(this, 'overlayTimer', setTimeout(function () {
                    $('.vjs-overlay').fadeOut('normal', function () {
                        $(this).remove();
                    });
                }, 1200));
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
            $('.button, #watch-now, .show-details .sdo-watch, .sdow-watchnow, .playerchoice, .file-item, .file-item a, .result-item, .result-item > *:not(.item-icon), .trash-torrent, .collection-paste, .collection-import, .seedbox .item-play, .seedbox .exit-when-done, #torrent-list .item-row, #torrent-show-list .item-row, #torrent-list .item-play, #torrent-show-list .item-play').removeClass('disabled').removeProp('disabled');
            this.unbindKeyboardShortcuts();
            Mousetrap.bind('ctrl+v', function (e) {
            });
            App.vent.trigger('player:close');
            var vjsPlayer = document.getElementById('video_player');
            if (vjsPlayer) {
                videojs(vjsPlayer).dispose();
            }
        }

    });
    App.View.Player = Player;
})(window.App);
