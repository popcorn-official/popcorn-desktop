(function (App) {
    'use strict';

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
            'click .sub-dropdown': 'toggleDropdown',
            'click .sub-flag-icon': 'closeDropdown',
            'click .playerchoicemenu li a': 'selectPlayer',
            'click .rating-container': 'switchRating'
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

            this.model.on('change:quality', this.renderHealth, this);
        },

        onShow: function () {
            win.info('Show movie detail (' + this.model.get('imdb_id') + ')');
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

            this.renderHealth();

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
                $('.mcover-image').attr('src', this.model.get('image')).addClass('fadein');
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
            if (this.model.get('imdb_id').indexOf('mal') === -1) {
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
            if ($('.number-container').hasClass('hidden')) {
                $('.number-container').removeClass('hidden');
                $('.star-container').addClass('hidden');
                AdvSettings.set('ratingStars', false);
            } else {
                $('.number-container').addClass('hidden');
                $('.star-container').removeClass('hidden');
                AdvSettings.set('ratingStars', true);
            }
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
            var torrentStart = new Backbone.Model({
                imdb_id: this.model.get('imdb_id'),
                torrent: this.model.get('torrents')[this.model.get('quality')].magnet,
                backdrop: this.model.get('backdrop'),
                subtitle: this.model.get('subtitle'),
                defaultSubtitle: this.subtitle_selected,
                title: this.model.get('title'),
                quality: this.model.get('quality'),
                type: 'movie',
                device: App.Device.Collection.selected,
                cover: this.model.get('cover')
            });
            App.vent.trigger('stream:start', torrentStart);
        },

        toggleDropdown: function (e) {
            if ($('.sub-dropdown').is('.open')) {
                this.closeDropdown(e);
                return false;
            } else {
                $('.sub-dropdown').addClass('open');
                $('.sub-dropdown-arrow').addClass('down');
            }
            var self = this;
            $('.flag-container').fadeIn();
        },

        closeDropdown: function (e) {
            e.preventDefault();
            $('.flag-container').fadeOut();
            $('.sub-dropdown').removeClass('open');
            $('.sub-dropdown-arrow').removeClass('down');

            var value = $(e.currentTarget).attr('data-lang');
            if (value) {
                this.switchSubtitle(value);
            }
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
            }
        },

        disableHD: function () {
            var torrents = this.model.get('torrents');

            if (torrents['720p'] !== undefined) {
                torrents = this.model.get('torrents');
                this.model.set('quality', '720p');
                win.debug('HD Disabled', this.model.get('quality'));
                AdvSettings.set('movies_default_quality', '720p');
            }
        },

        renderHealth: function () {
            var torrent = this.model.get('torrents')[this.model.get('quality')];
            var health = torrent.health.capitalize();
            var ratio = torrent.peer > 0 ? torrent.seed / torrent.peer : +torrent.seed;

            $('.health-icon').tooltip({
                    html: true
                })
                .removeClass('Bad Medium Good Excellent')
                .addClass(health)
                .attr('data-original-title', i18n.__('Health ' + health) + ' - ' + i18n.__('Ratio:') + ' ' + ratio.toFixed(2) + ' <br> ' + i18n.__('Seeds:') + ' ' + torrent.seed + ' - ' + i18n.__('Peers:') + ' ' + torrent.peer)
                .tooltip('fixTitle');
        },


        toggleFavourite: function (e) {
            if (e.type) {
                e.stopPropagation();
                e.preventDefault();
            }
            var that = this;
            if (this.model.get('bookmarked') === true) {
                Database.deleteBookmark(this.model.get('imdb_id'))
                    .then(function () {
                        win.info('Bookmark deleted (' + that.model.get('imdb_id') + ')');
                        App.userBookmarks.splice(App.userBookmarks.indexOf(that.model.get('imdb_id')), 1);
                        that.ui.bookmarkIcon.removeClass('selected').text(i18n.__('Add to bookmarks'));
                    })
                    .then(function () {
                        return Database.deleteMovie(that.model.get('imdb_id'));
                    })
                    .then(function () {
                        that.model.set('bookmarked', false);
                        var bookmark = $('.bookmark-item .' + that.model.get('imdb_id'));
                        if (bookmark.length > 0) {
                            bookmark.parents('.bookmark-item').remove();
                        }
                        if (App.currentview === 'Favorites') {
                            App.vent.trigger('favorites:render');
                        }
                    });
            } else {

                // we need to have this movie cached
                // for bookmarking
                var movie = {
                    imdb_id: this.model.get('imdb_id'),
                    image: this.model.get('image'),
                    cover: this.model.get('cover'),
                    torrents: this.model.get('torrents'),
                    title: this.model.get('title'),
                    synopsis: this.model.get('synopsis'),
                    runtime: this.model.get('runtime'),
                    year: this.model.get('year'),
                    genre: this.model.get('genre'),
                    health: this.model.get('health'),
                    subtitle: this.model.get('subtitle'),
                    backdrop: this.model.get('backdrop'),
                    rating: this.model.get('rating'),
                    trailer: this.model.get('trailer'),
                    provider: this.model.get('provider'),
                    watched: this.model.get('watched'),
                };

                Database.addMovie(movie)
                    .then(function () {
                        return Database.addBookmark(that.model.get('imdb_id'), 'movie');
                    })
                    .then(function () {
                        win.info('Bookmark added (' + that.model.get('imdb_id') + ')');
                        that.ui.bookmarkIcon.addClass('selected').text(i18n.__('Remove from bookmarks'));
                        App.userBookmarks.push(that.model.get('imdb_id'));
                        that.model.set('bookmarked', true);
                    });
            }
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
            gui.Shell.openExternal('http://www.imdb.com/title/' + this.model.get('imdb_id'));
        },

        openMagnet: function (e) {
            var provider = this.model.get('provider'),
                torrent = this.model.get('torrents')[this.model.get('quality')],
                magnetLink;

            if (provider === 'Yts') { // Movies
                magnetLink = torrent.magnet;
            } else { // Anime
                magnetLink = torrent.url;
            }
            if (e.button === 2) { //if right click on magnet link
                var clipboard = gui.Clipboard.get();
                clipboard.set(magnetLink, 'text'); //copy link to clipboard
                $('.notification_alert').text(i18n.__('The magnet link was copied to the clipboard')).fadeIn('fast').delay(2500).fadeOut('fast');
            } else {
                gui.Shell.openExternal(magnetLink);
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

        selectPlayer: function (e) {
            var player = $(e.currentTarget).parent('li').attr('id').replace('player-', '');
            this.model.set('device', player);
            if (!player.match(/[0-9]+.[0-9]+.[0-9]+.[0-9]/ig)) {
                AdvSettings.set('chosenPlayer', player);
            }
        }

    });
})(window.App);
