(function(App) {
    "use strict";

    App.View.MovieDetail = Backbone.Marionette.ItemView.extend({
        template: '#movie-detail-tpl',
        className: 'app-overlay',

        ui: {
            selected_lang: '.selected-lang'
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
            'click .sub-dropdown-arrow-up': 'closeDropdown'
        },

        onShow: function() {

            var that = this;
            Mousetrap.bind('esc', function(e) {
                that.closeDetails();
            });

            // TODO: use the default in settings
            this.subtitle_selected = false;

            console.log('Show movie detail', this.model);

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

            $('.star-container').tooltip();

            var background = $(".movie-backdrop").attr("data-bgr");

            $('<img/>').attr('src', background).load(function() {
                $(this).remove();
                $(".movie-backdrop").css('background-image', "url(" + background + ")").fadeIn(300);
            });

            $(".sub-dropdown-arrow-down").show();

            // switch to default subtitle
            this.switchSubtitle(Settings.subtitle_language);

            // add ESC to close this popup
            Mousetrap.bind('esc', function(e) {
                App.vent.trigger('movie:closeDetail');
            });
        },

        onClose: function() {
        },
        showCover: function() {},
        toggleDropdown: function() {
            var self = this;
            $(".flag-container").fadeIn();
            $(".sub-dropdown-arrow-down").hide();
            $(".sub-dropdown-arrow-up").show();
            $("#toggle-sub-dropdown").one('click', function(e) {
                self.closeDropdown(e);
                return false;
            });

        },

        closeDropdown: function(e) {
            e.preventDefault();
            var value = ($(e.currentTarget).attr("data-lang") == null) ? 'none' : $(e.currentTarget).attr("data-lang");
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
            console.logger.debug('HD Enabled');

            if (torrents['1080p'] !== undefined) {
                torrents = this.model.get('torrents');
                this.model.set('quality', torrents['1080p'].url);
                this.calcHealth(torrents['1080p']);
                console.logger.debug(this.model.get('quality'));
            }
        },

        disableHD: function () {
            var torrents = this.model.get('torrents');
            console.logger.debug('HD Disabled');
            console.logger.log(torrents['720p']);

            if (torrents['720p'] !== undefined) {
                torrents = this.model.get('torrents');
                this.model.set('quality', torrents['720p'].url);
                this.calcHealth(torrents['720p']);
                console.logger.debug(this.model.get('quality'));
            }
        },

        calcHealth: function (tQ) {
            var spratio = tQ.seed / tQ.peer;
            var health = "Bad";
            if(spratio > 5){
                health = tQ.seed > 100? "Excellent":"Good";
            }else if(spratio > 2){
                health = tQ.seed > 100? "Good":"Medium";
            }else if(spratio >= 1){
                health = tQ.seed > 100? "Medium":"Bad";
            }
            $('.health-icon').tooltip({html: true})
                             .removeClass('Bad Medium Good Excellent')
                             .addClass(health)
                             .attr('data-original-title', i18n.__('Health ' + health) + ' - ' + i18n.__('Ratio') + ': ' + spratio.toFixed(2) + ' <br> ' + i18n.__('Seeds') + ': ' + tQ.seed + ' - ' + i18n.__('Peers') + ': ' + tQ.peer)
                             .tooltip('fixTitle');
        },

        // helper function to switch subtitle
        switchSubtitle: function(lang) {

            // did this lang exist ?
            var subtitles = this.model.get("subtitle");

            // make sure we have an existing lang
            if (subtitles === undefined || subtitles[lang] === undefined) {
                lang = 'none';
            }

            // here we go...
            this.subtitle_selected = lang;
            this.ui.selected_lang.removeClass().addClass("flag").addClass("toggle").addClass("selected-lang").addClass(this.subtitle_selected);
            $(".flag-container").fadeOut();
            $(".sub-dropdown-arrow-down").show();
            $(".sub-dropdown-arrow-up").hide();

            console.log("Subtitle: " + this.subtitle_selected);
        }
    });
})(window.App);
