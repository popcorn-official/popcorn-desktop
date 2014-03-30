(function(context){
    "use strict";

    var _ = require('underscore');
    var request = require('request');
    var Q = require('q');

    var baseUrl = 'http://api.ysubs.com/subs/';
    var prefix = 'http://www.ysubs.com';

    var TTL = 1000 * 60 * 60 * 4; // 4 hours

    var YSubs = function(){
        App.Providers.CacheProvider.call(this, 'subtitle', TTL);
    };

    YSubs.prototype = Object.create(App.Providers.CacheProvider.prototype);
    YSubs.prototype.constructor = YSubs;

    var querySubtitles = function(imdbIds) {
        var url = baseUrl + _.map(imdbIds.sort(), function(id){return 'tt'+id;}).join('-');

        if(_.isEmpty(imdbIds)) {
            return {};
        }

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

    var formatForPopcorn = function(data) {
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

            // Remove unsupported subtitles
            var filteredSubtitle = App.Localization.filterSubtitle(movieSubs);

            allSubs[imdbId.replace('tt','')] = filteredSubtitle;
        });

        return allSubs;
    };

    YSubs.prototype.query = function(ids) {
        return Q.when(querySubtitles(ids))
            .then(formatForPopcorn);
    };

    context.App.Providers.YSubs = YSubs;

})(window);