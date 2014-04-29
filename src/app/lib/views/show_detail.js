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
            'click #tabs_season li.saisonSwitch a': 'clickTab'
        },

        onShow: function() {
            this.ui.seasonsList.first().attr("id","current_season"); // Activate first tab
            this.ui.tabsContainer.fadeOut(); // hide all tabs tabs_container
            this.ui.tabsContainer.first().fadeIn(); // Show first tab tabs_container   
            $(".filter-bar").hide();         
        },

        startStreaming: function(e) {
            e.preventDefault();
            var torrentStart = new Backbone.Model({torrent: $(e.currentTarget).attr('data-torrent'), backdrop: this.model.get('images').fanart});
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
            if ($(e.currentTarget).attr("id") != "current_season"){           
                this.ui.tabsContainer.hide(); //Hide all tabs_container
                this.ui.seasonsList.attr("id",""); //Reset id's
                $(e.currentTarget).parent().attr("id","current_season"); // Activate this
                $( $(e.currentTarget).attr('href')).fadeIn(); // Show tabs_container for current tab
            }
            $(".filter-bar").show(); 
        },



    });

    App.View.ShowDetail = ShowDetail;
})(window.App);
