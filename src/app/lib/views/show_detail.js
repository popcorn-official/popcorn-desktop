(function(App) {
    "use strict";
        

    var ShowDetail = Backbone.Marionette.ItemView.extend({
        template: '#show-detail-tpl',
        className: 'shows-container-contain',

        ui: {
            tabsContainer: "#tabs_episode_base div",
            seasonsList: "#tabs_season li",
            startStreaming: ".startStreaming"
        },
        events: {
            'click .startStreaming': 'startStreaming',
            'click .tv-container-close': 'closeDetails',
            'click #tabs_season li': 'clickTab',
            'click .episodeData': 'clickEpisode',
        },

        onShow: function() {
            this.ui.seasonsList.first().addClass('active'); // Activate first tab
            this.ui.tabsContainer.first().fadeIn(); // Show first tab tabs_container   
            
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
            var torrentStart = new Backbone.Model({torrent: $(e.currentTarget).attr('data-torrent'), backdrop: this.model.get('images').fanart, type: "episode", id: $(e.currentTarget).attr('data-episodeid'), title: this.model.get('title')});
            App.vent.trigger('stream:start', torrentStart);
            $(".filter-bar").show(); 
        },

        closeDetails: function(e) {
            e.preventDefault();
			App.vent.trigger('show:closeDetail'); 
            $(".filter-bar").show(); 	
        },

        clickTab: function(e) {
            e.preventDefault();
            $('#tabs_season li').removeClass('active');
            $('.tabs-episode').removeClass('current');
            $('.epidoseSummary').removeClass('active');
            $(e.currentTarget).addClass('active');
            $("#"+$(e.currentTarget).attr('data-tab')).addClass('current');
        },

         clickEpisode: function(e) {
            e.preventDefault();
            var tvdbid = $(e.currentTarget).attr('data-id')
            $('.epidoseSummary').removeClass('active');
            $(e.currentTarget).parent().addClass('active');
            $(".episode-info p").text($('.template-'+tvdbid+' .title').html());
            $(".episode-info div").text($('.template-'+tvdbid+' .overview').html());
            this.ui.startStreaming.show();
         },




    });

    App.View.ShowDetail = ShowDetail;
})(window.App);
