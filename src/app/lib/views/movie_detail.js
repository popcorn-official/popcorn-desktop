(function (App) {
    'use strict';
    // Torrent Health
    var torrentHealth = require('webtorrent-health'),
    cancelTorrentHealth = function () {},
    torrentHealthRestarted = null;

    App.View.MovieDetail = Backbone.Marionette.ItemView.extend({
        template: '#movie-detail-tpl',
        className: 'movie-detail',

        ui: {
            selected_lang: '.selected-lang',
            bookmarkIcon: '.favourites-toggle',
            watchedIcon: '.watched-toggle'
        },

        events: {
            'click #watch-now': 'startStreaming',
            'click #watch-trailer': 'playTrailer',
            'click .close-icon': 'closeDetails',
            'click #switch-hd-on': 'enableHD',
            'click #switch-hd-off': 'disableHD',
            'click .favourites-toggle': 'toggleFavourite',
            'click .watched-toggle': 'toggleWatched',
            'click .movie-imdb-link': 'openIMDb',
            'mousedown .magnet-link': 'openMagnet',
            'click .playerchoicemenu li a': 'selectPlayer',
            'click .rating-container': 'switchRating',
            'click .health-icon': 'resetHealth'
        },

        initialize: function () {
            var _this = this;

            //Handle keyboard shortcuts when other views are appended or removed

            //If a child was removed from above this view
            App.vent.on('viewstack:pop', function () {
                if (_.last(App.ViewStack) === _this.className) {
                    _this.initKeyboardShortcuts();
                }
            });

            //If a child was added above this view
            App.vent.on('viewstack:push', function () {
                if (_.last(App.ViewStack) !== _this.className) {
                    _this.unbindKeyboardShortcuts();
                }
            });

            App.vent.on('shortcuts:movies', _this.initKeyboardShortcuts);

            this.model.on('change:quality', this.resetHealth(), this);
        },

        onShow: function () {
            win.info('Show movie detail (' + this.model.get('imdb_id') + ')');
            var self = this;
            this.handleAnime();

            var torrents = this.model.get('torrents');
            if (torrents['720p'] !== undefined && torrents['1080p'] !== undefined) {
                this.model.set('quality', Settings.movies_default_quality);
            } else if (torrents['1080p'] !== undefined) {
                this.model.set('quality', '1080p');
            } else if (torrents['720p'] !== undefined) {
                this.model.set('quality', '720p');
            } else if (torrents['480p'] !== undefined) {
                this.model.set('quality', '480p');
            } else if (torrents['HDRip'] !== undefined) {
                this.model.set('quality', 'HDRip');
            }

            if (Settings.movies_default_quality === '720p' && torrents['720p'] !== undefined && document.getElementsByName('switch')[0] !== undefined) {
                document.getElementsByName('switch')[0].checked = true;
            }

            if (!this.model.get('trailer')) {
                $('#watch-trailer').hide();
            }

            this.getTorrentHealth();

            $('.star-container,.movie-imdb-link,.q720,input,.magnet-link').tooltip({
                html: true
            });

            App.MovieDetailView = this;

            var backgroundUrl = $('.backdrop').attr('data-bgr');

            var bgCache = new Image();
            bgCache.src = backgroundUrl;
            bgCache.onload = function () {
                $('.backdrop').css('background-image', 'url(' + backgroundUrl + ')').addClass('fadein');
                bgCache = null;
            };
            bgCache.onerror = function () {
                $('.backdrop').css('background-image', 'url(images/bg-header.jpg)').addClass('fadein');
                bgCache = null;
            };

            var coverUrl = $('.mcover-image').attr('data-cover');

            var coverCache = new Image();
            coverCache.src = coverUrl;
            coverCache.onload = function () {
                $('.mcover-image').attr('src', coverUrl).addClass('fadein');
                coverCache = null;
            };
            coverCache.onerror = function () {
                $('.mcover-image').attr('src', self.model.get('image')).addClass('fadein');
                coverCache = null;
            };

            // switch to default subtitle
            this.switchSubtitle(Settings.subtitle_language);

            // Bookmarked / not bookmarked
            if (this.model.get('bookmarked') === true) {
                this.ui.bookmarkIcon.addClass('selected').text(i18n.__('Remove from bookmarks'));
            }

            // Seen / Unseen
            if (this.model.get('watched') === true) {
                this.ui.watchedIcon.addClass('selected').text(i18n.__('Seen'));
            }
            var _this = this;
            this.ui.watchedIcon.hover(function () {
                if (_this.model.get('watched')) {
                    _this.ui.watchedIcon.text(i18n.__('Mark as unseen'));
                } else {
                    _this.ui.watchedIcon.text(i18n.__('Mark as Seen'));
                }
            }, function () {
                if (_this.model.get('watched')) {
                    _this.ui.watchedIcon.text(i18n.__('Seen'));
                } else {
                    _this.ui.watchedIcon.text(i18n.__('Not Seen'));
                }
            });

            // display stars or number
            if (AdvSettings.get('ratingStars') === false) {
                $('.star-container').addClass('hidden');
                $('.number-container').removeClass('hidden');
            }

            this.initKeyboardShortcuts();

            App.Device.Collection.setDevice(Settings.chosenPlayer);
            App.Device.ChooserView('#player-chooser').render();
        },

        handleAnime: function () {
            var id = this.model.get('imdb_id');
            if (id && id.indexOf('mal') === -1) {
                return;
            }

            $('.movie-imdb-link, .rating-container, .magnet-link, .health-icon').hide();
            $('.dot').css('opacity', 0);
        },

        onDestroy: function () {
            this.unbindKeyboardShortcuts();
        },

        initKeyboardShortcuts: function () {
            Mousetrap.bind(['esc', 'backspace'], this.closeDetails);
            Mousetrap.bind(['enter', 'space'], function (e) {
                $('#watch-now').click();
            });
            Mousetrap.bind('q', this.toggleQuality);
            Mousetrap.bind('f', function () {
                $('.favourites-toggle').click();
            });
        },

        unbindKeyboardShortcuts: function () { // There should be a better way to do this
            Mousetrap.unbind(['esc', 'backspace']);
            Mousetrap.unbind(['enter', 'space']);
            Mousetrap.unbind('q');
            Mousetrap.unbind('f');
        },

        switchRating: function () {
            $('.number-container').toggleClass('hidden');
            $('.star-container').toggleClass('hidden');
            AdvSettings.set('ratingStars', $('.number-container').hasClass('hidden'));
        },

        switchSubtitle: function (lang) {
            var subtitles = this.model.get('subtitle');

            if (subtitles === undefined || subtitles[lang] === undefined) {
                lang = 'none';
            }

            this.subtitle_selected = lang;
            this.ui.selected_lang.removeClass().addClass('flag toggle selected-lang').addClass(this.subtitle_selected);

            win.info('Subtitles: ' + this.subtitle_selected);
        },

        startStreaming: function () {
            var movieInfo = {
                type: 'movie',
                imdbid: this.model.get('imdb_id')
            };
            var torrent = this.model.get('torrents')[this.model.get('quality')];
            var torrentStart = new Backbone.Model({
                imdb_id: this.model.get('imdb_id'),
                torrent: torrent,
                backdrop: this.model.get('backdrop'),
                subtitle: this.model.get('subtitle'),
                defaultSubtitle: Settings.subtitle_language, //originally: this.subtitle_selected,
                extract_subtitle: movieInfo,
                title: this.model.get('title'),
                quality: this.model.get('quality'),
                type: 'movie',
                device: App.Device.Collection.selected,
                cover: this.model.get('cover')
            });
            App.vent.trigger('stream:start', torrentStart);
         },

        playTrailer: function () {

            var trailer = new Backbone.Model({
                src: this.model.get('trailer'),
                type: 'video/youtube',
                subtitle: null,
                quality: false,
                title: this.model.get('title')
            });
            var tmpPlayer = App.Device.Collection.selected.attributes.id;
            App.Device.Collection.setDevice('local');
            App.vent.trigger('stream:ready', trailer);
            App.Device.Collection.setDevice(tmpPlayer);
        },

        closeDetails: function () {
            App.vent.trigger('movie:closeDetail');
        },

        enableHD: function () {
            var torrents = this.model.get('torrents');

            if (torrents['1080p'] !== undefined) {
                torrents = this.model.get('torrents');
                this.model.set('quality', '1080p');
                win.debug('HD Enabled', this.model.get('quality'));
                AdvSettings.set('movies_default_quality', '1080p');
                this.resetHealth();
            }
        },

        disableHD: function () {
            var torrents = this.model.get('torrents');

            if (torrents['720p'] !== undefined) {
                torrents = this.model.get('torrents');
                this.model.set('quality', '720p');
                win.debug('HD Disabled', this.model.get('quality'));
                AdvSettings.set('movies_default_quality', '720p');
                this.resetHealth();
            }
        },

        toggleFavourite: function (e) {
            if (e.type) {
                e.stopPropagation();
                e.preventDefault();
            }
            var that = this;
            if (this.model.get('bookmarked') === true) {
                that.ui.bookmarkIcon.removeClass('selected').text(i18n.__('Add to bookmarks'));
                that.model.set('bookmarked', false);
            } else {
                that.ui.bookmarkIcon.addClass('selected').text(i18n.__('Remove from bookmarks'));
                that.model.set('bookmarked', true);
            }
            $('li[data-imdb-id="' + this.model.get('imdb_id') + '"] .actions-favorites').click();
        },

        toggleWatched: function (e) {

            if (e.type) {
                e.stopPropagation();
                e.preventDefault();
            }
            var that = this;
            if (this.model.get('watched') === true) {
                that.model.set('watched', false);
                that.ui.watchedIcon.removeClass('selected').text(i18n.__('Not Seen'));
            } else {
                that.model.set('watched', true);
                that.ui.watchedIcon.addClass('selected').text(i18n.__('Seen'));
            }

            $('li[data-imdb-id="' + this.model.get('imdb_id') + '"] .actions-watched').click();
        },

        openIMDb: function () {
            nw.Shell.openExternal('http://www.imdb.com/title/' + this.model.get('imdb_id'));
        },

        openMagnet: function (e) {
            var provider = this.model.get('provider'),
                torrent = this.model.get('torrents')[this.model.get('quality')],
                magnetLink;

            if (torrent.magnet) { // Movies
                magnetLink = torrent.magnet;
            } else { // Anime
                magnetLink = torrent.url;
            }
            if (e.button === 2) { //if right click on magnet link
                var clipboard = nw.Clipboard.get();
                clipboard.set(magnetLink, 'text'); //copy link to clipboard
                $('.notification_alert').text(i18n.__('The magnet link was copied to the clipboard')).fadeIn('fast').delay(2500).fadeOut('fast');
            } else {
                nw.Shell.openExternal(magnetLink);
            }
        },

        toggleQuality: function (e) {
            if ($('#switch-hd-off').is(':checked')) {
                $('#switch-hd-on').trigger('click');
            } else {
                $('#switch-hd-off').trigger('click');
            }
            App.vent.trigger('qualitychange');

            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }
        },

        getTorrentHealth: function (e) {
            var torrent = this.model.get('torrents')[this.model.get('quality')];

            cancelTorrentHealth();

            // Use fancy coding to cancel
            // pending torrent-tracker-health's
            var cancelled = false;
            cancelTorrentHealth = function () {
                cancelled = true;
            };
            if (torrent) {
            torrentHealth(torrent.url, {
                    timeout: 2000,
                    blacklist: Settings.trackers.blacklisted,
                    trackers: Settings.trackers.forced
                }, function (err, res) {
                  if (err) {
                    win.debug(err);
                  }
                  if (cancelled) {
                        return;
                    }
                    if (res.seeds === 0 && torrentHealthRestarted < 5) {
                        torrentHealthRestarted++;
                        $('.health-icon').click();
                    } else {
                        torrentHealthRestarted = 0;
                        var h = Common.calcHealth({
                            seed: res.seeds,
                            peer: res.peers
                        });
                        var health = Common.healthMap[h].capitalize();
                        var ratio = res.peers > 0 ? res.seeds / res.peers : +res.seeds;

                        $('.health-icon').tooltip({
                                html: true
                            })
                            .removeClass('Bad Medium Good Excellent')
                            .addClass(health)
                            .attr('data-original-title', i18n.__('Health ' + health) + ' - ' + i18n.__('Ratio:') + ' ' + ratio.toFixed(2) + ' <br> ' + i18n.__('Seeds:') + ' ' + res.seeds + ' - ' + i18n.__('Peers:') + ' ' + res.peers)
                            .tooltip('fixTitle');
                    }
                });
                }

        },

        resetHealth: function () {
            $('.health-icon').tooltip({
                    html: true
                })
                .removeClass('Bad Medium Good Excellent')
                .attr('data-original-title', i18n.__('Health Unknown'))
                .tooltip('fixTitle');
            this.getTorrentHealth();
        },

        selectPlayer: function (e) {
            var player = $(e.currentTarget).parent('li').attr('id').replace('player-', '');
            this.model.set('device', player);
            if (!player.match(/[0-9]+.[0-9]+.[0-9]+.[0-9]/ig)) {
                AdvSettings.set('chosenPlayer', player);
            }
        }

    });
})(window.App);
