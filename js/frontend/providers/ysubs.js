(function(context){
    "use strict";

    var _ = require('underscore');
    var request = require('request');
    var Q = require('q');

    var baseUrl = 'http://api.ysubs.com/subs/';
    var prefix = 'http://www.ysubs.com';
    var cacheNamespace = 'ysubs';

    var YSubs = {};

    YSubs.querySubtitles = function(imdbIds) {
        var url = baseUrl + _.map(imdbIds, function(id){return 'tt'+id;}).join('-');

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
                var langCode = App.Localization.languageMapping[lang];
                movieSubs[langCode] = prefix + _.max(subs, function(s){return s.rating;}).url;
            });

            allSubs[imdbId.replace('tt','')] = App.Localization.filterSubtitle(movieSubs);
        });

        return allSubs;
    };

    YSubs.fetch = function(imdbIds) {
        imdbIds = _.map(imdbIds, function(id){return id.toString();});
        var cachePromise = context.App.Cache.getItems(cacheNamespace, imdbIds);
        var ysubsPromise = cachePromise.then(function(cachedSubs){
                // Filter out cached subtitles
                var cachedIds = _.keys(cachedSubs);
                console.log('Cached subtitles', cachedIds);
                var filteredId = _.difference(imdbIds, cachedIds);
                return filteredId;
            })
            .then(YSubs.querySubtitles)
            .then(YSubs.formatForPopcorn);

        // Cache ysubs subtitles
        ysubsPromise.then(function(moviesSubs) {
                console.log('Cache subtitles', _.keys(moviesSubs));
                _.each(moviesSubs, function(movieSubs, imdbId) {
                    context.App.Cache.setItem(cacheNamespace, imdbId, movieSubs);
                });
            });

        // Wait for all query promise to finish
        return Q.allSettled([cachePromise, ysubsPromise])
            .then(function(results){
                // Merge all promise result
                var subs = {};
                _.each(results, function(result){
                    if(result.state === "fulfilled") {
                        _.extend(subs, result.value);
                    }
                });

                return subs;
            });
    };

    context.App.Providers.YSubs = YSubs;

})(window);