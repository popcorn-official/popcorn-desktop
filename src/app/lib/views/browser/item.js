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

            var imdb = this.model.get('imdb_id'),
                bookmarked = App.userBookmarks.indexOf(imdb) !== -1,
                itemtype = this.model.get('type'),
                images = this.model.get('images'),
                img = (images) ? images.poster : this.model.get('image'),
                watched, cached, that = this;

            switch (itemtype) {
                case 'bookmarkedshow':
                    watched = App.watchedShows.indexOf(imdb) !== -1;
                    this.model.set('image', resizeImage(img, '300'));
                    break;
                case 'show':
                    watched = App.watchedShows.indexOf(imdb) !== -1;
                    images.poster = resizeImage(img, '300');
                    break;
                case 'bookmarkedmovie':
                case 'movie':
                    watched = App.watchedMovies.indexOf(imdb) !== -1;
                    this.model.set('image', resizeImage(img, '300'));
                    break;
            }
            this.model.set('watched', watched);
            this.model.set('bookmarked', bookmarked);
        },

        onShow: function() {

        },

        onRender: function() {
            var itemtype = this.model.get('type');
            if (itemtype === 'show' || itemtype === 'bookmarkedshow' || itemtype === 'historyshow') {
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
            var itemtype = this.model.get('type');
            switch (itemtype) {
                case 'bookmarkedmovie':
                    if (this.model.get('watched')) {
                        this.ui.watchedIcon.addClass('selected');
                        switch (Settings.watchedCovers) {
                            case 'fade':
                            case 'hide':
                                this.$el.addClass('watched');
                                break;
                        }
                    }
                    this.ui.cover.css('background-image', 'url(' + this.model.get('image') + ')').addClass('fadein');
                    this.ui.bookmarkIcon.addClass('selected');
                    break;
                case 'bookmarkedshow':
                    this.ui.cover.css('background-image', 'url(' + this.model.get('image') + ')').addClass('fadein');
                    this.ui.bookmarkIcon.addClass('selected');
                    break;
                case 'movie':
                    this.ui.cover.css('background-image', 'url(' + this.model.get('image') + ')').addClass('fadein');

                    if (this.model.get('watched')) {
                        this.ui.watchedIcon.addClass('selected');
                        switch (Settings.watchedCovers) {
                            case 'fade':
                                this.$el.addClass('watched');
                                break;
                            case 'hide':
                                this.$el.remove();
                                break;
                        }
                    }
                    if (this.model.get('bookmarked')) {
                        this.ui.bookmarkIcon.addClass('selected');
                    }
                    break;
                case 'show':
                    this.ui.cover.css('background-image', 'url(' + this.model.get('images').poster + ')').addClass('fadein');

                    if (this.model.get('bookmarked')) {
                        this.ui.bookmarkIcon.addClass('selected');
                    }
                    break;
            }
            this.ui.coverImage.remove();

        },

        showDetail: function(e) {
            e.preventDefault();

            switch (this.model.get('type')) {
                case 'bookmarkedmovie':
                    var SelectedMovie = new Backbone.Model({
                        imdb_id: this.model.get('imdb_id'),
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
                    break;

                case 'movie':
                    this.model.set('imdb_id', this.model.get('imdb_id'));
                    this.model.set('health', false);

                    App.vent.trigger('movie:showDetail', this.model);
                    break;
                case 'bookmarkedshow':
                case 'show':
                    $('.spinner').show();
                    var provider = App.Providers.get(this.model.get('provider'));
                    var data = provider.detail(this.model.get('imdb_id'), function(err, data) {
                        data.provider = provider.name;
                        $('.spinner').hide();
                        if (!err) {
                            App.vent.trigger('show:showDetail', new Backbone.Model(data));
                        } else {
                            alert('Somethings wrong... try later');
                        }
                    });
                    break;

            }

        },

        toggleWatched: function(e) {
            e.stopPropagation();
            e.preventDefault();
            var that = this;
            if (this.model.get('watched')) {
                this.ui.watchedIcon.removeClass('selected');
                if (Settings.watchedCovers === 'fade') {
                    this.$el.removeClass('watched');
                }
                Database.markMovieAsNotWatched({
                    imdb_id: this.model.get('imdb_id')
                }, true, function(err, data) {
                    that.model.set('watched', false);
                    App.watchedMovies.splice(App.watchedMovies.indexOf(that.model.get('imdb_id')), 1);
                });
            } else {
                this.ui.watchedIcon.addClass('selected');
                switch (Settings.watchedCovers) {
                    case 'fade':
                        this.$el.addClass('watched');
                        break;
                    case 'hide':
                        this.$el.remove();
                        break;
                }
                Database.markMovieAsWatched({
                    imdb_id: this.model.get('imdb_id'),
                    from_browser: true
                }, true, function(err, data) {
                    that.model.set('watched', true);
                    App.watchedMovies.push(that.model.get('imdb_id'));
                });

            }
        },

        toggleFavorite: function(e) {
            e.stopPropagation();
            e.preventDefault();
            var that = this;

            switch (this.model.get('type')) {
                case 'bookmarkedshow':
                case 'bookmarkedmovie':
                    Database.deleteBookmark(this.model.get('imdb_id'), function(err, data) {
                        App.userBookmarks.splice(App.userBookmarks.indexOf(that.model.get('imdb_id')), 1);
                        win.info('Bookmark deleted (' + that.model.get('imdb_id') + ')');
                        if (that.model.get('type') === 'movie') {
                            // we'll make sure we dont have a cached movie
                            Database.deleteMovie(that.model.get('imdb_id'), function(err, data) {});
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
                    break;

                case 'movie':
                    if (this.model.get('bookmarked')) {
                        this.ui.bookmarkIcon.removeClass('selected');
                        Database.deleteBookmark(this.model.get('imdb_id'), function(err, data) {
                            win.info('Bookmark deleted (' + that.model.get('imdb_id') + ')');
                            App.userBookmarks.splice(App.userBookmarks.indexOf(that.model.get('imdb_id')), 1);

                            // we'll make sure we dont have a cached movie
                            Database.deleteMovie(that.model.get('imdb_id'), function(err, data) {
                                that.model.set('bookmarked', false);
                            });
                        });
                    } else {
                        var movie = {
                            imdb_id: this.model.get('imdb_id'),
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
                            Database.addBookmark(that.model.get('imdb_id'), 'movie', function(err, data) {
                                win.info('Bookmark added (' + that.model.get('imdb_id') + ')');
                                App.userBookmarks.push(that.model.get('imdb_id'));
                                that.model.set('bookmarked', true);
                            });
                        });
                    }
                    break;
                case 'show':
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
                        this.model.set('bookmarked', true);
                        this.ui.bookmarkIcon.addClass('selected');
                        var provider = App.Providers.get(this.model.get('provider'));
                        var data = provider.detail(this.model.get('imdb_id'), function(err, data) {
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
                    break;

            }

        }

    });

    App.View.Item = Item;
})(window.App);