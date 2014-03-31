(function(App) {
    "use strict";

    /**
     * Manage movie browsing:
     *  * Create filter views
     *  * Create movie list
     *  * Fetch new movie collection and pass them to the movie list view
     *  * Show movie detail
     *  * Start playing a movie
     */
    var MovieBrowser = Backbone.Marionette.Layout.extend({
        template: '#movie-browser-tpl',
        className: 'movie-browser',

        regions: {
            FilterBar: '.filter-bar-region',
            MovieList: '.movie-list-region'
        },

        initialize: function() {
            this.movieCollection = new App.Model.MovieCollection([], {
                category: App.Config.categories[0]
            });

            // Fetch default category movie:
            this.movieCollection.fetch();
        },

        onShow: function() {
            this.FilterBar.show(new App.View.FilterBar({
                categories: App.Config.categories
            }));

            this.MovieList.show(new App.View.MovieList({
                collection: this.movieCollection
            }));
        }
    });

    App.View.MovieBrowser = MovieBrowser;
})(window.App);