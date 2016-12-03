(function (App) {
    'use strict';

    App.View.MovieDetail = Backbone.Marionette.LayoutView.extend({
        template: '#movie-detail-tpl',
        className: 'movie-detail',
        events: {
            'click .close-icon': 'closeDetails',
            'click .movie-imdb-link': 'openIMDb',
            'mousedown .magnet-link': 'openMagnet',
            'click .rating-container': 'switchRating'
        },

        regions: {
            PlayControl: '#play-control'
        },

        initialize: function () {
            var _this = this;

            //Handle keyboard shortcuts when other views are appended or removed
            this.views = {}; // internal models

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

            App.vent.on('change:quality', function (quality) {
                _this.model.set('quality', quality);
                _this.renderHealth();
            });
        },

        onShow: function () {
            console.log('Show movie detail (' + this.model.get('imdb_id') + ')');
            var self = this;
            this.handleAnime();
            this.loadMovieSubtitles();

            $('.star-container,.movie-imdb-link,.q720,input,.magnet-link').tooltip({
                html: true
            });

            App.MovieDetailView = this;

            this.views.play = new App.View.PlayControl({
                model: this.model
            });
            this.PlayControl.show(this.views.play);

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

            // display stars or number
            if (AdvSettings.get('ratingStars') === false) {
                $('.star-container').addClass('hidden');
                $('.number-container').removeClass('hidden');
            }

            this.initKeyboardShortcuts();
        },

        handleAnime: function () {
            var id = this.model.get('imdb_id');
            if (id && id.indexOf('mal') === -1) {
                return;
            }

            $('.movie-imdb-link, .rating-container, .magnet-link, .health-icon').hide();
            $('.dot').css('opacity', 0);
        },

        loadMovieSubtitles: function () {
            var self = this;
            console.warn(this.model.attributes);

            var subProvider = App.Config.getProviderForType('subtitle');

            console.warn(subProvider);
            subProvider.fetch({
                //filesize: '',
                imdbid: this.model.attributes.imdb_id,
                query: this.model.attributes.title
            }).then(function (subs) {
                if (subs && Object.keys(subs).length > 0) {
                    console.info(Object.keys(subs).length + ' subtitles found');
                    console.warn(subs);
                    App.vent.trigger('update:subtitles', subs);
                } else {
                    console.warn('No subtitles returned');
                }
            }).catch(console.warn.bind(console));
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

        closeDetails: function () {
            App.vent.trigger('movie:closeDetail');
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
    });
})(window.App);
