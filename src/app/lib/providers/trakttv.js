(function(App) {
    "use strict";
    var request = require('request');

    var Q = require('q');
    var URI = require('URIjs');

    var API_ENDPOINT = URI('http://api.trakt.tv/');
    var MOVIE_PATH = 'movie';
    var API_KEY = '7b7b93f7f00f8e4b488dcb3c5baa81e1619bb074';

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
            if(error) {
                deferred.reject(error);
            } else {
                deferred.resolve(data);
            }
        });

        return deferred.promise;
    };

    var resizeImage = function(imageUrl, width) {
        var uri = URI(imageUrl),
            ext = uri.suffix(),
            file = uri.filename().split('.' + ext)[0];

        return uri.filename(file + '-' + width + '.' + ext).toString();
    };

    var formatForPopcorn = function(items) {
        var movies = {};
        _.each(items, function(movie){
            var imdb = movie.imdb_id.replace('tt','');
            movie.image = resizeImage(movie.images.poster, '138');
            movie.bigImage = resizeImage(movie.images.poster, '300');
            movie.backdrop = resizeImage(movie.images.fanart, '940');
            movie.synopsis = movie.overview;
            movies[imdb] = movie;
        });
        return movies;
    };

    Trakttv.prototype.query = function(ids) {
        return Q.when(querySummaries(ids))
            .then(formatForPopcorn);
    };

    App.Providers.Trakttv = Trakttv;

})(window.App);