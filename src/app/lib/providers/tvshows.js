(function(App) {
    "use strict";
    var querystring = require("querystring");
    var request = require('request');
    var Q = require('q');

    var URL = false;
    var Tvshows = function() {};

    Tvshows.prototype.constructor = Tvshows;

    var queryTorrents = function(filters) {
        
        var deferred = Q.defer();
        
        var params = {};
        params.sort = 'seeds';
        params.limit = '50';

        if (filters.keywords) {
            params.keywords = filters.keywords.replace(/\s/g, '% ');
        }

        if (filters.genre) {
            params.genre = filters.genre;
        }

        if (filters.sorter && filters.sorter != 'popularity') {
            params.sort = filters.sorter;
        }
        
        var url = AdvSettings.get('tvshowApiEndpoint') + 'shows/'+filters.page+'?' + querystring.stringify(params).replace(/%25%20/g,'%20');
        
        console.log('Api request to: ' + url);
        request({url: url, json: true}, function(error, response, data) {
            if(error) {
                deferred.reject(error);
            } else if(!data || (data.error && data.error !== 'No movies found')) {
                var err = data? data.error: 'No data returned';
                console.error('API error:', err);
                deferred.reject(err);
            } else {
                deferred.resolve(data || []);
            }
        });

        return deferred.promise;
    };

    // Single element query
    var queryTorrent = function(torrent_id, callback) {
        
        var url = AdvSettings.get('tvshowApiEndpoint') + 'show/' + torrent_id;
        
        console.log('Api request to: ' + url);
        request({url: url, json: true}, function(error, response, data) {
            if(error) {

                callback(error, false);

            } else if(!data || (data.error && data.error !== 'No data returned')) {

                var err = data? data.error: 'No data returned';
                console.error('API error:', err);
                callback(err, false);
            
            } else {

                // we cache our new element
                Database.addTVShow(data, function(err, idata) {
                    callback(false, data);
                });
            }
        });
        
    };

    Tvshows.prototype.extractIds = function(items) {
        return _.pluck(items, 'imdb_id');
    };

    Tvshows.prototype.fetch = function(filters) {
        return queryTorrents(filters);
    };

    Tvshows.prototype.detail = function(torrent_id, callback) {
        return queryTorrent(torrent_id, callback);
    };

    App.Providers.Tvshows = Tvshows;

})(window.App);