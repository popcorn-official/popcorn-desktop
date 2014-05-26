(function(App) {
    'use strict';

    App.View.MovieDetail = Backbone.Marionette.ItemView.extend({
        template: '#movie-detail-tpl',
        className: 'app-overlay',

        ui: {
            selected_lang: '.selected-lang',
            bookmarkIcon: '.cover-detail-favorites'
        },

        events: {
            'click .movie-btn-watch': 'startStreaming',
            'click .movie-btn-watch-trailer': 'playTrailer',
            'click .movie-detail-close': 'closeDetails',
            'click #switch-hd-on': 'enableHD',
            'click #switch-hd-off': 'disableHD',
            'click #toggle-sub-dropdown': 'toggleDropdown',
            'click .sub-dropdown-arrow-down': 'toggleDropdown',
            'click .sub-flag-icon': 'closeDropdown',
            'click .sub-dropdown-arrow-up': 'closeDropdown',
            'click .cover-detail-favorites': 'toggleFavorite',
            'click .movie-imdb-link': 'openIMDb'
        },

        onShow: function() {

            // TODO: use the default in settings
            this.subtitle_selected = false;

            win.info('Show movie detail');

            var torrents = this.model.get('torrents');

            if (torrents['720p'] !== undefined && torrents['1080p'] !== undefined) {
                this.model.set('quality', torrents['1080p'].url);
                this.calcHealth(torrents['1080p']);
            } else if(torrents['1080p'] !== undefined ) {
                this.model.set('quality', torrents['1080p'].url);
                this.calcHealth(torrents['1080p']);
            } else if(torrents['720p'] !== undefined ) {
                this.model.set('quality', torrents['720p'].url);
                this.calcHealth(torrents['720p']);
            }

            $('.star-container,.movie-imdb-link').tooltip();

            var background = $('.movie-backdrop').attr('data-bgr');

            $('<img/>').attr('src', background).load(function() {
                $(this).remove();
                $('.movie-backdrop').css('background-image', 'url(' + background + ')').fadeIn(300);
            });

            $('.sub-dropdown-arrow-down').show();

            // switch to default subtitle
            this.switchSubtitle(Settings.subtitle_language);

            // add ESC to close this popup
            Mousetrap.bind('esc', function(e) {
                App.vent.trigger('movie:closeDetail');
            });

            $(window).on('resize', this.onThisResize);
            this.onThisResize();

        },

        onThisResize: function() {
 
            $('.cover-detail-overlay').height( $('.movie-cover-image').height() );
        },

        onClose: function() {
        },
        showCover: function() {},
        toggleDropdown: function() {
            var self = this;
            $('.flag-container').fadeIn();
            $('.sub-dropdown-arrow-down').hide();
            $('.sub-dropdown-arrow-up').show();
            $('#toggle-sub-dropdown').one('click', function(e) {
                self.closeDropdown(e);
                return false;
            });

        },

        closeDropdown: function(e) {
            e.preventDefault();
            var value = ($(e.currentTarget).attr('data-lang') == null) ? 'none' : $(e.currentTarget).attr('data-lang');
            this.switchSubtitle(value);
        },

        startStreaming: function() {
            var torrentStart = new Backbone.Model({
                torrent: this.model.get('quality'), 
                backdrop: this.model.get('backdrop'), 
                subtitle: this.model.get('subtitle'), 
                defaultSubtitle: this.subtitle_selected, 
                title: this.model.get('title'),
                type: 'movie',
                imdb_id: this.model.get('imdb_id')
            });
            App.vent.trigger('stream:start', torrentStart);
        },

        playTrailer: function() {
            var trailer = new Backbone.Model({
                src: this.model.get('trailer'), 
                type: 'video/youtube', 
                subtitle: null, 
                title: this.model.get('title') 
            });
            App.vent.trigger('stream:ready', trailer);
        },

        closeDetails: function() {
            App.vent.trigger('movie:closeDetail');
        },

        enableHD: function () {
            var torrents = this.model.get('torrents');
            win.info('HD Enabled');

            if (torrents['1080p'] !== undefined) {
                torrents = this.model.get('torrents');
                this.model.set('quality', torrents['1080p'].url);
                this.calcHealth(torrents['1080p']);
                win.debug(this.model.get('quality'));
            }
        },

        disableHD: function () {
            var torrents = this.model.get('torrents');
            win.info('HD Disabled');

            if (torrents['720p'] !== undefined) {
                torrents = this.model.get('torrents');
                this.model.set('quality', torrents['720p'].url);
                this.calcHealth(torrents['720p']);
                win.debug(this.model.get('quality'));
            }
        },

        calcHealth: function (tQ) {
            var spratio = tQ.seed / tQ.peer;
            var health = 'Bad';
            if(spratio > 5){
                health = tQ.seed > 100? 'Excellent':'Good';
            }else if(spratio > 2){
                health = tQ.seed > 100? 'Good':'Medium';
            }else if(spratio >= 1){
                health = tQ.seed > 100? 'Medium':'Bad';
            }
            $('.health-icon').tooltip({html: true})
                             .removeClass('Bad Medium Good Excellent')
                             .addClass(health)
                             .attr('data-original-title', i18n.__('Health ' + health) + ' - ' + i18n.__('Ratio') + ': ' + spratio.toFixed(2) + ' <br> ' + i18n.__('Seeds') + ': ' + tQ.seed + ' - ' + i18n.__('Peers') + ': ' + tQ.peer)
                             .tooltip('fixTitle');
        },


        toggleFavorite: function(e) {
            e.stopPropagation();
            e.preventDefault();
            var that = this;
            if (this.model.get('bookmarked') === true) {
                Database.deleteBookmark(this.model.get('imdb'), function(err, data) {
                    console.log('Bookmark deleted');
                    that.model.set('bookmarked', false);
                    that.ui.bookmarkIcon.removeClass('selected');
                    // we'll make sure we dont have a cached movie
                    Database.deleteMovie(that.model.get('imdb'),function(err, data) {});
                });
            } else {

                // we need to have this movie cached
                // for bookmarking
                var movie = {
                    imdb: this.model.get('imdb'),
                    image: this.model.get('image'),
                    torrents: this.model.get('torrents'),
                    title: this.model.get('title'),
                    synopsis: this.model.get('synopsis'),
                    runtime: this.model.get('runtime'),
                    year: this.model.get('year'),
                    health: this.model.get('health'),
                    subtitle: this.model.get('subtitle'),
                    backdrop: this.model.get('backdrop'),
                    rating: this.model.get('MovieRating'),
                    trailer: this.model.get('trailer'),
                };

                Database.addMovie(movie, function(error,result) {
                    Database.addBookmark(that.model.get('imdb'), 'movie', function(err, data) {
                        console.log('Bookmark added');
                        that.ui.bookmarkIcon.addClass('selected');
                        that.model.set('bookmarked', true);
                    });
                });

            }
        },


        // helper function to switch subtitle
        switchSubtitle: function(lang) {

            // did this lang exist ?
            var subtitles = this.model.get('subtitle');

            // make sure we have an existing lang
            if (subtitles === undefined || subtitles[lang] === undefined) {
                lang = 'none';
            }

            // here we go...
            this.subtitle_selected = lang;
            this.ui.selected_lang.removeClass().addClass('flag').addClass('toggle').addClass('selected-lang').addClass(this.subtitle_selected);
            $('.flag-container').fadeOut();
            $('.sub-dropdown-arrow-down').show();
            $('.sub-dropdown-arrow-up').hide();

            win.info('Subtitle: ' + this.subtitle_selected);
        },

        openIMDb: function() {
            gui.Shell.openExternal('http://www.imdb.com/title/' + this.model.get('imdb_id'));
        }

    });
})(window.App);
