(function(App) {
    "use strict";
        

    var ShowDetail = Backbone.Marionette.ItemView.extend({
        template: '#show-detail-tpl',
        className: 'shows-container-contain',

        ui: {
            startStreaming: ".startStreaming"
        },

        events: {
            'click .startStreaming': 'startStreaming',
            'click .tv-container-close': 'closeDetails',
            'click #tabs_season li': 'clickTab',
            'click .episodeData': 'clickEpisode',
        },

        onShow: function() {

            this.selectSeason($("#tabs_season li").first("li"));
            
            $(".filter-bar").hide();    

             var background = $(".tv-poster-background").attr("data-bgr");
              $('<img/>').attr('src', background).load(function() {
                $(this).remove();
                $(".tv-poster-background").css('background-image', "url(" + background + ")");
                $(".tv-poster-background").fadeIn( 300 );
              });     
        },

        startStreaming: function(e) {
            e.preventDefault();
            var that = this;
            var title = that.model.get('title');
            var episode =  $(e.currentTarget).attr('data-episode');
            var season = $(e.currentTarget).attr('data-season');
            var name = $(e.currentTarget).attr('data-title');

            title += " - Season "+ season + ", Episode "+ episode +" - "+ name;
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
                    show_id: that.model.get("_id"),
                    episode: episode,
                    season: season,
                    title: title,
                    extract_subtitle: epInfo
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

         // Helper Function
         selectSeason: function($elem) {
            $('.tabs-episode').hide();
            $('.tabs-episode').removeClass('current');
            $('#tabs_season li').removeClass('active');
            $('.epidoseSummary').removeClass('active');
            $elem.addClass('active');
            $("#"+$elem.attr('data-tab')).addClass('current').show();

            this.selectEpisode($("#"+$elem.attr('data-tab')).find($( ".episodeData")).first());           
         },

         selectEpisode: function($elem) {
            var tvdbid = $elem.attr('data-id');
            var tvdbtorrent = $elem.attr('data-torrent');
            $('.epidoseSummary').removeClass('active');
            $elem.parent().addClass('active');
            $(".episode-info-number").text($('.template-'+tvdbid+' .episode').html());
            $(".episode-info-title").text($('.template-'+tvdbid+' .title').html());
            $(".episode-info-date").text($('.template-'+tvdbid+' .date').html());
            $(".episode-info-description").text($('.template-'+tvdbid+' .overview').html());
            $(".movie-btn-watch-episode").attr("data-torrent", tvdbtorrent);
            $(".movie-btn-watch-episode").attr("data-episodeid", tvdbid);

            this.ui.startStreaming.show();            
         }

    });

    App.View.ShowDetail = ShowDetail;
})(window.App);
    
