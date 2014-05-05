(function(App) {
    "use strict";

    var FilterBarFavorite = Backbone.Marionette.ItemView.extend({
        template: '#filter-bar-favorite-tpl',
        className: 'filter-bar',

        events: {
            'click .settings': 'settings',
            'click .showMovies': 'showMovies',
            'click .showShows': 'showShows',
            'click .favorites': 'showFavorites'
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

        showFavorites: function(e) {
            e.preventDefault();
            App.vent.trigger('favorites:list', []);
        },

    });

    App.View.FilterBarFavorite = FilterBarFavorite;
})(window.App);