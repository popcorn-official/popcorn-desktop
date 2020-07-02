(function (App) {
    'use strict';
    var OS = require('opensubtitles-api'),
        openSRT;

    var OpenSubtitles = function () {

    };

    OpenSubtitles.prototype.constructor = OpenSubtitles;
    OpenSubtitles.prototype.config = {
        name: 'OpenSubtitles'
    };

    var normalizeLangCodes = function (data) {
        Object.keys(data).forEach(function(key,index) {
            if (key === 'pb' || key.indexOf('pb|') === 0) {
                data[key.replace('pb','pt-br')] = data[key];
                delete data[key];
            }
        });
        return data;
    };

    var formatForButter = function (data_obj) {
        var data = {};
        var multi_id = 0;
        var multi_langcode = '';
        var multi_urls = {};

        // formating subtitle object data to pre-multiple subtitle format
        for (const[langcode,value] of Object.entries(data_obj)) {
            multi_id = 1;
            multi_urls = {};
            value.forEach(function(subtitle) {
                // filtering out already existing urls
                if ( !(subtitle.url in multi_urls) ) {
                    multi_langcode = langcode;
                    if (multi_id > 1) {
                        // first subtitle without multi-subtitle format because of defaultSubtitle from settings
                        multi_langcode += '|' + multi_id.toString();
                    }
                    data[multi_langcode] = subtitle;
                    multi_urls[subtitle.url] = '';
                    multi_id++;
                }
            });
        }

        data = normalizeLangCodes(data);
        for (var lang in data) {
            data[lang] = data[lang].url;
        }

        console.info(Object.keys(data).length + ' subtitles found');

        return Common.sanitize(data);
    };

    OpenSubtitles.prototype.fetch = function (queryParams) {
        openSRT = new OS({
            useragent: 'Popcorn Time NodeJS',
            username: AdvSettings.get('opensubtitlesUsername'),
            password: AdvSettings.get('opensubtitlesPassword')
        });
        queryParams.extensions = ['srt'];
        queryParams.limit = 'all';
        return openSRT.search(queryParams)
            .then(formatForButter);
    };

    OpenSubtitles.prototype.detail = function (id, attrs) {
        return this.fetch({
            imdbid: id
        }).then(function (data) {
            App.vent.trigger('update:subtitles', data);
            return {
                subtitle: data
            };
        });
    };

    OpenSubtitles.prototype.upload = function (queryParams) {
        openSRT = new OS({
            useragent: 'Popcorn Time NodeJS',
            username: AdvSettings.get('opensubtitlesUsername'),
            password: AdvSettings.get('opensubtitlesPassword')
        });
        return openSRT.upload(queryParams);
    };

    App.Providers.install(OpenSubtitles);

})(window.App);
