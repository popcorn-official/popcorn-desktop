(function (App) {
    'use strict';

    App.View.MovieDetail = Backbone.Marionette.LayoutView.extend({
        template: '#movie-detail-tpl',
        className: 'movie-detail',

        ui: {
            bookmarkIcon: '.favourites-toggle',
            watchedIcon: '.watched-toggle',
            backdrop: '.backdrop',
            poster: '.mcover-image'
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
            'click .rating-container': 'switchRating'
        },

        regions: {
            SubDropdown: '#subs-dropdown',
            AudioDropdown: '#audio-dropdown'
        },

        initialize: function () {
            //If a child was removed from above this view
            App.vent.on('viewstack:pop', function () {
                if (_.last(App.ViewStack) === this.className) {
                    this.initKeyboardShortcuts();
                }
            }.bind(this));

            //If a child was added above this view
            App.vent.on('viewstack:push', function () {
                if (_.last(App.ViewStack) !== this.className) {
                    this.unbindKeyboardShortcuts();
                }
            }.bind(this));

            App.vent.on('shortcuts:movies', this.initKeyboardShortcuts);

            this.model.on('change:quality', this.renderHealth, this);
        },

        onShow: function () {
            console.log('Show movie detail (' + this.model.get('imdb_id') + ')');

            App.MovieDetailView = this;

            this.hideUnused();
            this.loadImages();
            this.setQuality();
            this.renderHealth();
            this.loadComponents();
            this.initKeyboardShortcuts();
            this.setUiStates();
        },

        setUiStates: function () {
            $('.star-container,.movie-imdb-link,.q720,input,.magnet-link').tooltip({
                html: true
            });

            // Bookmarked / not bookmarked
            if (this.model.get('bookmarked')) {
                this.ui.bookmarkIcon.addClass('selected');
            }

            // Seen / Unseen
            if (this.model.get('watched')) {
                this.ui.watchedIcon.addClass('selected');
            }

            // display stars or number
            if (!Settings.ratingStars) {
                $('.star-container').addClass('hidden');
                $('.number-container').removeClass('hidden');
            }

            // switch to default subtitle
            this.switchSubtitle(Settings.subtitle_language);
            
            this.setTooltips();
        },

        toggleFavourite: function (e) {
            $('li[data-imdb-id="' + this.model.get('imdb_id') + '"] .actions-favorites').click();
            this.ui.bookmarkIcon.toggleClass('selected');
            this.model.set('bookmarked', !this.model.get('bookmarked'));
            this.setTooltips();
        },

        toggleWatched: function (e) {
            $('li[data-imdb-id="' + this.model.get('imdb_id') + '"] .actions-watched').click();
            this.ui.watchedIcon.toggleClass('selected');
            this.model.set('watched', !this.model.get('watched'));
            this.setTooltips();
        },

        setTooltips: function () {
            // watched state
            var watched = this.model.get('watched');
            var textWatched = watched ? 'Seen' : 'Not Seen';
            var textWatchedHover = watched ? 'Mark as unseen' : 'Mark as Seen';
            this.ui.watchedIcon.text(i18n.__(textWatched));

            this.ui.watchedIcon.hover(function () {
                this.ui.watchedIcon.text(i18n.__(textWatchedHover));
            }.bind(this), function () {
                this.ui.watchedIcon.text(i18n.__(textWatched));
            }.bind(this));
            
            // favorite state
            var bookmarked = this.model.get('bookmarked');
            var textBookmarked = bookmarked ? 'Remove from bookmarks' : 'Add to bookmarks';
            this.ui.bookmarkIcon.text(i18n.__(textBookmarked));
        },

        loadComponents: function () {
            // audio dropdown
            this.AudioDropdown.show(new App.View.LangDropdown({
                model: new App.Model.Lang({
                    type: 'audio',
                    title: _('Audio Language'),
                    values: this.model.get('audios'),
                    handler: this.switchAudio,
                })
            }));

            // subs dropdown
            this.SubDropdown.show(new App.View.LangDropdown({
                model: new App.Model.Lang({
                    type: 'sub',
                    title: _('Subtitle'),
                    values: this.model.get('subtitle'),
                    handler: this.switchSubtitle,
                })
            }));

            // player chooser
            App.Device.Collection.setDevice(Settings.chosenPlayer);
            App.Device.ChooserView('#player-chooser').render();
        },

        setQuality: function () {
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
        },

        loadImages: function () {
            var noimg = 'images/posterholder.png';
            var nobg = 'images/bg-header.jpg';

            var setImage = {
                poster: function (img) {
                    this.ui.poster.attr('src', (img || noimg)).addClass('fadein');
                }.bind(this),
                backdrop: function (img) {
                    this.ui.backdrop.css('background-image', 'url(' + (img || nobg) + ')').addClass('fadein');
                }.bind(this)
            };

            var loadImage = function (img, type) {
                var cache = new Image();
                cache.src = img;

                cache.onload = function () {
                    if (img.indexOf('.gif') !== -1) { // freeze gifs
                        var c = document.createElement('canvas');
                        var w  = c.width = img.width;
                        var h = c.height = img.height;

                        c.getContext('2d').drawImage(cache, 0, 0, w, h);
                        img = c.toDataURL();
                    }
                    setImage[type](img);
                };

                cache.onerror = function (e) {
                    setImage[type](null);
                };
            };

            var p = this.model.get('poster') || noimg;
            var b = this.model.get('backdrop') || this.model.get('poster') || nobg;

            loadImage(p, 'poster');
            loadImage(b, 'backdrop');
        },

        hideUnused: function () {
            var id = this.model.get('imdb_id');

            if (!this.model.get('torrents')) { // no torrents
                $('#player-chooser, #audio-dropdown, #subs-dropdown, .magnet-link, .health-icon').hide();
            }

            if (!this.model.get('rating')) { // no ratings
                $('.rating-container').hide();
            }

            if (!id || (id && ['mal', 'ccc'].indexOf(id) === -1)) { // if anime
                $('.movie-imdb-link').hide();
            }

            if (!this.model.get('trailer')) { // no trailer
                $('#watch-trailer').hide();
            }
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
            // this.ui.selected_lang.removeClass().addClass('flag toggle selected-lang').addClass(this.subtitle_selected);

            console.log('Subtitles: ' + this.subtitle_selected);
        },

        startStreaming: function () {
            var torrent = this.model.get('torrents')[this.model.get('quality')];
            var torrentStart = new Backbone.Model({
                imdb_id: this.model.get('imdb_id'),
                torrent: torrent,
                poster: this.model.get('poster'),
                backdrop: this.model.get('backdrop'),
                subtitle: this.model.get('subtitle'),
                defaultSubtitle: this.subtitle_selected,
                title: this.model.get('title'),
                quality: this.model.get('quality'),
                type: 'movie',
                device: App.Device.Collection.selected,
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
                console.log('HD Enabled', this.model.get('quality'));
                AdvSettings.set('movies_default_quality', '1080p');
            }
        },

        disableHD: function () {
            var torrents = this.model.get('torrents');

            if (torrents['720p'] !== undefined) {
                torrents = this.model.get('torrents');
                this.model.set('quality', '720p');
                console.log('HD Disabled', this.model.get('quality'));
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

        selectPlayer: function (e) {
            var player = $(e.currentTarget).parent('li').attr('id').replace('player-', '');
            this.model.set('device', player);
            if (!player.match(/[0-9]+.[0-9]+.[0-9]+.[0-9]/ig)) {
                AdvSettings.set('chosenPlayer', player);
            }
        }

    });
})(window.App);
