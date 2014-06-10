(function(App) {
    'use strict';

    var prevX = 0;
    var prevY = 0;

    var resizeImage = App.Providers.Trakttv.resizeImage;
     
    var MovieItem = Backbone.Marionette.ItemView.extend({
        template: '#movie-item-tpl',
        modelEvents: {
            'change': 'render'
        },

        tagName: 'li',
        className: 'movie-item',

        ui: {
            coverImage: '.cover-image',
            cover: '.cover',
            bookmarkIcon: '.actions-favorites',
            watchedIcon: '.actions-watched'
        },

        events: {
            'click .actions-favorites': 'toggleFavorite',
            'click .actions-watched': 'toggleWatched',
            'click .cover': 'showDetail',
            'mouseover .cover': 'hoverItem'
        },

        initialize: function() {
            this.model.set('image', resizeImage(this.model.get('image'), '300'));
        },

        onShow: function() {    
            var bookmarked = App.userBookmarks.indexOf(this.model.get('imdb')) !== -1;
            var watched = App.watchedMovies.indexOf(this.model.get('imdb')) !== -1;
            this.model.set('bookmarked', bookmarked);
            this.model.set('watched', watched);
            this.ui.coverImage.on('load', _.bind(this.showCover, this));
        },

        onRender: function() {
            var bookmarked = this.model.get('bookmarked');
            var watched = this.model.get('watched');

            if (bookmarked) {
                this.ui.bookmarkIcon.addClass('selected');
            }
            else {
                this.ui.bookmarkIcon.removeClass('selected');
            }

            if (watched) {
                this.ui.watchedIcon.addClass('selected');
            }
            else {
                this.ui.watchedIcon.removeClass('selected');
            }

            this.showCover();
        },

        onClose: function() {
            this.ui.coverImage.off('load');
        },

        hoverItem: function(e) {
            if(e.pageX !== prevX || e.pageY !== prevY) {
                $('.movie-item.selected').removeClass('selected');
                $(this.el).addClass('selected');
                prevX = e.pageX;
                prevY = e.pageY;
            }
        },

        showCover: function() {
            this.ui.cover.css('background-image', 'url(' + this.model.get('image') + ')');
            this.ui.cover.css('opacity', '1');
            this.ui.coverImage.remove();
        },

        showDetail: function(e) {
            e.preventDefault();

            this.model.set('imdb_id', 'tt'+this.model.get('imdb'));
            this.model.set('health', false);

            App.vent.trigger('movie:showDetail', this.model);

        },

        toggleWatched: function(e) {
            e.stopPropagation();
            e.preventDefault();
            var that = this;
            if (this.model.get('watched') === true) {
                Database.markMovieAsNotWatched({imdb_id: this.model.get('imdb')}, function(err, data) {
                    that.model.set('watched', false);
                    App.watchedMovies.splice(App.watchedMovies.indexOf(that.model.get('imdb'), 1));
                });
            } else {

                Database.markMovieAsWatched({
                    imdb_id: this.model.get('imdb'),
                    from_browser: true
                }, function(err, data) {
                    that.model.set('watched', true);
                    App.watchedMovies.push(that.model.get('imdb'));
                });

            }
        },

        toggleFavorite: function(e) {
            e.stopPropagation();
            e.preventDefault();
            var that = this;
            if (this.model.get('bookmarked') === true) {
                Database.deleteBookmark(this.model.get('imdb'), function(err, data) {
                    console.log('Bookmark deleted');
                    App.userBookmarks.splice(App.userBookmarks.indexOf(that.model.get('imdb'), 1));

                    // we'll make sure we dont have a cached movie
                    Database.deleteMovie(that.model.get('imdb'),function(err, data) {
                        that.model.set('bookmarked', false);
                    });
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
                    rating: this.model.get('rating'),
                    trailer: this.model.get('trailer'),
                };

                Database.addMovie(movie, function(error,result) {
                    Database.addBookmark(that.model.get('imdb'), 'movie', function(err, data) {
                        console.log('Bookmark added');
                        that.model.set('bookmarked', true);

                    });
                });

            }
        }

    });

    App.View.MovieItem = MovieItem;
})(window.App);