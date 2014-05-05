(function(App) {
    "use strict";
     
    var FavoriteItem = Backbone.Marionette.ItemView.extend({
        template: '#favorite-item-tpl',

        tagName: 'li',
        className: 'movie-item',

        ui: {
            coverImage: '.cover-image',
            cover: '.cover'
        },

        events: {
            'click .favorites': 'toggleFavorite',
            'click .cover': 'showDetail'
        },

        initialize: function() {
            // is boorkmarked or not ?
            var that = this;
            Database.getBookmark(this.model.get('imdb'), function(err, value) {
                if (!err)
                    that.model.set('bookmarked', value);
                else 
                    that.model.set('bookmarked', false);
            })
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
        showDetail: function(e) {
            e.preventDefault();

            if (this.model.get('type') == 'movie') {

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
                        trailer: this.model.get('trailer'),
                        bookmarked: this.model.get('bookmarked'),
                    }
                );

                App.vent.trigger('movie:showDetail', SelectedMovie);                

            } else {
                Database.getTVShowByImdb(this.model.get("imdb"), function(err, data) {
                    // we send our DB data to our view
                    App.vent.trigger('show:showDetail', new Backbone.Model(data));
                });
            }

        },

        toggleFavorite: function(e) {
            e.preventDefault();
            var that = this;
         
            Database.deleteBookmark(this.model.get('imdb'), function(err, data) {
                that.model.set('bookmarked', false);

                if (that.model.get('type') == 'movie')
                    // we'll make sure we dont have a cached movie
                    Database.deleteMovie(that.model.get('imdb'),function(err, data) {})

                // we'll delete this element from our list view
                $(e.currentTarget).closest( "li" ).remove();

            })
            
        }

    });

    App.View.FavoriteItem = FavoriteItem;
})(window.App);