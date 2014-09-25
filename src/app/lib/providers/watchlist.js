(function (App) {
    'use strict';
    var Q = require('q');

    var Watchlist = function () {};
    Watchlist.prototype.constructor = Watchlist;

    var queryTorrents = function (filters) {
        var deferred = Q.defer();

        /*App.db.getBookmarks(filters, function (err, data) {
            deferred.resolve(data || []);
        });*/
        App.Trakt.user.getWatched().then(function (data) {
            deferred.resolve(data || []);
        });

        return deferred.promise;
    };

    var formatForPopcorn = function (items) {
        var showList = [];
        console.log('Trakt data: ', items);
        var provider = App.Providers.get('Eztv');
        items.forEach(function (show) {
            //If has no next episode or next episode is not aired, go to next one
            if (! show.next_episode || (Math.round(new Date().getTime()/ 1000) < show.next_episode.first_aired)) {
                console.log('No next episode');
                return;
            }
            console.log('Yes next episode', show.show.imdb_id);
            var deferred = Q.defer();
            var data = provider.detail(show.show.imdb_id,
                show,
                function (err, data) {
                    if (!err) {
                        data.provider = 'Eztv';
                        data.type = 'show';
                        deferred.resolve(data);
                        /*Database.addTVShow(data, function (err, idata) {
                            Database.addBookmark(that.model.get('imdb_id'), 'tvshow', function (err, data) {
                                win.info('Bookmark added (' + that.model.get('imdb_id') + ')');
                                that.model.set('bookmarked', true);
                                App.userBookmarks.push(that.model.get('imdb_id'));
                            });
                        });*/

                    } else {
                        console.log('Error', err);
                        deferred.reject(err);
                    }
                });
            // Get tv show from favourites list
            /*Database.getTVShowByImdb(show.show.imdb_id, function (err, data) {
                if (data != null) {
                    console.log('Show found in DB', data);
                    data.type = 'bookmarkedshow';
                    data.image = data.images.poster;
                    data.imdb = data.imdb_id;
                    // Fallback for old bookmarks without provider in database
                    if (typeof (data.provider) === 'undefined') {
                        data.provider = 'Eztv';
                    }
                    deferred.resolve(data);
                } else {
                    console.log('Show not found in DB');
                    deferred.reject(err);
                }
            });*/


            showList.push(deferred.promise);
        });
        console.log('Showlist', showList);
        return Q.all(showList);
    };

    Watchlist.prototype.extractIds = function (items) {
        return _.pluck(items, 'imdb_id');
    };

    Watchlist.prototype.fetch = function (filters) {
        return queryTorrents(filters)
        .then(formatForPopcorn);
    };

    App.Providers.Watchlist = Watchlist;

})(window.App);
