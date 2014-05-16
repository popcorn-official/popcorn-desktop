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
        events: {
            'keypress': 'focusSearch',
        },
        regions: {
            FilterBar: '.filter-bar-region',
            MovieList: '.movie-list-region'
        },

        initialize: function() {
            this.filter = new App.Model.Filter({
                genres: App.Config.genres,
                sorters: App.Config.sorters
            });

            this.movieCollection = new App.Model.MovieCollection([], {
                filter: this.filter
            });

            // Fetch default category movie:
            this.movieCollection.fetch();

            this.listenTo(this.filter, 'change', this.onFilterChange);
        },

        onShow: function() {
            this.bar = new App.View.FilterBarMovie({
                model: this.filter
            });

            this.FilterBar.show(this.bar);

            this.MovieList.show(new App.View.MovieList({
                collection: this.movieCollection
            }));
        },

        onFilterChange: function() {
            this.movieCollection = new App.Model.MovieCollection([], {
                filter: this.filter
            });

            // Fetch default category movie:
            this.movieCollection.fetch();
            App.vent.trigger('movie:closeDetail');
            this.MovieList.show(new App.View.MovieList({
                collection: this.movieCollection
            }));
        },

        focusSearch: function (e){
            this.bar.focusSearch();
        }
    });

    App.View.MovieBrowser = MovieBrowser;
})(window.App);
