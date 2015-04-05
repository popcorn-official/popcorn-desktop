(function (App) {
    'use strict';
    var openSRT = require('popcorn-opensubtitles');
    var Q = require('q');
    var userAgent = 'Popcorn Time v1';

    var OpenSubtitles = function () {};
    OpenSubtitles.prototype.constructor = OpenSubtitles;

    var normalizeLangCodes = function (data) {
        if ('pb' in data) {
            data['pt-br'] = data['pb'];
            delete data['pb'];
        }
        return data;
    };

    var formatForPopcorn = function (data) {
        data = normalizeLangCodes(data);
        for (var lang in data) {
            data[lang] = data[lang].url;
        }
        return data;
    };

    OpenSubtitles.prototype.fetch = function (queryParams) {
        return openSRT.searchEpisode(queryParams, userAgent)
            .then(function (data) {
                if (typeof data === 'object') {
                    return formatForPopcorn(data);
                } else {
                    return null;
                }
            });
    };


    App.Providers.OpenSubtitles = OpenSubtitles;

})(window.App);
