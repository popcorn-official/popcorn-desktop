(function(App) {
    "use strict";
     
    var MovieItem = Backbone.Marionette.ItemView.extend({
        template: '#movie-item-tpl',

        tagName: 'li',
        className: 'movie-item',

        ui: {
            coverImage: '.cover-image',
            cover: '.cover'
        },

        events: {
            'click .cover': 'showDetail'
        },

        onShow: function() {
            this.ui.coverImage.on('load', _.bind(this.showCover, this));
        },

        onClose: function() {
            this.ui.coverImage.off('load');
        },

        showCover: function() {


           this.ui.cover.css('background-image', 'url(' + this.model.get('image') + ')');
            this.ui.coverImage.remove();
        },
        showDetail: function() {

            var SelectedMovie = new Backbone.Model(
                {
                    image: this.model.get('image'),
                    torrents: this.model.get('torrents'),
                    title: this.model.get('title'),
                    synopsis: this.model.get('synopsis'),
                    runtime: this.model.get('runtime'),
                    year: this.model.get('year'),
                    health: this.model.get('health'),
                    subtitle: this.model.get('subtitle'),
                    backdrop: this.model.get('backdrop'),
                    rating: this.model.get('MovieRating'),
                    trailer: this.model.get('trailer')
                }
            );
            App.vent.trigger('movie:showDetail', SelectedMovie);
        }
    });

    App.View.MovieItem = MovieItem;
})(window.App);