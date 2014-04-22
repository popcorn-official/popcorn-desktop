(function(App) {
    "use strict";
     
    var ShowItem = Backbone.Marionette.ItemView.extend({
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
                    rating: this.model.get('MovieRating')
                }
            );

            App.vent.trigger('movie:showDetail', SelectedMovie);
            
        }
    });

    App.View.ShowItem = ShowItem;
})(window.App);