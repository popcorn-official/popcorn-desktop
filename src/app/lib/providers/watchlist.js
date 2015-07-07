/* globals moment*/
(function (App) {
    'use strict';
    var Q = require('q');
    var TVApi = App.Providers.get('TVApi');

    var Watchlist = function () {};
    Watchlist.prototype.constructor = Watchlist;

    var queryTorrents = function (filters) {
        var deferred = Q.defer();
        var now = moment();

        //Checked when last fetched
        App.db.getSetting({
                key: 'watchlist-fetched'
            })
            .then(function (doc) {
                if (doc) {
                    var d = moment.unix(doc.value);

                    if (Math.abs(now.diff(d, 'hours')) >= 12) {
                        win.info('Watchlist - last update was %s hour(s) ago', Math.abs(now.diff(d, 'hours')));
                        fetchWatchlist(true);

                    } else {
                        // Last fetch is fresh (< 12h)
                        win.info('Watchlist - next update in %s hour(s)', 12 - Math.abs(now.diff(d, 'hours')));
                        fetchWatchlist(false);
                    }
                } else {
                    // No last fetch, fetch again
                    fetchWatchlist(true);
                }
            });


        function fetchWatchlist(update) {
            App.db.getSetting({
                    key: 'watchlist'
                })
                .then(function (doc) {
                    if (doc && !update) {
                        // Returning cached watchlist
                        deferred.resolve(doc.value || []);
                    } else {
                        win.info('Watchlist - Fetching new watchlist');
                        App.Trakt.calendars.myShows(moment().subtract(30, 'days').format('YYYY-MM-DD'), 30)
                            .then(function (data) {
                                App.db.writeSetting({
                                        key: 'watchlist',
                                        value: data
                                    })
                                    .then(function () {
                                        App.db.writeSetting({
                                            key: 'watchlist-fetched',
                                            value: now.unix()
                                        });
                                    })
                                    .then(function () {
                                        deferred.resolve(data || []);
                                    });
                            })
                            .catch(function (error) {
                                deferred.reject(error);
                            });
                    }
                });
        }

        return deferred.promise;
    };

    var filterShows = function (items) {
        var filtered = [];

        items.forEach(function (show) {
            var deferred = Q.defer();

            if (show.show_id && show.season !== 0) {
                promisifyDb(db.watched.find({
                        imdb_id: show.show_id.toString(),
                        season: show.season.toString(),
                        episode: show.episode.toString()
                    }))
                    .then(function (data) {
                        if (data != null && data.length > 0) {
                            deferred.resolve(null);
                        } else {
                            deferred.resolve(show);
                        }
                    });
            } else {
                deferred.resolve(null);
            }

            filtered.push(deferred.promise);
        });

        return Q.all(filtered);
    };

    var formatForPopcorn = function (items) {
        var showList = [];

        items.forEach(function (show) {
            if (show === null) {
                return;
            }

            var deferred = Q.defer();
            //Try to find it on the shows database and attach the next_episode info
            Database.getTVShowByImdb(show.show_id)
                .then(function (data) {
                    if (data != null) {
                        data.type = 'show';
                        data.image = data.images.poster;
                        data.imdb = data.imdb_id;
                        data.next_episode = show.next_episode;
                        // Fallback for old bookmarks without provider in database or marked as Eztv
                        if (typeof (data.provider) === 'undefined' || data.provider === 'Eztv') {
                            data.provider = 'TVApi';
                        }
                        deferred.resolve(data);
                    } else {
                        //If not found, then get the details from TVApi and add it to the DB
                        data = TVApi.detail(show.show_id, show, false)
                            .then(function (data) {
                                if (data) {
                                    data.provider = 'TVApi';
                                    data.type = 'show';
                                    data.next_episode = show.next_episode;

                                    Database.addTVShow(data)
                                        .then(function (idata) {
                                            deferred.resolve(data);
                                        })
                                        .catch(function (err) {
                                            deferred.resolve(null);
                                        });
                                } else {
                                    deferred.resolve(null);
                                }
                            })
                            .catch(function (error) {
                                deferred.resolve(null);
                            });
                    }
                });
            showList.push(deferred.promise);
        });

        return Q.all(showList);
    };

    Watchlist.prototype.extractIds = function (items) {
        return _.pluck(items, 'imdb_id');
    };

    Watchlist.prototype.fetch = function (filters) {
        return queryTorrents(filters)
            .then(filterShows)
            .then(formatForPopcorn)
            .then(function (shows) {
                return {
                    results: _.filter(shows, Boolean),
                    hasMore: false
                };
            });
    };

    Watchlist.prototype.detail = function (torrent_id, old_data, callback) {
        return TVApi.detail(torrent_id, old_data, callback);
    };

    Watchlist.prototype.fetchWatchlist = function () {
        var now = moment();
        var deferred = Q.defer();

        win.info('Watchlist - Fetching new watchlist');
        App.Trakt.calendars.myShows(moment().subtract(30, 'days').format('YYYY-MM-DD'), 30)
            .then(function (data) {
                App.db.writeSetting({
                        key: 'watchlist',
                        value: data
                    })
                    .then(function () {
                        App.db.writeSetting({
                            key: 'watchlist-fetched',
                            value: now.unix()
                        });
                    })
                    .then(function () {
                        deferred.resolve(data || []);
                    });
            })
            .catch(function (error) {
                deferred.reject(error);
            });

        return deferred.promise;
    };

    App.Providers.Watchlist = Watchlist;

})(window.App);
