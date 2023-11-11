(function (App) {
    'use strict';

    const i18n = require('i18n');

    var Favorites = function () {};
    Favorites.prototype.constructor = Favorites;
    Favorites.prototype.config = {
        name: 'Favorites'
    };

    var queryTorrents = function (filters) {
        let query_func;
        if (App.currentview === 'Watched') {
            filters.kind = 'Watched';
            query_func = App.db.getWatched;
            if (filters.type === 'show') {
                filters.type = 'episode';
            }
        } else {
            query_func = App.db.getBookmarks; // default to favorites
        }
        return query_func(filters)
            .then(function (data) {
                    return data;
                },
                function (error) {
                    return [];
                });
    };

    var sort = function (items, filters) {
        var sorted = [],
            matched;

        if (filters.sorter === 'title') {
            sorted = items.sort(function (a, b) {
                var A = a.title.toLowerCase();
                var B = b.title.toLowerCase();
                if (A < B) {
                    return -1 * filters.order;
                } else if (A > B) {
                    return 1 * filters.order;
                } else {
                    return 0;
                }
            });
        }

        if (filters.sorter === 'rating') {
            sorted = items.sort(function (a, b) {
                var a_rating = a.type === 'bookmarkedmovie' ? a.rating : (a.rating.percentage / 10);
                var b_rating = b.type === 'bookmarkedmovie' ? b.rating : (b.rating.percentage / 10);
                return filters.order === -1 ? b_rating - a_rating : a_rating - b_rating;
            });
        }

        if (filters.sorter === 'year') {
            sorted = items.sort(function (a, b) {
                return filters.order === -1 ? b.year - a.year : a.year - b.year;
            });
        }

        if (filters.sorter === 'watched items') {
            sorted = items.sort(function (a, b) {
                var a_watched = App[a.type === 'bookmarkedmovie' ? 'watchedMovies' : 'watchedShows'].indexOf(a.imdb_id) !== -1;
                var b_watched = App[b.type === 'bookmarkedmovie' ? 'watchedMovies' : 'watchedShows'].indexOf(b.imdb_id) !== -1;
                return filters.order === -1 ? a_watched - b_watched : b_watched - a_watched;
            });
        }

        if (filters.type !== 'All') {
            matched = [];
            for (var i in sorted) {
                if (sorted[i].imdb_id.indexOf('mal') !== -1) {
                    matched.push(sorted[i]);
                }
            }

            if (filters.type === 'Anime') {
                sorted = matched;
            } else {
                for (var j in matched) {
                    for (var k = sorted.length; k--;) {
                        if (sorted[k] === matched[j]) {
                            sorted.splice(k, 1);
                        }
                    }
                }
            }
        }

        if (filters.keywords) {
            var query = filters.keywords.toLowerCase();
            matched = [];
            for (var l in sorted) {
                if (sorted[l].title.toLowerCase().indexOf(query) !== -1) {
                    matched.push(sorted[l]);
                }
            }
            sorted = matched;
        }

        return sorted;
    };

    var movie_fetch_wrapper = async function (imdb_id) {
        let movieProvider = App.Config.getProviderForType('movie')[0];
        return movieProvider.fetch({keywords: imdb_id, page:1}).then(function (movies) {
            if (movies.results.length !== 1) {
                throw "Unknown movie in watched DB or cannot fetch movie data";
            }
            return movies.results[0];
        });
    };

    var show_fetch_wrapper = async function (imdb_id) {
        let showProvider = App.Config.getProviderForType('tvshow')[0];
        return showProvider.detail(imdb_id, {
            contextLocale: App.settings.contextLanguage || App.settings.language
        }).then(function (show) {
            show.type = 'show';
            return show;
        });
    };

    var formatForButter = function (items, kind) {
        var movieList = [];
        var WseriesList = [];

        items.forEach(function (movie) {
            var movie_fetch_func = Database.getMovie;
            var show_fetch_func = Database.getTVShowByImdb;
            var shouldMark = true;
            // note: in the future we could check if the movie is also in
            // the local db to avoid fetching data we already have
            if (kind === 'Watched') {
                shouldMark = false;
                if (movie.type === 'movie') {
                    movie.imdb_id = movie.movie_id;
                }
                // if we're displaying movies from the watched database
                // we'll fetch them from the providers instead of the local database
                // given that storing them there would make the movie database
                // very large
                movie_fetch_func = movie_fetch_wrapper;
                show_fetch_func = show_fetch_wrapper;
            }
            var deferred = Q.defer();
            // we check if its a movie
            // or tv show then we extract right data
            if (movie.type === 'movie') {
                // its a movie
                movie_fetch_func(movie.imdb_id)
                    .then(function (data) {
                            if (shouldMark) {
                                data.type = 'bookmarkedmovie';
                            }
                            if (/slurm.trakt.us/.test(data.image)) {
                                data.image = data.image.replace(/slurm.trakt.us/, 'walter.trakt.us');
                            }
                            deferred.resolve(data);
                        },
                        function (err) {
                            deferred.reject(err);
                        });
            } else {
                // its a tv show
                if (kind === 'Watched') {
                    // process only one instance of series
                    if (WseriesList.includes(movie.imdb_id)) {
                        return;
                    }
                    WseriesList.push(movie.imdb_id);
                }
                var _data = null;
                show_fetch_func(movie.imdb_id)
                    .then(function (data) {
                        if (shouldMark) {
                            data.type = 'bookmarkedshow';
                        }
                        data.imdb = data.imdb_id;
                        // Fallback for old bookmarks without provider in database or marked as Eztv
                        if (typeof (data.provider) === 'undefined' || data.provider === 'Eztv') {
                            data.provider = 'tvshow';
                        }
                        // This is an old boxart, fetch the latest boxart
                        if (/slurm.trakt.us/.test(data.images.poster)) {
                            // Keep reference to old data in case of error
                            _data = data;
                            var provider = App.Providers.get(data.provider);
                            return provider.detail(data.imdb_id, data);
                        } else {
                            data.poster = data.images.poster;
                            deferred.resolve(data);
                            return null;
                        }
                    }, function (err) {
                        deferred.reject(err);
                    }).then(function (data) {
                        if (data) {
                            if (shouldMark) {
                                // Cache new show and return
                                Database.deleteBookmark(_data.imdb_id);
                                Database.deleteTVShow(_data.imdb_id);
                                Database.addTVShow(data);
                                Database.addBookmark(data.imdb_id, 'tvshow');
                                data.type = 'bookmarkedshow';
                            }
                            deferred.resolve(data);
                        }
                    }, function (err) {
                        // Show no longer exists on provider
                        // Scrub bookmark and TV show
                        // But return previous data one last time
                        // So error to erase database doesn't show
                        if (shouldMark) {
                            Database.deleteBookmark(_data.imdb_id);
                            Database.deleteTVShow(_data.imdb_id);
                        }
                        deferred.resolve(_data);
                    });
            }

            movieList.push(deferred.promise);
        });

        return Q.all(movieList);
    };

    Favorites.prototype.extractIds = function (items) {
        return _.pluck(items, 'imdb_id');
    };

    Favorites.prototype.fetch = function (filters) {
        if (App.currentview === 'Watched') {
            filters.kind = 'Watched';
        }
        var params = {
            page: filters.page,
            kind: filters.kind
        };
        if (filters.type === 'Series') {
            params.type = 'show';
        }
        if (filters.type === 'Movies') {
            params.type = 'movie';
        }

        return queryTorrents(params)
            .then(function (items) {
                return formatForButter(items, filters.kind);
            }).then(function (items) {
                return sort(items, filters);
            });
    };

    Favorites.prototype.filters = function () {
        const data = {
            kinds: ['Favorites', 'Watched'],
            types: ['All', 'Movies', 'Series', 'Anime'],
            sorters: ['watched items', 'year', 'title', 'rating']
        };
        let filters = {
            kinds: {},
            types: {},
            sorters: {},
        };
        for (const sorter of data.sorters) {
            filters.sorters[sorter] = i18n.__(sorter.capitalizeEach());
        }
        for (const type of data.types) {
            filters.types[type] = i18n.__(type);
        }
        for (const kind of data.kinds) {
            filters.kinds[kind] = i18n.__(kind);
        }

        return Promise.resolve(filters);
    };

    App.Providers.install(Favorites);

})(window.App);
