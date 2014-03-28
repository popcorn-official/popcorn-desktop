(function(App) {
    "use strict";

    var MovieList = Backbone.Marionette.CompositeView.extend({
        template: '#movie-list-tpl',

        ui: {
            spinner: '.spinner'
        },

        initialize: function() {
            this.listenTo(this.model, 'loading', this.onLoading);
            this.listenTo(this.model, 'loaded', this.onLoaded);
        },

        onShow: function() {
            if(this.model.state === 'loading') {
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