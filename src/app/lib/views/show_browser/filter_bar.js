(function(App) {
    "use strict";

    var FilterBarShow = Backbone.Marionette.ItemView.extend({
        template: '#filter-bar-show-tpl',
        className: 'filter-bar',
        ui: {
            searchForm: '.search form',
            search: '.search input',
        },
        events: {
            'submit @ui.searchForm': 'search',
            'click .showMovies': 'showMovies',
            'click .showShows': 'showShows',
            'click .settings': 'settings'
        },

        settings: function(e) {
            App.vent.trigger('settings:show');          
        },

        showShows: function(e) {
            e.preventDefault();
            App.vent.trigger('shows:list', []);
        },

        showMovies: function(e) {
            e.preventDefault();
            App.vent.trigger('movies:list', []);
        },

        search: function(e) {
            e.preventDefault();
            this.model.set({
                keywords: this.ui.search.val()
            });
            
            this.ui.search.val('');
            this.ui.search.blur();
        },
               
    });

    App.View.FilterBarShow = FilterBarShow;
})(window.App);