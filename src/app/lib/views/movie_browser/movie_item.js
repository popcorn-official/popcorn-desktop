(function(App) {
    'use strict';
     
    var MovieItem = Backbone.Marionette.ItemView.extend({
        template: '#movie-item-tpl',

        tagName: 'li',
        className: 'movie-item',

        ui: {
            coverImage: '.cover-image',
            cover: '.cover',
            bookmarkIcon: '.actions-favorites'
        },

        events: {
            'click .actions-favorites': 'toggleFavorite',
            'click .cover': 'showDetail'
        },

        onShow: function() {

            // is boorkmarked or not ?
            var that = this;
            Database.getBookmark(this.model.get('imdb'), function(err, value) {
                if (!err) {

                    that.model.set('bookmarked', value);

                    if (value === true) {
                        that.ui.bookmarkIcon.addClass('selected');
                    }
                } else {
                    that.model.set('bookmarked', false);
                }
                    
            });            
            this.ui.coverImage.on('load', _.bind(this.showCover, this));
        },

        onClose: function() {
            this.ui.coverImage.off('load');
        },

        showCover: function() {
            this.ui.cover.css('background-image', 'url(' + this.model.get('image') + ')');
            this.ui.cover.css('opacity', '1');
            this.ui.coverImage.remove();
        },
        showDetail: function(e) {
            e.preventDefault();

            this.model.set('imdb_id', this.model.get('ImdbCode'));
            this.model.set('rating', this.model.get('MovieRating'));
            this.model.set('health', false);

            App.vent.trigger('movie:showDetail', this.model);

        },

        toggleFavorite: function(e) {
            e.stopPropagation();
            e.preventDefault();
            var that = this;
            if (this.model.get('bookmarked') === true) {
                Database.deleteBookmark(this.model.get('imdb'), function(err, data) {
                    console.log('Bookmark deleted');
                    that.model.set('bookmarked', false);

                        that.ui.bookmarkIcon.removeClass('selected');

                    // we'll make sure we dont have a cached movie
                    Database.deleteMovie(that.model.get('imdb'),function(err, data) {});
                });
            } else {

                // we need to have this movie cached
                // for bookmarking
                var movie = {
                    imdb: this.model.get('imdb'),
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
                };

                Database.addMovie(movie, function(error,result) {
                    Database.addBookmark(that.model.get('imdb'), 'movie', function(err, data) {
                        console.log('Bookmark added');



                        that.ui.bookmarkIcon.addClass('selected');


                        that.model.set('bookmarked', true);


                    });
                });

            }
        }

    });

    App.View.MovieItem = MovieItem;
})(window.App);