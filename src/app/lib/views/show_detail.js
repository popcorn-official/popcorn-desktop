(function(App) {
    "use strict";

    var _this;
    var ShowDetail = Backbone.Marionette.ItemView.extend({
        template: '#show-detail-tpl',
        className: 'shows-container-contain',

        ui: {
            startStreaming: ".startStreaming"
        },

        events: {
            'click .watched': 'toggleWatched',
            'click .startStreaming': 'startStreaming',
            'click .tv-container-close': 'closeDetails',
            'click #tabs_season li': 'clickTab',
            'click .episodeSummary': 'clickEpisode',
            'dblclick .episodeSummary': 'dblclickEpisode',
        },

        initialize: function() {
            _this = this;
            App.vent.on('shows:watched',   this.markWatched);
            App.vent.on('shows:unwatched', this.markNotWatched);
        },

        onShow: function() {

            this.selectSeason($("#tabs_season li").first("li"));

            $(".filter-bar").hide();    
            $('.star-container-tv').tooltip();
             var background = $(".tv-poster-background").attr("data-bgr");
              $('<img/>').attr('src', background).load(function() {
                $(this).remove();
                $(".tv-poster-background").css('background-image', "url(" + background + ")");
                $(".tv-poster-background").fadeIn( 300 );
              });     

            // add ESC to close this popup
            Mousetrap.bind('esc', function(e) {
                App.vent.trigger('show:closeDetail'); 
                $(".filter-bar").show();   
            });

            // we'll mark episode already watched
            Database.getEpisodesWatched( this.model.get('tvdb_id') ,function(err, data) {
                _.each(data, _this.markWatched);
            });

        },

        toggleWatched: function (e) {
            var edata = e.currentTarget.id.split('-');
            var value = {
                show_id : Number (_this.model.get('tvdb_id')),
                season  : edata[1],
                episode : edata[2]};

            // we do this because checkEpisodeWatched is broken,
            // probably a bug in nedb
            App.db.getEpisodesWatched(value.show_id, function (err, data) {
                if (_.where (data, value).length) {
                    App.vent.trigger ("shows:unwatched", value)
                } else {
                    App.vent.trigger ("shows:watched", value)
                }
            });

        },

        markWatched: function (value) {
            // we should never get any shows that aren't us, but you know, just in case.
            if (value.show_id == _this.model.get('tvdb_id')) {
                $('#watched-'+value.season+'-'+value.episode).removeClass('watched-false').addClass('watched-true');
            } else {
                console.error ('something fishy happened with the watched signal', this.model, value);
            }
        },

        markNotWatched: function (value) {
            // we should never get any shows that aren't us, but you know, just in case.
            if (value.show_id == _this.model.get('tvdb_id')) {
                $('#watched-'+value.season+'-'+value.episode).removeClass('watched-true').addClass('watched-false');
            } else {
                console.error ('something fishy happened with the notwatched signal', this.model, value);
            }
        },

        startStreaming: function(e) {
            e.preventDefault();
            var that = this;
            var title = that.model.get('title');
            var episode =  $(e.currentTarget).attr('data-episode');
            var season = $(e.currentTarget).attr('data-season');
            var name = $(e.currentTarget).attr('data-title');

            title += " - " + i18n.__('Season') + " "+ season + ", " + i18n.__('Episode') + " "+ episode +" - "+ name;
            var epInfo = {
                type: 'tvshow',
                imdbid: that.model.get('imdb_id'), 
                season : season,
                episode : episode
            };
               
            var torrentStart = new Backbone.Model({
                    torrent: $(e.currentTarget).attr('data-torrent'), 
                    backdrop: that.model.get('images').fanart, 
                    type: "episode", 
                    show_id: that.model.get("tvdb_id"),
                    episode: episode,
                    season: season,
                    title: title,
                    status: status,
                    extract_subtitle: epInfo,
                    defaultSubtitle: Settings.subtitle_language
            });

            App.vent.trigger('stream:start', torrentStart);
        },

        closeDetails: function(e) {
            e.preventDefault();
            App.vent.trigger('show:closeDetail'); 
            $(".filter-bar").show();    
        },

        clickTab: function(e) {
            e.preventDefault();
            this.selectSeason($(e.currentTarget));
        },

        clickEpisode: function(e) {
            e.preventDefault();
            this.selectEpisode($(e.currentTarget));
        },
        
        dblclickEpisode: function(e) {
            e.preventDefault();
            this.selectEpisode($(e.currentTarget));
            $('.startStreaming').trigger('click');
        },
         // Helper Function
        selectSeason: function($elem) {
            $('.tabs-episode').hide();
            $('.tabs-episode').removeClass('current');
            $('#tabs_season li').removeClass('active');
            $('.episodeSummary').removeClass('active');
            $elem.addClass('active');
            $("#"+$elem.attr('data-tab')).addClass('current').show();

            this.selectEpisode($("#"+$elem.attr('data-tab')).find($( ".episodeSummary")).first());           
        },

        selectEpisode: function($elem) {
            var tvdbid = $elem.attr('data-id');
            var tvdbtorrent = $elem.attr('data-torrent');
            $('.episodeSummary').removeClass('active');
            $elem.addClass('active');
            $(".episode-info-number").text(i18n.__('Episode') + ' '+$('.template-'+tvdbid+' .episode').html());
            $(".episode-info-title").text($('.template-'+tvdbid+' .title').html());
            $(".episode-info-date").text($('.template-'+tvdbid+' .date').html());
            $(".episode-info-description").text($('.template-'+tvdbid+' .overview').html());
            $(".movie-btn-watch-episode").attr("data-torrent", tvdbtorrent);
            $(".movie-btn-watch-episode").attr("data-episodeid", tvdbid);

            // set var for player
            $(".movie-btn-watch-episode").attr("data-episode", $('.template-'+tvdbid+' .episode').html());
            $(".movie-btn-watch-episode").attr("data-season", $('.template-'+tvdbid+' .season').html());
            $(".movie-btn-watch-episode").attr("data-title", $('.template-'+tvdbid+' .title').html());

            

            this.ui.startStreaming.show();            
        }

    });

    App.View.ShowDetail = ShowDetail;
})(window.App);
    
