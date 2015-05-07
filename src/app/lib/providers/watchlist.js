/* globals moment*/
(function (App) {
    'use strict';
    var Q = require('q');
    var Eztv = App.Providers.get('Eztv');

    var Watchlist = function () {
        this.inhibited = false;
    };
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

                    if (Math.abs(now.diff(d, 'days')) >= 1) {
                        win.info('Watchlist - Last fetched more than 1 day');
                        App.db.writeSetting({
                                key: 'watchlist-fetched',
                                value: now.unix()
                            })
                            .then(function () {
                                fetchWatchlist(true);
                            });

                    } else {
                        win.info('Watchlist - Last fetch is fresh');
                        fetchWatchlist(false);
                    }
                } else {
                    win.info('Watchlist - No last fetch, fetch again');
                    App.db.writeSetting({
                            key: 'watchlist-fetched',
                            value: now.unix()
                        })
                        .then(function () {
                            fetchWatchlist(true);
                        });
                }
            });


        function fetchWatchlist(update) {
            App.db.getSetting({
                    key: 'watchlist'
                })
                .then(function (doc) {
                    if (doc && !update) {
                        win.info('Watchlist - Returning cached watchlist');
                        deferred.resolve(doc.value || []);
                    } else {
                        win.info('Watchlist - Fetching new watchlist');
                        App.Trakt.show.getCalendar(moment().subtract(31, 'days').format('YYYY-MM-DD'), 30)
                            .then(function (data) {
                                App.db.writeSetting({
                                        key: 'watchlist',
                                        value: data
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
                        // Fallback for old bookmarks without provider in database
                        if (typeof (data.provider) === 'undefined') {
                            data.provider = 'Eztv';
                        }
                        deferred.resolve(data);
                    } else {
                        //If not found, then get the details from Eztv and add it to the DB
                        data = Eztv.detail(show.show_id, show)
                            .then(function (data) {
                                if (data) {
                                    data.provider = 'Eztv';
                                    data.type = 'show';
                                    data.next_episode = show.next_episode;

                                    Database.addTVShow(data)
                                        .then(function (idata) {
                                            deferred.resolve(data);
                                        });
                                } else {
                                    deferred.resolve(false);
                                }
                            })
                            .catch(function (error) {
                                deferred.resolve(false);
                            });
                    }
                });
            showList.push(deferred.promise);
        });

        return Q.all(showList)
            .then(function (res) {
                return {
                    results: _.filter(res, Boolean),
                    hasMore: false
                };
            });
    };

    Watchlist.prototype.extractIds = function (items) {
        return _.pluck(items, 'imdb_id');
    };

    Watchlist.prototype.fetch = function (filters) {
        return queryTorrents(filters)
            .then(filterShows)
            .then(formatForPopcorn);
    };

    Watchlist.prototype.detail = function (torrent_id, old_data, callback) {
        return Eztv.detail(torrent_id, old_data, callback);
    };

    Watchlist.prototype.inhibit = function (flag) {
        win.info('Watchlist - Inhibit: ', flag);

        this.inhibited = flag;
    };

    Watchlist.prototype.fetchWatchlist = function () {
        if (this.inhibited) {
            return Q(true);
        }

        var deferred = Q.defer();
        win.info('Watchlist - Fetching new watchlist');
        App.Trakt.show.getCalendar(moment().subtract(31, 'days').format('YYYY-MM-DD'), 30)
            .then(function (data) {
                App.db.writeSetting({
                        key: 'watchlist',
                        value: data
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
