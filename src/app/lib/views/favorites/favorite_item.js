(function(App) {
    'use strict';

    var prevX = 0;
    var prevY = 0;

    var resizeImage = App.Providers.Trakttv.resizeImage;

    var FavoriteItem = Backbone.Marionette.ItemView.extend({
        template: '#item-tpl',

        tagName: 'li',
        className: 'item',

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
            this.ui.bookmarkIcon.addClass('selected');
            this.ui.coverImage.on('load', _.bind(this.showCover, this));
        },

        onClose: function() {
            this.ui.coverImage.off('load');
        },

        showCover: function() {
            this.ui.cover.css('background-image', 'url(' + this.model.get('image') + ')').addClass('fadein');
            this.ui.coverImage.remove();

            if (this.model.get('type') === 'movie') {
                var watched = App.watchedMovies.indexOf(this.model.get('imdb')) !== -1;
                this.model.set('watched', watched);
                if (watched) {
                    this.ui.watchedIcon.addClass('selected');
                    if (Settings.fadeWatchedCovers) {
                        this.$el.addClass('watched');
                    }
                }
            } else {
                this.ui.watchedIcon.hide();
            }

        },

        hoverItem: function(e) {
            if (e.pageX !== prevX || e.pageY !== prevY) {
                $('.item.selected').removeClass('selected');
                $(this.el).addClass('selected');
                prevX = e.pageX;
                prevY = e.pageY;
            }
        },

        toggleWatched: function(e) {
            e.stopPropagation();
            e.preventDefault();
            var that = this;
            if (this.model.get('watched')) {
                this.ui.watchedIcon.removeClass('selected');
                if (Settings.fadeWatchedCovers) {
                    this.$el.removeClass('watched');
                }
                Database.markMovieAsNotWatched({
                    imdb_id: this.model.get('imdb')
                }, true, function(err, data) {
                    that.model.set('watched', false);
                    App.watchedMovies.splice(App.watchedMovies.indexOf(that.model.get('imdb')), 1);
                });
            } else {
                this.ui.watchedIcon.addClass('selected');
                if (Settings.fadeWatchedCovers) {
                    this.$el.addClass('watched');
                }
                Database.markMovieAsWatched({
                    imdb_id: this.model.get('imdb'),
                    from_browser: true
                }, true, function(err, data) {
                    that.model.set('watched', true);
                    App.watchedMovies.push(that.model.get('imdb'));
                });

            }
        },

        showDetail: function(e) {
            e.preventDefault();

            if (this.model.get('type') === 'movie') {

                var SelectedMovie = new Backbone.Model({
                    imdb: this.model.get('imdb'),
                    image: this.model.get('image'),
                    torrents: this.model.get('torrents'),
                    title: this.model.get('title'),
                    genre: this.model.get('genre'),
                    synopsis: this.model.get('synopsis'),
                    runtime: this.model.get('runtime'),
                    year: this.model.get('year'),
                    health: this.model.get('health'),
                    subtitle: this.model.get('subtitle'),
                    backdrop: this.model.get('backdrop'),
                    rating: this.model.get('rating'),
                    trailer: this.model.get('trailer'),
                    provider: this.model.get('provider'),
                    bookmarked: true,
                });

                App.vent.trigger('movie:showDetail', SelectedMovie);

            } else {

                // live call to api to get latest detail !
                $('.spinner').show();
                var provider = this.model.get('provider'); //XXX(xaiki): provider hack
                var tvshow = App.Config.getProvider('tvshow')[provider];
                var data = tvshow.detail(this.model.get('imdb_id'), function(err, data) {
                    $('.spinner').hide();
                    if (!err) {
                        App.vent.trigger('show:showDetail', new Backbone.Model(data));
                    } else {
                        alert('Somethings wrong... try later');
                    }
                });

            }

        },

        toggleFavorite: function(e) {
            e.stopPropagation();
            e.preventDefault();
            var that = this;

            Database.deleteBookmark(this.model.get('imdb'), function(err, data) {
                App.userBookmarks.splice(App.userBookmarks.indexOf(that.model.get('imdb')), 1);
                win.info('Bookmark deleted (' + that.model.get('imdb') + ')');
                if (that.model.get('type') === 'movie') {
                    // we'll make sure we dont have a cached movie
                    Database.deleteMovie(that.model.get('imdb'), function(err, data) {});
                }

                // we'll delete this element from our list view
                $(e.currentTarget).closest('li').animate({
                    paddingLeft: '0px',
                    paddingRight: '0px',
                    width: '0%',
                    opacity: 0
                }, 500, function() {
                    $(this).remove();
                    $('.items').append($('<li/>').addClass('item ghost'));
                    if ($('.items li').length === 0) {
                        App.vent.trigger('movies:list', []);
                    }
                });
            });
        }
    });

    App.View.FavoriteItem = FavoriteItem;
})(window.App);