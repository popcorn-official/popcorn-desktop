/* globals moment*/
(function (App) {
    'use strict';
    var TVApi = App.Providers.get('TVApi');

    var Watchlist = function () {};
    Watchlist.prototype.constructor = Watchlist;
    Watchlist.prototype.config = {
        name: 'Watchlist'
    };

    var days = 100; // total days to retrieve calendar

    var queryTorrents = function (filters) {
        var deferred = Q.defer();
        var now = moment();

        // actual fetch
        function fetchWatchlist(update) {
            App.db.getSetting({
                key: 'watchlist'
            }).then(function (doc) {
                if (doc && !update) {
                    // Returning cached watchlist
                    if (!localStorage.watchlistItems) {
                        deferred.resolve(doc.value || []);
                    } else {
                        deferred.resolve(false);
                    }
                } else {
                    var show_watchlist, movie_watchlist, watchlist;
                    console.info('Watchlist - Fetching new watchlist');
                    App.Trakt.calendars.myShows(moment().subtract(days, 'days').format('YYYY-MM-DD'), days)
                        .then(function (data) {
                            show_watchlist = data;
                            return App.Trakt.sync.getWatchlist('movies');
                        })
                        .then(function (data) {
                            movie_watchlist = data;
                            watchlist = $.extend([], show_watchlist, movie_watchlist);
                            return App.db.writeSetting({
                                key: 'watchlist',
                                value: watchlist
                            });
                        })
                        .then(function () {
                            return App.db.writeSetting({
                                key: 'watchlist-fetched',
                                value: now.unix()
                            });
                        })
                        .then(function () {
                            deferred.resolve(watchlist || []);
                        })
                        .catch(function (error) {
                            deferred.reject(error);
                        });
                }
            });
        }

        //Checked when last fetched
        App.db.getSetting({
            key: 'watchlist-fetched'
        }).then(function (doc) {
            if (doc) {
                var d = moment.unix(doc.value);

                if (filters && filters.force) {
                    console.info('Watchlist - last update was %s hour(s) ago', Math.abs(now.diff(d, 'hours')));
                    fetchWatchlist(true);
                } else {

                    if (Math.abs(now.diff(d, 'hours')) >= 12) {
                        console.info('Watchlist - last update was %s hour(s) ago', Math.abs(now.diff(d, 'hours')));
                        fetchWatchlist(true);

                    } else {
                        // Last fetch is fresh (< 12h)
                        console.info('Watchlist - next update in %s hour(s)', 12 - Math.abs(now.diff(d, 'hours')));
                        fetchWatchlist(false);
                    }
                }
            } else {
                // No last fetch, fetch again
                fetchWatchlist(true);
            }
        });

        return deferred.promise;
    };

    var filterShows = function (items) {
        var filtered = [],
            foundID = [],
            foundAIR = [];

        console.info('Watchlist - parsing %s items', items.length);

        // reverse because we want latest on top
        _.forEach(items.reverse(), function (show) {
            var deferred = Q.defer();

            if (show.show_id && show.season !== 0 && show.episode !== 0) {
                var ix = foundID.indexOf(show.show_id.toString());
                if (ix !== -1) {
                    if (foundAIR[ix] > show.aired.toString()) {
                        deferred.resolve(null);
                        return;
                    }
                }

                foundID.push(show.show_id.toString());
                foundAIR.push(show.aired.toString());

                promisifyDb(db.watched.find({
                    imdb_id: show.show_id.toString(),
                    season: show.season.toString(),
                    episode: show.episode.toString()
                })).then(function (data) {
                    if (data != null && data.length > 0) {
                        deferred.resolve(null);
                    } else {
                        show.type = 'show';
                        deferred.resolve(show);
                    }
                });
            } else {
                if (show.type !== 'movie') {
                    deferred.resolve(null);
                } else {
                    var movie = show.movie;
                    movie.type = 'movie';
                    deferred.resolve(movie);
                }
            }

            filtered.push(deferred.promise);
        });

        return Q.all(filtered);
    };

    var findEpisode = function (items) {
        var filtered = [];
        var asked = [];

        _.forEach(_.filter(items, Boolean), function (show) {
            var deferred = Q.defer();
            if (show.type === 'movie') {
                deferred.resolve(show);
            } else {
                if (asked.indexOf(show.show_id) !== -1) {
                    deferred.resolve(null);
                } else {
                    asked.push(show.show_id);
                    console.log('HIT TRAKT HARD');
                    App.Trakt.shows.watchedProgress(show.show_id).then(function (data) {
                        if (data.next_episode === null) {
                            deferred.resolve(null);
                        } else {
                            deferred.resolve({
                                show_id: show.show_id,
                                //aired: HOW?!?,
                                episode: data.next_episode.number,
                                episode_title: data.next_episode.title,
                                season: data.next_episode.season,
                                show_title: show.show_title
                            });
                        }
                    }).catch(function (err) {
                        deferred.resolve(null);
                    });
                }
            }

            filtered.push(deferred.promise);
        });

        return Q.all(filtered);
    };

    var saveToDB = function (items) {
        AdvSettings.set('watchlistLoaded', false);
        localStorage.watchlistItems = JSON.stringify(_.filter(items, Boolean));
        return Q.all(items);
    };

    var formatForButter = function (items) {
        var showList = [];

        _.forEach(_.filter(items, Boolean), function (show) {
            var deferred = Q.defer();

            if (show.show_id && show.season !== 0) {
                //Try to find it on the shows database
                Database.getTVShowByImdb(show.show_id)
                    .then(function (data) {
                        if (data != null) {
                            data.type = 'show';
                            data.image = data.images.poster;
                            data.imdb = data.imdb_id;
                            data.season = show.season;
                            data.episode = show.episode;
                            data.episode_title = show.episode_title;

                            deferred.resolve(data);
                        } else {
                            //If not found, then get the details and add it to the DB
                            data = App.Trakt.shows.summary(show.show_id)
                                .then(function (data) {
                                    if (data) {
                                        data.type = 'show';
                                        data.imdb_id = data.ids.imdb;
                                        data.tvdb_id = data.ids.tvdb;
                                        data.image = data.images.poster.thumb;
                                        data.season = show.season;
                                        data.episode = show.episode;
                                        data.episode_title = show.episode_title;

                                        Database.addTVShow(data)
                                            .then(function (idata) {
                                                deferred.resolve(data);
                                            })
                                            .catch(function (err) {
                                                console.error(err);
                                                deferred.resolve(null);
                                            });
                                    } else {
                                        console.error('App.Trakt.shows.summary: no data returned');
                                        deferred.resolve(null);
                                    }
                                })
                                .catch(function (error) {
                                    console.error(error);
                                    deferred.resolve(null);
                                });
                        }
                    });
            } else {
                //Try to find in movie db
                Database.getMovie(show.ids.imdb)
                    .then(function (data) {
                        if (data !== null) {
                            if (moment(data.released).fromNow().indexOf('in') !== -1) {
                                console.warn('"%s" is not released yet, not showing', data.title);
                                deferred.resolve(null);
                            } else {
                                data.type = 'movie';
                                data.image = data.images.poster;
                                data.imdb = data.imdb_id;
                                deferred.resolve(data);
                            }
                        } else {
                            data = App.Trakt.movies.summary(show.ids.imdb)
                                .then(function (data) {
                                    if (data) {
                                        data.type = 'movie';
                                        data.imdb_id = data.ids.imdb;

                                        Database.addMovie(data)
                                            .then(function (idata) {
                                                if (moment(data.released).fromNow().indexOf('in') !== -1) {
                                                    console.warn('"%s" is not released yet, not showing', data.title);
                                                    deferred.resolve(null);
                                                } else {
                                                    deferred.resolve(data);
                                                }
                                            })
                                            .catch(function (err) {
                                                console.error(err);
                                                deferred.resolve(null);
                                            });
                                    } else {
                                        console.error('App.Trakt.movies.summary: no data returned');
                                        deferred.resolve(null);
                                    }
                                })
                                .catch(function (error) {
                                    console.error(error);
                                    deferred.resolve(null);
                                });
                        }
                    });
            }
            showList.push(deferred.promise);
        });

        return Q.all(showList);
    };

    Watchlist.prototype.extractIds = function (items) {
        return _.pluck(items, 'imdb_id');
    };

    Watchlist.prototype.detail = function (torrent_id, old_data, callback) {
        return {}; //TVApi.detail(torrent_id, old_data, callback);
    };

    Watchlist.prototype.fetch = function (filters) {
        var now = Date.now();
        if (!localStorage.watchlistItems) {
            filters ? filters.force = true : filters = {
                force: true
            };
        }
        return queryTorrents(filters).then(function (items) {
            if (items === false) {
                return {
                    results: JSON.parse(localStorage.watchlistItems),
                    hasMore: false
                };
            } else {
                return filterShows(items)
                    .then(findEpisode)
                    .then(formatForButter)
                    .then(saveToDB)
                    .then(function (shows) {
                        console.info('Watchlist - total loading time: %sms', Date.now() - now);
                        return {
                            results: _.filter(shows, Boolean),
                            hasMore: false
                        };
                    });
            }
        });
    };

    App.Providers.install(Watchlist);

})(window.App);
