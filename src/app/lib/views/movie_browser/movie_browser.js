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
    var MovieBrowser = Backbone.View.extend({
        className: 'movie-browser',

        initialize: function() {
            this.categoryList = new App.View.CategoryList({
                el: this.$('.category-list'),
                model: App.Config.categories
            });

            this.movieCollection = new App.Config.Provider.Movies();
            this.movieList = new App.View.MovieList({
                el: this.$('.movie-list'),
                model: this.movieCollection
            });

            // Fetch default category movie:
            this.movieCollection.fetch({
                category: App.Config.categories[0]
            });
        },

        render: function() {
            this.categoryList.render();
        }
    });

    App.View.MovieBrowser = MovieBrowser;
})(window.App);