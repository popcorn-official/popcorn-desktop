(function(App) {
    "use strict";
    var Q = require('q');

    var Tvshows = function() {};
    Tvshows.prototype.constructor = Tvshows;

    var queryTorrents = function(filters) {
        var deferred = Q.defer();
        
        App.db.getShows(filters, function(err, data) {

            deferred.resolve(data || []);
            
        });

        return deferred.promise;
    };

    Tvshows.prototype.extractIds = function(items) {
        return _.pluck(items, 'imdb_id');
    };

    Tvshows.prototype.fetch = function(filters) {
        return queryTorrents(filters);
    };

    App.Providers.Tvshows = Tvshows;

})(window.App);