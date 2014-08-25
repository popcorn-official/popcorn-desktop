(function(App) {
    'use strict';

    var prevX = 0;
    var prevY = 0;

    var resizeImage = App.Providers.Trakttv.resizeImage;

    var Item = Backbone.Marionette.ItemView.extend({
        template: '#item-tpl',

        tagName: 'li',
        className: 'item',

        ui: {
            coverImage: '.cover-image',
            cover: '.cover',
            bookmarkIcon: '.actions-favorites',
            watchedIcon: '.actions-watched'
        },
        modelEvents: {
            'change': 'render'
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
            if (this.model.get('type') == 'movie') {

                var bookmarked = App.userBookmarks.indexOf(this.model.get('imdb')) !== -1;
                var watched = App.watchedMovies.indexOf(this.model.get('imdb')) !== -1;
                this.model.set('watched', watched);

            } else {
                var bookmarked = App.userBookmarks.indexOf(this.model.get('imdb_id')) !== -1;
            }

            this.model.set('bookmarked', bookmarked);

        },

        onRender: function() {
            if (this.model.get('type') == 'show') {
                this.ui.watchedIcon.remove();
            }
            this.ui.coverImage.on('load', _.bind(this.showCover, this));
        },

        onClose: function() {
            this.ui.coverImage.off('load');
        },

        hoverItem: function(e) {
            if (e.pageX !== prevX || e.pageY !== prevY) {
                $('.item.selected').removeClass('selected');
                $(this.el).addClass('selected');
                prevX = e.pageX;
                prevY = e.pageY;
            }
        },

        showCover: function() {
            if (this.model.get('type') == 'movie') {
                this.ui.cover.css('background-image', 'url(' + this.model.get('image') + ')').addClass('fadein');
            } else {
                this.ui.cover.css('background-image', 'url(' + this.model.get('images').poster + ')').addClass('fadein');
            }

            if (this.model.get('watched')) {
                this.ui.watchedIcon.addClass('selected');
                if (Settings.fadeWatchedCovers) {
                    this.$el.addClass('watched');
                }
            }
            if (this.model.get('bookmarked')) {
                this.ui.bookmarkIcon.addClass('selected');
            }
            this.ui.coverImage.remove();

        },

        showDetail: function(e) {
            e.preventDefault();
            if (this.model.get('type') == 'movie') {
                this.model.set('imdb_id', this.model.get('imdb'));
                this.model.set('health', false);

                App.vent.trigger('movie:showDetail', this.model);
            } else {
                $('.spinner').show();
                var provider = this.model.get('provider'); //XXX(xaiki): provider hack
                var tvshow = App.Config.getProvider('tvshow')[provider];
                var data = tvshow.detail(this.model.get('imdb_id'), function(err, data) {
                    data.provider = provider;
                    $('.spinner').hide();
                    if (!err) {
                        App.vent.trigger('show:showDetail', new Backbone.Model(data));
                    } else {
                        alert('Somethings wrong... try later');
                    }
                });

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

        toggleFavorite: function(e) {
            e.stopPropagation();
            e.preventDefault();
            var that = this;
            if (this.model.get('type') == 'movie') {
                if (this.model.get('bookmarked')) {
                    this.ui.bookmarkIcon.removeClass('selected');
                    Database.deleteBookmark(this.model.get('imdb'), function(err, data) {
                        win.info('Bookmark deleted (' + that.model.get('imdb') + ')');
                        App.userBookmarks.splice(App.userBookmarks.indexOf(that.model.get('imdb')), 1);

                        // we'll make sure we dont have a cached movie
                        Database.deleteMovie(that.model.get('imdb'), function(err, data) {
                            that.model.set('bookmarked', false);
                        });
                    });
                } else {
                    this.ui.bookmarkIcon.addClass('selected');
                    // we need to have this movie cached
                    // for bookmarking
                    var movie = {
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
                    };

                    Database.addMovie(movie, function(error, result) {
                        Database.addBookmark(that.model.get('imdb'), 'movie', function(err, data) {
                            win.info('Bookmark added (' + that.model.get('imdb') + ')');
                            App.userBookmarks.push(that.model.get('imdb'));
                            that.model.set('bookmarked', true);
                        });
                    });

                }
            } else {

                if (this.model.get('bookmarked') === true) {
                    this.ui.bookmarkIcon.removeClass('selected');
                    Database.deleteBookmark(this.model.get('imdb_id'), function(err, data) {
                        win.info('Bookmark deleted (' + that.model.get('imdb_id') + ')');
                        that.model.set('bookmarked', false);
                        App.userBookmarks.splice(App.userBookmarks.indexOf(that.model.get('imdb_id')), 1);

                        // we'll make sure we dont have a cached show
                        Database.deleteTVShow(that.model.get('imdb_id'), function(err, data) {});
                    });
                } else {
                    this.ui.bookmarkIcon.addClass('selected');
                    var provider = this.model.get('provider'); //XXX(xaiki): provider hack
                    var tvshow = App.Config.getProvider('tvshow')[provider];
                    var data = tvshow.detail(this.model.get('imdb_id'), function(err, data) {
                        if (!err) {
                            data.provider = that.model.get('provider');
                            Database.addTVShow(data, function(err, idata) {
                                Database.addBookmark(that.model.get('imdb_id'), 'tvshow', function(err, data) {
                                    win.info('Bookmark added (' + that.model.get('imdb_id') + ')');
                                    that.model.set('bookmarked', true);
                                    App.userBookmarks.push(that.model.get('imdb_id'));
                                });
                            });

                        } else {
                            alert('Somethings wrong... try later');
                        }
                    });
                }

            }

        }

    });

    App.View.Item = Item;
})(window.App);