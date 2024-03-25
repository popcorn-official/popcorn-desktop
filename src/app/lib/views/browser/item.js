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
          overlay: '.cover-overlay',
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
            this.localizeTexts();
        },

        onAttach: function () {
            this.loadImage();
            this.setCoverStates();
            this.setTooltips();

            $('.tooltipped').tooltip({
                delay: {
                    'show': 800,
                    'hide': 100
                }
            });

            $('.providerinfo').tooltip({
                delay: {
                    'show': 2400,
                    'hide': 100
                },
                html: true
            });
        },

        localizeTexts: function () {
            var title = this.model.get('title');
            var locale = this.model.get('locale');

            let title1 = title;
            let title2;
            if (locale && locale.title) {
                if (Settings.translateTitle === 'translated-origin') {
                    title1 = locale.title;
                    title2 = title;
                }
                if (Settings.translateTitle === 'origin-translated') {
                    title2 = locale.title;
                }
                if (Settings.translateTitle === 'translated') {
                    title1 = locale.title;
                }
            }

            this.model.set('title1', title1);
            this.model.set('title2', title2);
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
            if (!Settings.events) {
                return;
            }
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
                if (Settings.alwaysShowBookmarks) {
                    this.ui.overlay.addClass('selected');
                }
            }

            if (this.model.get('watched') && !itemtype.match('show')) {
                this.ui.watchedIcon.addClass('selected');

                if (App.currentview !== 'Watched') {
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
            } else if (this.model.get('poster')) {
                poster = this.model.get('poster');
            } else {
                var imdb = this.model.get('imdb_id'),
                api_key = Settings.tmdb.api_key,
                movie = (function () {
                    var tmp = null;
                    $.ajax({
                        url: 'http://api.themoviedb.org/3/movie/' + imdb + '?api_key=' + api_key + '&append_to_response=videos',
                        type: 'get',
                        dataType: 'json',
                        timeout: 5000,
                        async: false,
                        global: false,
                        success: function (data) {
                            tmp = data;
                        }
                    });
                    return tmp;
                }());
                poster = movie && movie.poster_path ? 'http://image.tmdb.org/t/p/w500' + movie.poster_path : noimg;
                this.model.set('poster', poster);
                !this.model.get('synopsis') && movie && movie.overview ? this.model.set('synopsis', movie.overview) : null;
                (!this.model.get('rating') || this.model.get('rating') === '0' || this.model.get('rating') === '0.0') && movie && movie.vote_average ? this.model.set('rating', movie.vote_average) : null;
                (!this.model.get('runtime') || this.model.get('runtime') === '0') && movie && movie.runtime ? this.model.set('runtime', movie.runtime) : null;
                !this.model.get('trailer') && movie && movie.videos && movie.videos.results && movie.videos.results[0] ? this.model.set('trailer', 'http://www.youtube.com/watch?v=' + movie.videos.results[0].key) : null;
                (!this.model.get('backdrop') || this.model.get('backdrop') === 'images/posterholder.png') && movie && movie.backdrop_path ? this.model.set('backdrop', 'http://image.tmdb.org/t/p/w500' + movie.backdrop_path) : ((!this.model.get('backdrop') || this.model.get('backdrop') === 'images/posterholder.png') && movie && movie.poster_path ? this.model.set('backdrop', 'http://image.tmdb.org/t/p/w500' + movie.poster_path) : null);
                !this.model.get('tmdb_id') && movie && movie.id ? this.model.set('tmdb_id', movie.id) : null;
                this.model.set('getmetarunned', true);
            }

            if (Settings.translatePosters) {
                var locale = this.model.get('locale');
                if (locale && locale.poster) {
                    poster = locale.poster;
                }
            }

            Common.loadImage(poster).then((img) => {
                if (!img && this.model.get('poster_medium') && poster !== this.model.get('poster_medium')) {
                    poster = this.model.get('poster_medium');
                    this.model.set('poster', poster);
                    this.model.set('image', poster);
                    this.model.set('cover', poster);
                    Common.loadImage(poster).then((img) => {
                        if (this.ui.cover.css) {
                            this.ui.cover.css('background-image', 'url(' + (img || noimg) + ')').addClass('fadein');
                        }
                    });
                } else if (this.ui.cover.css) {
                    this.ui.cover.css('background-image', 'url(' + (img || noimg) + ')').addClass('fadein');
                }
            });
        },

        setTooltips: function () {
            this.ui.watchedIcon.attr('data-original-title', this.ui.watchedIcon.hasClass('selected') ? i18n.__('Mark as unseen') : i18n.__('Mark as Seen')).tooltip();
            this.ui.bookmarkIcon.attr('data-original-title', this.ui.bookmarkIcon.hasClass('selected') ? i18n.__('Remove from bookmarks') : i18n.__('Add to bookmarks')).tooltip();
        },

        showDetail: function (e) {
            e.preventDefault();

            var realtype = this.model.get('type');
            var itemtype = realtype.replace('bookmarked', '');
            var providerType = itemtype === 'show' ? 'tvshow' : itemtype;
            var providers = {torrent:App.Config.getProviderForType(providerType)[0]};
            this.model.set('providers', providers);
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
                    win.error('error showing detail:', err);
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
            var itemtype = this.model.get('type').replace('bookmarked', '');
            var provider;

            if (this.model.get('providers') && this.model.get('providers').torrent.detail) {
                provider = this.model.get('providers').torrent;
            } else {
                if (itemtype === 'show') {
                    provider = App.Config.getProviderForType('tvshow')[0];
                } else {
                    provider = App.Config.getProviderForType('movie')[0];
                }
            }

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
                win.info('Bookmark added (' + imdb + ')');
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
                win.info('Bookmark deleted (' + imdb + ')');
                return Database[dbCall](imdb);
            });
        },

        toggleFavorite: function (e) {
            e.stopPropagation();
            e.preventDefault();

            var itemtype = this.model.get('type');
            var bookmarked = this.model.get('bookmarked');
            var delCache = (function (e) {
                var id = window.setTimeout(function() {}, 0);
                while (id--) { window.clearTimeout(id); }
                App.vent.trigger('notification:close');
                this.toggleFavorite(e);
                $('.favourites-toggle').text(i18n.__('Remove from bookmarks')).addClass('selected');
                $('.sha-bookmark').text(i18n.__('Remove from bookmarks')).addClass('selected');
                $('.notification_alert').stop().text(i18n.__('Bookmark restored')).fadeIn('fast').delay(1500).fadeOut('fast');
            }.bind(this));

            if (bookmarked) {
                this.removeBookmarked().then(function () {

                    this.model.set('bookmarked', false);
                    this.ui.bookmarkIcon.removeClass('selected');
                    this.ui.overlay.removeClass('selected');
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
                }.bind(this)).then(function () {
                        var id = window.setTimeout(function() {}, 0);
                        while (id--) { window.clearTimeout(id); }
                        App.vent.trigger('notification:close');
                        App.vent.trigger('notification:show', new App.Model.Notification({
                            title: '',
                            body: '<font size="3">' + this.model.get('title') + ' (' + this.model.get('year') + ')' + '</font><br>' + i18n.__('was removed from bookmarks'),
                            autoclose: true,
                            type: 'info',
                            buttons: [{ title: i18n.__('Undo'), action: delCache }]
                        }));
                }.bind(this));
            } else {
                if (this.ui.bookmarkIcon[0].isConnected) {
                    this.ui.bookmarkIcon.addClass('selected');
                }

                this.addBookmarked().then(function () {
                    this.model.set('bookmarked', true);
                    if (App.currentview === 'Favorites') {
                        App.vent.trigger('favorites:list', []);
                    } else {
                        this.setCoverStates();
                        this.setTooltips();
                    }
                }.bind(this)).catch(function (err) {
                    win.error('item.addBookmarked failed:', err);
                    $('.notification_alert').text(i18n.__('Error loading data, try again later...')).fadeIn('fast').delay(2500).fadeOut('fast');
                    this.ui.bookmarkIcon.removeClass('selected');
                }.bind(this));
            }
        }
    });

    App.View.Item = Item;
})(window.App);
