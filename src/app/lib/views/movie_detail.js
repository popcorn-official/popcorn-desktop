(function(App) {
    "use strict";

    var MovieDetail = Backbone.Marionette.ItemView.extend({
        template: '#movie-detail-tpl',
        className: 'movie-detail',

        onShow: function() {
            console.log('Show movie detail', this.model);
        }
    });

    App.View.MovieDetail = MovieDetail;
})(window.App);