(function (App) {
    'use strict';
    var OS = require('opensubtitles-api'),
        openSRT;

    var OpenSubtitles = function () {
        openSRT = new OS({
            useragent: Settings.opensubtitles.useragent + ' v' + (Settings.version || 1),
            username: Settings.opensubtitlesUsername,
            password: Settings.opensubtitlesPassword,
            ssl: true
        });
    };

    OpenSubtitles.prototype.constructor = OpenSubtitles;
    OpenSubtitles.prototype.config = {
        name: 'OpenSubtitles'
    };

    var normalizeLangCodes = function (data) {
        if ('pb' in data) {
            data['pt-br'] = data['pb'];
            delete data['pb'];
        }
        return data;
    };

    var formatForButter = function (data) {
        data = normalizeLangCodes(data);
        for (var lang in data) {
            data[lang] = data[lang].url;
        }

        console.info(Object.keys(data).length + ' subtitles found');

        return Common.sanitize(data);
    };

    OpenSubtitles.prototype.fetch = function (queryParams) {
        queryParams.extensions = ['srt'];

        return openSRT.search(queryParams)
            .then(formatForButter);
    };

    OpenSubtitles.prototype.detail = function (id, attrs) {
        return this.fetch({
            imdbid: id
        }).then(function (data) {
            return {
                subtitle: data
            };
        });
    };

    OpenSubtitles.prototype.upload = function (queryParams) {
        return openSRT.upload(queryParams);
    };

    App.Providers.install(OpenSubtitles);

})(window.App);
