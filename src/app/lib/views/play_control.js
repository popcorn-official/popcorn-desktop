(function (App){
    'use strict';

    App.View.PlayControl = Marionette.View.extend({
        template: '#play-control-tpl',
        ui: {
            bookmarkIcon: '.favourites-toggle',
            watchedIcon: '.watched-toggle'
        },
        events: {
            'click #watch-now': 'startStreaming',
            'click #watch-trailer': 'playTrailer',
            'click #switch-hd-on': 'enableHD',
            'click #switch-hd-off': 'disableHD',
            'click .favourites-toggle': 'toggleFavourite',
            'click .playerchoicemenu li a': 'selectPlayer',
            'click .watched-toggle': 'toggleWatched',
        },
        regions: {
            subDropdown: '#subs-dropdown',
            audioDropdown: '#audio-dropdown',
        },

        initialize: function () {
            this.views = {};

            if (! this.model.get('langs')) {
               this.model.set('langs', {en: undefined});
            }

            App.vent.on('sub:lang',   this.switchSubtitle.bind(this));
            App.vent.on('audio:lang', this.switchAudio.bind(this));
            App.vent.on('update:subtitles', function (subs)  {
                this.views.sub.updateLangs(subs);
            }.bind(this));

            this.model.on('change:quality', function () {
                App.vent.trigger('change:quality', this.model.get('quality'));
            }.bind(this));
        },

        onAttach: function () {
            this.hideUnused();
            this.setQuality();
            this.loadComponents();
            this.setUiStates();
            App.vent.on('update:subtitles');
            this.model.on('change:langs', this.loadAudioDropdown.bind(this));
            this.model.on('change:subtitle', this.loadSubDropdown.bind(this));
        },

        setQuality: function () {
            var torrents = this.model.get('torrents');
            var quality = Settings.movies_default_quality;
            ['1080p', '720p', '480p', 'HDRip'].forEach(function (q) {
                if (torrents[q] !== undefined) {
                    quality = q;
                }
            });

            this.model.set('quality', quality);

            if (Settings.movies_default_quality === '720p' && torrents['720p'] !== undefined && document.getElementsByName('switch')[0] !== undefined) {
                document.getElementsByName('switch')[0].checked = true;
            }
        },

        hideUnused: function() {
            if (!this.model.get('torrents')) { // no torrents
                $('#player-chooser, #audio-dropdown, #subs-dropdown').hide();
            }

            if (!this.model.get('trailer')) {
                $('#watch-trailer').hide();
            }
        },

        loadDropdown: function (type, attrs) {
            console.log(this);
            console.log(attrs);
            this.views[type] && this.views[type].destroy();
            this.views[type] = new App.View.LangDropdown({
                model: new App.Model.Lang(Object.assign({type:type}, attrs))
            });
            var types = type+'Dropdown';
            this.getRegion(types).show(this.views[type]);
        },

        loadAudioDropdown: function () {
            return this.loadDropdown('audio', {
                title: i18n.__('Audio Language'),
                selected: this.model.get('defaultAudio'),
                values: this.model.get('langs')
            });
        },

        loadSubDropdown: function () {
            return this.loadDropdown('sub', {
                title: i18n.__('Subtitle'),
                selected: this.model.get('defaultSubtitle'),
                hasNull: true,
                values: this.model.get('subtitle')
            });
        },

        loadComponents: function() {
            this.loadAudioDropdown();
            this.loadSubDropdown();

            // player chooser
            App.Device.Collection.setDevice(Settings.chosenPlayer);
            App.Device.ChooserView('#player-chooser').render();
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

        switchSubtitle: function (lang) {
            var subtitles = this.model.get('subtitle');
            if (subtitles === undefined || subtitles[lang] === undefined) {
                lang = 'none';
            }

            this.subtitle_selected = lang;
            console.info('Subtitles: ' + this.subtitle_selected);
        },

        switchAudio: function (lang) {
            var audios = this.model.get('langs');

            if (audios === undefined || audios[lang] === undefined) {
                lang = 'none';
            }

            this.audio_selected = lang;

            console.info('Audios: ' + lang);
        },

        startStreaming: function () {
            var providers = this.model.get('providers');
            var quality = this.model.get('quality');
            var defaultTorrent = this.model.get('torrents')[quality];

            var filters =  {
                quality: quality,
                lang: this.audio_selected
            };

            var torrent = providers.torrent
                .resolveStream(defaultTorrent, filters, this.model.attributes);

            var torrentStart = new Backbone.Model({
                imdb_id: this.model.get('imdb_id'),
                torrent: torrent,
                backdrop: this.model.get('backdrop'),
                subtitle: this.model.get('subtitle'),
                defaultSubtitle: this.subtitle_selected,
                title: this.model.get('title'),
                quality: quality,
                lang: this.audio_selected,
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

        enableHD: function () {
            var torrents = this.model.get('torrents');

            if (torrents['1080p'] !== undefined) {
                torrents = this.model.get('torrents');
                this.model.set('quality', '1080p');
                console.debug('HD Enabled', this.model.get('quality'));
                AdvSettings.set('movies_default_quality', '1080p');
            }
        },

        disableHD: function () {
            var torrents = this.model.get('torrents');

            if (torrents['720p'] !== undefined) {
                torrents = this.model.get('torrents');
                this.model.set('quality', '720p');
                console.debug('HD Disabled', this.model.get('quality'));
                AdvSettings.set('movies_default_quality', '720p');
            }
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

        toggleQuality: function (e) {
            if ($('#switch-hd-off').is(':checked')) {
                $('#switch-hd-on').trigger('click');
            } else {
                $('#switch-hd-off').trigger('click');
            }

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
        },

        onDestroy: function () {
            App.vent.off('sub:lang');
            App.vent.off('audio:lang');
            App.vent.off('update:subtitles');
            this.model.off('change:quality');
            Object.values(this.views).forEach(v => v.destroy());
        }
    });

})(window.App);
