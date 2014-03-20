(function(context){
    "use strict";

    var _ = require('underscore');
    var request = require('request');
    var Q = require('q');

    var baseUrl = 'http://api.yifysubtitles.com/subs/';
    var prefix = 'http://www.ysubs.com';

    var YSubs = function(imdbIds){
        this._imdbIds = imdbIds;
    };

    YSubs.prototype.querySubtitles = function() {

        var url = baseUrl + _.map(this._imdbIds, function(id){return 'tt'+id;}).join('-');

        var deferred = Q.defer();
        request({url:url, json: true}, function(error, response, data){
            if(error) {
                deferred.reject(error);
            } else if (!data.success) {
                deferred.reject(error);
            } else {
                deferred.resolve(data);
            }
        });

        return deferred.promise;
    };

    YSubs.formatForPopcorn = function(data) {
        var allSubs = {};
        // Iterate each movie
        _.each(data.subs, function(langs, imdbId) {
            var movieSubs = {};
            // Iterate each language
            _.each(langs, function(subs, lang) {
                // Pick highest rated
                movieSubs[lang] = prefix + _.max(subs, function(s){return s.rating;}).url;
            });

            allSubs[imdbId.replace('tt','')] = movieSubs;
        });

        return allSubs;
    };

    YSubs.fetch = function(imdbIds) {
        var ysub = new YSubs(imdbIds);
        return ysub.querySubtitles()
            .then(YSubs.formatForPopcorn);
    };

    context.App.Providers.YSubs = YSubs;

})(window);