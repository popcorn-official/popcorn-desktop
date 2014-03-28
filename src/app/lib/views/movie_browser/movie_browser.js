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

        regions: {
            CategoryList: '.category-list',
            MovieList: '.movie-list'
        },

        initialize: function() {
            /*this.movieCollection = new App.Config.Provider.Movies();

            // Fetch default category movie:
            this.movieCollection.fetch({
                category: App.Config.categories[0]
            });*/
        },

        onShow: function() {
            this.CategoryList.show(new App.View.CategoryList({
                model: App.Config.categories
            }));

            /*this.CategoryList.show(new App.View.MovieList({
                model: movieCollection
            }));*/
        }
    });

    App.View.MovieBrowser = MovieBrowser;
})(window.App);