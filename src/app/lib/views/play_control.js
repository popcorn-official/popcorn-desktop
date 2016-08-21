(function (App){
    'use strict';

    App.View.PlayControl = Backbone.Marionette.LayoutView.extend({
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
            SubDropdown: '#subs-dropdown',
            AudioDropdown: '#audio-dropdown',
        },

        initialize: function () {
            var _this = this;
            this.views = {};

            App.vent.on('sub:lang',   _this.switchSubtitle.bind(_this));
            App.vent.on('audio:lang', _this.switchAudio.bind(_this));
            App.vent.on('update:subtitles', function (subs)  {
                _this.views.subs.updateLangs(subs);
            })

            this.model.on('change:quality', function () {
                App.vent.trigger('change:quality', _this.model.get('quality'));
            });


        },

        onShow: function () {
            console.info('Show play control (' + this.model.get('imdb_id') + ')');

            var self = this;

            var torrents = this.model.get('torrents');
            var quality = Settings.movies_default_quality
            _.each(['1080p', '720p', '480p', 'HDRip'], function (q) {
                if (torrents[q] !== undefined) {
                    quality = q
                }
            })
            this.model.set('quality', quality);

            if (Settings.movies_default_quality === '720p' && torrents['720p'] !== undefined && document.getElementsByName('switch')[0] !== undefined) {
                document.getElementsByName('switch')[0].checked = true;
            }

            if (!this.model.get('trailer')) {
                $('#watch-trailer').hide();
            }

            var audios = self.model.get('audios')
            this.views.audio = new App.View.LangDropdown({
                model: new App.Model.Lang({
                    type: 'audio',
                    title: _('Audio Language'),
                    selected: self.model.get('defaultAudio'),
                    values: audios || {en: undefined},
                    handler: self.switchAudio.bind(self)
                })
            })
            this.AudioDropdown.show (this.views.audio);

            this.views.subs = new App.View.LangDropdown({
                model: new App.Model.Lang({
                    type: 'sub',
                    title: _('Subtitle'),
                    selected: self.model.get('defaultSubtitle'),
                    hasNull: true,
                    values: self.model.get('subtitle'),
                    handler: self.switchSubtitle.bind(self),
                })
            })
            this.SubDropdown.show (this.views.subs);

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

            App.Device.Collection.setDevice(Settings.chosenPlayer);
            App.Device.ChooserView('#player-chooser').render();
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
            var audios = this.model.get('audios');

            if (audios === undefined || audios[lang] === undefined) {
                lang = 'none';
            }

            this.audio_selected = lang;

            console.info('Audios: ' + this.audio_selected);
        },

        startStreaming: function () {
            var providerName = this.model.get('provider');
            var provider = App.Providers.get(providerName);
            var quality = this.model.get('quality');
            var lang = this.model.get('lang');
            var defaultTorrent = this.model.get('torrents')[quality];

            var filters =  {
                quality: quality,
                lang: lang
            };

            var torrent = provider
                .resolveStream(defaultTorrent, filters, this.model.attributes);

            var torrentStart = new Backbone.Model({
                imdb_id: this.model.get('imdb_id'),
                torrent: torrent,
                backdrop: this.model.get('backdrop'),
                subtitle: this.model.get('subtitle'),
                defaultSubtitle: this.subtitle_selected,
                title: this.model.get('title'),
                quality: quality,
                lang: lang,
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
        }
    });

})(window.App);


