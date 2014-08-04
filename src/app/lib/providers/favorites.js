(function(App) {
    'use strict';
    var Q = require('q');

    var Favorites = function() {};
    Favorites.prototype.constructor = Favorites;

    var queryTorrents = function(filters) {
        var deferred = Q.defer();

        App.db.getBookmarks(filters, function(err, data) {
            deferred.resolve(data || []);
        });

        return deferred.promise;
    };

    var formatForPopcorn = function(items) {
        var movieList = [];

        items.forEach(function(movie) {

            var deferred = Q.defer();
            // we check if its a movie 
            // or tv show then we extract right data
            if (movie.type === 'movie') {
                // its a movie
                Database.getMovie(movie.imdb_id, function(err, data) {
                    if (data != null) {
                        data.type = 'bookmarkedmovie';
                        deferred.resolve(data);
                    } else {
                        deferred.reject(err);
                    }
                });

            } else {
                // its a tv show
                Database.getTVShowByImdb(movie.imdb_id, function(err, data) {
                    if (data != null) {
                        data.type = 'bookmarkedshow';
                        data.image = data.images.poster;
                        data.imdb = data.imdb_id;
                        // Fallback for old bookmarks without provider in database
                        if (typeof(data.provider) === 'undefined') {
                            data.provider = 'Eztv';
                        }
                        deferred.resolve(data);
                    } else {
                        deferred.reject(err);
                    }
                });
            }

            movieList.push(deferred.promise);
        });

        return Q.all(movieList);
    };

    Favorites.prototype.extractIds = function(items) {
        return _.pluck(items, 'imdb_id');
    };

    Favorites.prototype.fetch = function(filters) {
        return queryTorrents(filters)
            .then(formatForPopcorn);
    };

    App.Providers.Favorites = Favorites;

})(window.App);
