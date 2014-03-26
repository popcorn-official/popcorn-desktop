(function(App) {
    "use strict";

    var MovieBrowser = Backbone.View.extend({
        className: 'movie-browser',

        initialize: function() {
            this.categoryList = new App.View.CategoryList({
                el: this.$('.category-list'),
                model: App.Config.categories
            });
        },

        render: function() {
            this.categoryList.render();
        }
    });

    App.View.MovieBrowser = MovieBrowser;
})(window.App);