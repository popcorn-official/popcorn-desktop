(function(App) {
    "use strict";

    var MovieList = Backbone.Marionette.CompositeView.extend({
        template: '#movie-list-tpl',

        tagName: 'ul',
        className: 'movie-list',

        itemView: App.View.MovieItem,
        itemViewContainer: '.movies',

        ui: {
            spinner: '.spinner'
        },

        initialize: function() {
            this.listenTo(this.collection, 'loading', this.onLoading);
            this.listenTo(this.collection, 'loaded', this.onLoaded);
        },

        onShow: function() {
            if(this.collection.state === 'loading') {
                this.onLoading();
            }
        },

        onLoading: function() {
            this.ui.spinner.show();
        },

        onLoaded: function() {
            this.ui.spinner.hide();
        }
    });

    App.View.MovieList = MovieList;
})(window.App);