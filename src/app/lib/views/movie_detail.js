(function(App) {
    "use strict";
        

    var MovieDetail = Backbone.Marionette.ItemView.extend({
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
            'click #toggle-sub-dropdown': 'toggledropdown',
            'click .sub-dropdown-arrow-down': 'toggledropdown',
            'click #sub-flag-icon': 'closedropdown',
            'click .sub-dropdown-arrow-up': 'closedropdown'
        },

        onShow: function() {

            // TODO: use the default in settings
            this.subtitle_selected = false;

            console.log('Show movie detail', this.model);

            var torrents = this.model.get('torrents');

            if(torrents['720p'] !== undefined && torrents['1080p'] !== undefined) {
            
                var torrentUrl = torrents['1080p'].url;
                this.model.set('quality', torrents['1080p'].url);

            } else if(torrents['1080p'] !== undefined ) {
            
                var torrentUrl = torrents['1080p'].url;
                this.model.set('quality', torrents['1080p'].url);

            } else if(torrents['720p'] !== undefined ) {
                
                var torrentUrl = torrents['720p'].url;
                this.model.set('quality', torrents['720p'].url);

            }
 
	        $('.health-icon').tooltip();
            $('.star-container').tooltip();

            var background = $(".movie-backdrop").attr("data-bgr");
            
            $('<img/>').attr('src', background).load(function() {
                $(this).remove();
                $(".movie-backdrop").css('background-image', "url(" + background + ")");
                $(".movie-backdrop").fadeIn( 300 );
            });
            
            $(".sub-dropdown-arrow-down").show();

            // switch to default subtitle
            this.switchSubtitle(Settings.subtitle_language);
        },

        onClose: function() {},
        showCover: function() {},
        toggledropdown: function() {

            var self = this;
            $(".flag-container").fadeIn();
            $(".sub-dropdown-arrow-down").hide();
            $(".sub-dropdown-arrow-up").show();
            $("#toggle-sub-dropdown").one('click', function(e) {
                self.closedropdown(e);
                return false;
            });


        },

        closedropdown: function(e) {
            e.preventDefault();
            var value = ($(e.currentTarget).attr("data-lang") == null) ? 'none' : $(e.currentTarget).attr("data-lang");      
            this.switchSubtitle(value);
        },

        startStreaming: function() {
            var torrentStart = new Backbone.Model({torrent: this.model.get('quality'), backdrop: this.model.get('backdrop'), subtitle: this.model.get('subtitle'), defaultSubtitle: this.subtitle_selected, title: this.model.get('title')});
            App.vent.trigger('stream:start', torrentStart);
        },

        playTrailer: function() {
            var trailer = new Backbone.Model({src: this.model.get('trailer'), type: 'video/youtube', subtitle: null, title: null });
            App.vent.trigger('stream:ready', trailer);
        },

        closeDetails: function() {
			App.vent.trigger('movie:closeDetail'); 	
        },

        enableHD: function () {

            var torrents = this.model.get('torrents');
            console.logger.debug('HD Enabled');


            if(torrents['1080p'] !== undefined) {
                var torrents = this.model.get('torrents');
                var torrentUrl = torrents['1080p'].url;
                this.model.set('quality', torrents['1080p'].url);
                console.logger.debug(this.model.get('quality'));
            }
        },

        disableHD: function () {

            var torrents = this.model.get('torrents');
            console.logger.debug('HD Disabled');
            console.logger.log(torrents['720p']);

            if(torrents['720p'] !== undefined) {
                var torrents = this.model.get('torrents');
                 this.model.set('quality', torrents['720p'].url);
                 console.logger.debug(this.model.get('quality'));
            }

        },

        // helper function to switch subtitle
        switchSubtitle: function(lang) {

            // did this lang exist ?
            var subtitles = this.model.get("subtitle");

            // make sure we have an existing lang
            if (typeof subtitles[lang] == 'undefined') 
                lang = 'none';

            // here we go...
            this.subtitle_selected = lang;
            this.ui.selected_lang.removeClass().addClass("flag").addClass("toggle").addClass("selected-lang").addClass(this.subtitle_selected);
            $(".flag-container").fadeOut();
            $(".sub-dropdown-arrow-down").show();
            $(".sub-dropdown-arrow-up").hide();
            

            console.log("Subtitle: " + this.subtitle_selected);
        }

    });


    App.View.MovieDetail = MovieDetail;
})(window.App);
