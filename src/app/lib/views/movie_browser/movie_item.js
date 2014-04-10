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

        events: {
            'click .cover': 'showDetail'
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
        },

        showDetail: function() {
            // Small hack to play the video until we have a detail window
            var torrents = this.model.get('torrents');
            var torrentUrl = torrents['720p'].url;
            App.vent.trigger('stream:start', torrentUrl);
        }
    });

    App.View.MovieItem = MovieItem;
})(window.App);