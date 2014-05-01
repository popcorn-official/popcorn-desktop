(function(App) {
    "use strict";
        

    var ShowDetail = Backbone.Marionette.ItemView.extend({
        template: '#show-detail-tpl',
        className: 'shows-container-contain',

        ui: {
            tabsContainer: "#tabs_container div",
            seasonsList: "#tabs_season li"
        },
        events: {
            'click .startStreaming': 'startStreaming',
            'click .tv-container-close': 'closeDetails',
            'click #tabs_season li': 'clickTab',
            'click .EpisodeData': 'clickEpisode',
        },

        onShow: function() {
            this.ui.seasonsList.first().attr("id","current_season"); // Activate first tab
            this.ui.tabsContainer.fadeOut(); // hide all tabs tabs_container
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
            var tab_id = $(e.currentTarget).attr('data-tab');

            $('#tabs_season li').removeClass('active');
            $('.tabs-episode').removeClass('current');
            $('.epidoseSummary').removeClass('active');
            $(e.currentTarget).addClass('active');
            $("#"+tab_id).addClass('current');
        },

         clickEpisode: function(e) {
            e.preventDefault();
            
            $('.epidoseSummary').removeClass('active');
            
            $(e.currentTarget).parent().addClass('active');
            $(".episode-info p").text('Episode '+$(e.currentTarget).attr('data-id'));
            $(".episode-info div").text('Resume of Episode '+$(e.currentTarget).children().val());

         },




    });

    App.View.ShowDetail = ShowDetail;
})(window.App);
