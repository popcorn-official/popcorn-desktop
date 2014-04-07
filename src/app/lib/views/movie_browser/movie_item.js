(function(App) {
    "use strict";

    var MovieItem = Backbone.Marionette.ItemView.extend({
        template: '#movie-item-tpl',

        tagName: 'li',
        className: 'movie-item',

        ui: {
            coverIamge: '.cover-image',
            cover: '.cover'
        },

        onShow: function() {
            this.ui.coverIamge.on('load', _.bind(this.showCover, this));
        },

        onClose: function() {
            this.ui.coverIamge.off('load');
        },

        showCover: function() {
            this.ui.cover.css('background-image', 'url(' + this.model.get('image') + ')');
            this.ui.coverIamge.remove();
        }
    });

    App.View.MovieItem = MovieItem;
})(window.App);