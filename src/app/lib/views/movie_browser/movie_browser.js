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
                filter: {
                    category: App.Config.categories[0]
                }
            });

            // Fetch default category movie:
            this.movieCollection.fetch();
        },

        onShow: function() {
            var filterView = new App.View.FilterBar({
                categories: App.Config.categories
            });
            this.listenTo(filterView, 'search', this.onSearch);
            this.FilterBar.show(filterView);

            this.MovieList.show(new App.View.MovieList({
                collection: this.movieCollection
            }));
        },

        onSearch: function(keywords) {
            this.updateMovieList({
                keywords: keywords
            });
        },

        updateMovieList: function(filter) {
            this.movieCollection = new App.Model.MovieCollection([], {filter:filter});

            // Fetch default category movie:
            this.movieCollection.fetch();

            this.MovieList.show(new App.View.MovieList({
                collection: this.movieCollection
            }));
        }
    });

    App.View.MovieBrowser = MovieBrowser;
})(window.App);