(function (context) {
    'use strict';

    var _ = require('underscore');
    var request = require('request');
    var Q = require('q');

    var baseUrl = 'http://api.yifysubtitles.com/subs/';
    var mirrorUrl = 'http://api.ysubs.com/subs/';
    var prefix = 'http://www.yifysubtitles.com';

    var TTL = 1000 * 60 * 60 * 4; // 4 hours

    var YSubs = function () {
        App.Providers.CacheProvider.call(this, 'subtitle', TTL);
    };

    YSubs.prototype = Object.create(App.Providers.CacheProvider.prototype);
    YSubs.prototype.constructor = YSubs;

    var querySubtitles = function (imdbIds) {
        if (_.isEmpty(imdbIds)) {
            return {};
        }

        var url = baseUrl + _.map(imdbIds.sort(), function (id) {
            return id;
        }).join('-');
        var mirrorurl = mirrorUrl + _.map(imdbIds.sort(), function (id) {
            return id;
        }).join('-');

        var deferred = Q.defer();

        request({
            url: url,
            json: true
        }, function (error, response, data) {
            if (error || response.statusCode >= 400 || !data || !data.success) {
                request({
                    url: mirrorurl,
                    json: true
                }, function (error, response, data) {
                    if (error || response.statusCode >= 400 || !data || !data.success) {
                        deferred.reject(error);
                    } else {
                        deferred.resolve(data);
                    }
                });
            } else {
                deferred.resolve(data);
            }
        });

        return deferred.promise;
    };

    var formatForPopcorn = function (data) {
        var allSubs = {};
        // Iterate each movie
        _.each(data.subs, function (langs, imdbId) {
            var movieSubs = {};
            // Iterate each language
            _.each(langs, function (subs, lang) {
                // Pick highest rated
                var langCode = languageMapping[lang];
                movieSubs[langCode] = prefix + _.max(subs, function (s) {
                    return s.rating;
                }).url;
            });

            // Remove unsupported subtitles
            var filteredSubtitle = App.Localization.filterSubtitle(movieSubs);

            allSubs[imdbId] = filteredSubtitle;
        });

        return allSubs;
    };

    YSubs.prototype.query = function (ids) {
        return Q.when(querySubtitles(ids))
            .then(formatForPopcorn);
    };

    // Language mapping to match PT langcodes
    var languageMapping = {
        'albanian': 'sq',
        'arabic': 'ar',
        'bengali': 'bn',
        'brazilian-portuguese': 'pt-br',
        'bulgarian': 'bg',
        'bosnian': 'bs',
        'chinese': 'zh',
        'croatian': 'hr',
        'czech': 'cs',
        'danish': 'da',
        'dutch': 'nl',
        'english': 'en',
        'estonian': 'et',
        'farsi-persian': 'fa',
        'finnish': 'fi',
        'french': 'fr',
        'german': 'de',
        'greek': 'el',
        'hebrew': 'he',
        'hungarian': 'hu',
        'indonesian': 'id',
        'italian': 'it',
        'japanese': 'ja',
        'korean': 'ko',
        'lithuanian': 'lt',
        'macedonian': 'mk',
        'malay': 'ms',
        'norwegian': 'no',
        'polish': 'pl',
        'portuguese': 'pt',
        'romanian': 'ro',
        'russian': 'ru',
        'serbian': 'sr',
        'slovenian': 'sl',
        'spanish': 'es',
        'swedish': 'sv',
        'thai': 'th',
        'turkish': 'tr',
        'urdu': 'ur',
        'ukrainian': 'uk',
        'vietnamese': 'vi'
    };

    context.App.Providers.YSubs = YSubs;

})(window);
