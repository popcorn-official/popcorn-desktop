(function (App) {
    'use strict';

    var prevX = 0;
    var prevY = 0;

    var Item = Marionette.View.extend({
        template: '#item-tpl',

        tagName: 'li',
        className: 'item',

        attributes: function () {
            return {
                'data-imdb-id': this.model.get('imdb_id')
            };
        },

        ui: {
          covers: '.cover-imgs',
          defaultCover: '.cover',
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

        initialize: function () {
            this.setModelStates();
            this.isAprilFools();
        },

        onAttach: function () {
            this.loadImage();
            this.setCoverStates();
            this.setTooltips();
        },

        hoverItem: function (e) {
            if (e.pageX !== prevX || e.pageY !== prevY) {
                $('.item.selected').removeClass('selected');
                $(this.el).addClass('selected');
                prevX = e.pageX;
                prevY = e.pageY;
            }
        },

        isAprilFools: function () {
            var date = new Date();
            var today = ('0' + (date.getMonth() + 　1)).slice(-2) + ('0' + (date.getDate())).slice(-2);
            if (today === '0401') { //april's fool
                var title = this.model.get('title');
                var titleArray = title.split(' ');
                var modified = false;
                var toModify;
                if (titleArray.length !== 1) {
                    for (var i = 0; i < titleArray.length; i++) {
                        if (titleArray[i].length > 3 && !modified) {
                            if (Math.floor((Math.random() * 10) + 1) > 5) { //random
                                titleArray[i] = Settings.projectName;
                                modified = true;
                            }
                        }
                    }
                }
                this.model.set('title', titleArray.join(' '));
            }
        },

        setModelStates: function () {
            var imdb = this.model.get('imdb_id');
            var itemtype = this.model.get('type');

            // Watched state
            var watched = false;

            if (itemtype.match('movie')) {
                watched = App.watchedMovies.indexOf(imdb) !== -1;
            } else if (itemtype.match('show')) {
                watched = App.watchedShows.indexOf(imdb) !== -1;
            }

            this.model.set('watched', watched);

            // Bookmarked state
            var bookmarked = App.userBookmarks.indexOf(imdb) !== -1;
            this.model.set('bookmarked', bookmarked);
        },

        setCoverStates: function () {
            var itemtype = this.model.get('type');

            if (this.model.get('bookmarked') || itemtype.match('bookmarked')) {
                this.ui.bookmarkIcon.addClass('selected');
            }

            if (this.model.get('watched') && !itemtype.match('show')) {
                this.ui.watchedIcon.addClass('selected');

                switch (Settings.watchedCovers) {
                    case 'fade':
                        this.$el.addClass('watched');
                        break;
                    case 'hide':
                        if ($('.search input').val() || itemtype.match('bookmarked')) {
                            this.$el.addClass('watched');
                        } else {
                            this.$el.remove();
                        }
                        break;
                }
            }

            if (itemtype.match('show')) {
                this.ui.watchedIcon.remove();
            }
        },

        loadImage: function () {
            var noimg = 'images/posterholder.png';
            var poster = this.model.get('image');
            if (!poster && this.model.get('images') && this.model.get('images').poster){
            poster = this.model.get('images').poster;
            } else {
            poster = this.model.get('poster') || noimg;
            }

            var setImage = function (img) {
                if (this.ui.cover.css) {
                this.ui.cover.css('background-image', 'url(' + img + ')').addClass('fadein');
                }
            }.bind(this);

            var posterCache = new Image();
            posterCache.src = poster;

            posterCache.onload = function () {
                if (poster.indexOf('.gif') !== -1) { // freeze gifs
                    var c = document.createElement('canvas');
                    var w  = c.width = posterCache.width;
                    var h = c.height = posterCache.height;

                    c.getContext('2d').drawImage(posterCache, 0, 0, w, h);
                    poster = c.toDataURL();
                }
                setImage(poster);
            };
            posterCache.onerror = function (e) {
                setImage(noimg);
            };
        },

        setTooltips: function () {
            this.ui.watchedIcon.attr('data-original-title', this.ui.watchedIcon.hasClass('selected') ? i18n.__('Mark as unseen') : i18n.__('Mark as Seen')).tooltip();
            this.ui.bookmarkIcon.attr('data-original-title', this.ui.bookmarkIcon.hasClass('selected') ? i18n.__('Remove from bookmarks') : i18n.__('Add to bookmarks')).tooltip();
        },

        showDetail: function (e) {
            e.preventDefault();

            var realtype = this.model.get('type');
            var itemtype = realtype.replace('bookmarked', '');
            var providers = this.model.get('providers') || [App.Providers.get(this.model.get('provider'))];
            var id = this.model.get(this.model.idAttribute);

            var promises = Object.values(providers).map(function (p) {
              if (realtype === 'show') {
                p = providers.torrent;
              }
                if (!p.detail) {
                    return false;
                }
                return p.detail(id, this.model.attributes);
            }.bind(this));

            // bookmarked movies are cached
            if (realtype === 'bookmarkedmovie') {
                return App.vent.trigger('movie:showDetail', this.model);
            }

            function allSettled(promises) {
                var wrappedPromises = promises.map(
                    p => Promise.resolve(p)
                        .then(val => ({ ok: true, value: val }),                                                err => ({ ok: false, reason: err })
                             ));
                return Promise.all(wrappedPromises);
            }

            // display the spinner
            $('.spinner').show();
            // XXX(xaiki): here we could optimise a detail call by marking
            // the models that already got fetched not too long ago, but we
            // actually use memoize in the providers code so it shouldn't be
            // necesary and we refresh the data anyway…
            return allSettled(promises).then(function (results) {
                $('.spinner').hide();

                results = results.reduce(function (a, c) {
                    if (c.ok) {
                        return a.concat(c.value);
                    }
                    return a;
                }, []);

                // XXX(xaiki): we merge all results into a single object,
                // this allows for much more than sub providers (language,
                // art, metadata) but is a little more fragile.
                var data = results.reduce(function (a, c) {
                    return Object.assign (a, c);
                }, {});

                // load details
                App.vent.trigger(itemtype + ':showDetail', this.model.set(data));
            }.bind(this))
                .catch(function (err) {
                    console.error('error showing detail:', err);
                    $('.spinner').hide();
                    $('.notification_alert').text(i18n.__('Error loading data, try again later...')).fadeIn('fast').delay(2500).fadeOut('fast');
                });
        },

        toggleWatched: function (e) {
            e.stopPropagation();
            e.preventDefault();

            var watched = !this.model.get('watched');
            var imdb = this.model.get('imdb_id');
            var dbCall = watched ? 'markMovieAsWatched' : 'markMovieAsNotWatched';
            var appEvent = watched ? 'movie:watched' : 'movie:unwatched';

            // add/delete db item
            Database[dbCall]({
                imdb_id: imdb,
                from_browser: true
            }, true).then(function () {
                // set watched state
                this.model.set('watched', watched);

                // reset cover state to default
                this.ui.watchedIcon.removeClass('selected');
                this.$el.removeClass('watched');

                // set cover state
                this.setCoverStates();
                this.setTooltips();

                // event propagation
                App.vent.trigger(appEvent, {
                    imdb_id: imdb
                }, 'seen');
            }.bind(this));
        },

        addBookmarked: function () {
            var imdb = this.model.get('imdb_id');
            var itemtype = this.model.get('type');
            var provider = this.model.get('providers').torrent;

            return provider.detail(imdb, this.model.attributes).then(function (data) {
                data.provider = provider.name;

                var dbCall = (function () {
                    if (itemtype === 'show') {
                        return 'addTVShow';
                    } else {
                        return 'addMovie';
                    }
                }());

                return Database[dbCall](data);
            }).then(function () {
                return Database.addBookmark(imdb, itemtype);
            }).then(function () {
                console.log('Bookmark added (' + imdb + ')');
            }.bind(this));
        },

        removeBookmarked: function () {
            var imdb = this.model.get('imdb_id');
            var itemtype = this.model.get('type');
            var dbCall = (function () {
                if (itemtype.match('show')) {
                    return 'deleteTVShow';
                } else {
                    return 'deleteMovie';
                }
            }());

            return Database.deleteBookmark(imdb).then(function () {
                console.log('Bookmark deleted (' + imdb + ')');
                return Database[dbCall](imdb);
            });
        },

        toggleFavorite: function (e) {
            e.stopPropagation();
            e.preventDefault();

            var itemtype = this.model.get('type');
            var bookmarked = this.model.get('bookmarked');

            if (bookmarked) {
                this.removeBookmarked().then(function () {

                    this.model.set('bookmarked', false);
                    this.ui.bookmarkIcon.removeClass('selected');
                    this.setCoverStates();
                    this.setTooltips();

                    if (itemtype.match('bookmarked')) {
                        // we'll delete this element from our list view
                        $(e.currentTarget).closest('li').animate({
                            paddingLeft: '0px',
                            paddingRight: '0px',
                            width: '0%',
                            opacity: 0
                        }, 500, function () {
                            $(this).remove();
                            $('.items').append($('<li/>').addClass('item ghost'));
                            if ($('.items li[data-imdb-id]').length === 0) {
                                App.vent.trigger('favorites:render');
                            }
                        });
                    }
                }.bind(this));
            } else {
                this.ui.bookmarkIcon.addClass('selected');

                this.addBookmarked().then(function () {
                    this.model.set('bookmarked', true);
                    this.setCoverStates();
                    this.setTooltips();
                }.bind(this)).catch(function (err) {
                    console.error('item.addBookmarked failed:', err);
                    $('.notification_alert').text(i18n.__('Error loading data, try again later...')).fadeIn('fast').delay(2500).fadeOut('fast');
                    this.ui.bookmarkIcon.removeClass('selected');
                }.bind(this));
            }
        }
    });

    App.View.Item = Item;
})(window.App);
