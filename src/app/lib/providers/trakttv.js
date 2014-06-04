(function(App) {
    'use strict';
    var request = require('request');

    var Q = require('q');
    var URI = require('URIjs');

    var API_ENDPOINT = URI('http://api.trakt.tv/');
    var MOVIE_PATH = 'movie';
    var SHOW_PATH = 'show';
    var API_KEY = '515a27ba95fbd83f20690e5c22bceaff0dfbde7c';

    function Trakttv() {
        App.Providers.CacheProvider.call(this, 'metadata');
    }

    Trakttv.prototype = Object.create(App.Providers.CacheProvider.prototype);
    Trakttv.prototype.constructor = Trakttv;

    var querySummaries = function(ids) {
        if(_.isEmpty(ids)) {
            return [];
        }

        var imdbIds = _.map(ids.sort(), function(id){return 'tt'+id;});

        var deferred = Q.defer();

        var uri = API_ENDPOINT.clone()
            .segment([
                MOVIE_PATH,
                'summaries.json',
                API_KEY,
                imdbIds.join(','),
                'full'
            ]);

        request({url: uri.toString(), json: true}, function(error, response, data) {
            if(error || !data) {
                deferred.reject(error);
            } else {
                deferred.resolve(data);
            }
        });

        return deferred.promise;
    };

    Trakttv.resizeImage = function(imageUrl, width) {
        var uri = URI(imageUrl),
            ext = uri.suffix(),
            file = uri.filename().split('.' + ext)[0];

        // Don't resize images that don't come from trakt
        //  eg. YTS Movie Covers
        if(uri.domain() !== 'trakt.us') { return imageUrl; }

        var existingIndex = 0;
        if((existingIndex = file.search('-300$')) !== -1 || (existingIndex = file.search('-138$')) !== -1) {
            file = file.slice(0, existingIndex);
        }

        if(file === 'poster-dark') {
            return imageUrl;
        } else {
            return uri.filename(file + '-' + width + '.' + ext).toString();
        }
    };

    var formatForPopcorn = function(items) {
        var movies = {};
        _.each(items, function(movie){
            var imdb = movie.imdb_id.replace('tt','');
            movie.image = movie.images.poster;
            movie.backdrop = Trakttv.resizeImage(movie.images.fanart, '940');
            movie.synopsis = movie.overview;
            movies[imdb] = movie;
        });
        return movies;
    };

    // Single element query
    // {title: 'Game of Thrones', season: 4, episode: 6}
    // {title: 'Game of Thrones', season: 04, episode: 06}
    
    var episodeDetail = function(data, callback) {

        var slug = data.title.toLowerCase()
            .replace(/[^\w ]+/g,'')
            .replace(/ +/g,'-');

        var uri = API_ENDPOINT.clone()
            .segment([
                SHOW_PATH,
                'episode',
                'summary.json',
                API_KEY,
                slug,
                data.season.toString(),
                data.episode.toString()
            ]);

        win.info('Request to TRAKT API');
        win.debug(uri.toString());
        request({url: uri.toString(), json: true}, function(error, response, data) {
            if(error || !data) {
                callback(error, false);
            } else {
                if (data.status === 'failure') {
                    callback(data, false);
                } else {
                    callback(false, data);
                }
            }
        });
    };  

    var scrobble = function(data) {
        var uri = API_ENDPOINT.clone().segment([data.type, 'scrobble', API_KEY]);
        request.post({url: uri.toString(), form: data}, function(error, response, data) {
            if(error) {
                win.error(error);
            }
        });
    };

    var seenMovie = function(data) {
        var uri = API_ENDPOINT.clone().segment([MOVIE_PATH, 'seen', API_KEY]);
        request.post({url: uri.toString(), form: data}, function(error, response, data) {
            if(error) {
                win.error(error);
            }
        });
    };
    var seenEpisode = function(data) {
        var uri = API_ENDPOINT.clone().segment([SHOW_PATH, 'episode', 'seen', API_KEY]);
        request.post({url: uri.toString(), form: data}, function(error, response, data) {
            if(error) {
                win.error(error);
            }
        });
    };

    var testLogin = function(data, callback) {
        var uri = API_ENDPOINT.clone().segment(['account', 'test', API_KEY]);
        request.post({url: uri.toString(), form: data}, function(error, response, data) {
            if(error || !data) {
                return callback(false);
            }
            data = JSON.parse(data);
            return callback(data.status !== 'failure');
        });
    };

    Trakttv.prototype.query = function(ids) {
        return Q.when(querySummaries(ids))
            .then(formatForPopcorn);
    };

    Trakttv.prototype.episodeDetail = function(data, callback) {
        return episodeDetail(data, callback);
    }; 

    Trakttv.prototype.scrobble = function(data) {
        return scrobble(data);
    };  
    Trakttv.prototype.seenMovie = function(data) {
        return seenMovie(data);
    };  
    Trakttv.prototype.seenEpisode = function(data) {
        return seenEpisode(data);
    };
    Trakttv.prototype.testLogin = function(data, callback) {
        return testLogin(data, callback);
    };

    App.Providers.Trakttv = Trakttv;

})(window.App);