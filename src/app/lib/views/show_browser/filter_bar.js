(function(App) {
    "use strict";

    var FilterBarShow = Backbone.Marionette.ItemView.extend({
        template: '#filter-bar-show-tpl',
        className: 'filter-bar',

        events: {
            'click .showMovies': 'showMovies',
            'click .showShows': 'showShows',
            'click .settings': 'settings'
        },

        settings: function(e) {
            e.preventDefault();
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

               
    });

    App.View.FilterBarShow = FilterBarShow;
})(window.App);