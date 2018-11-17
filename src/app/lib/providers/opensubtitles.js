(function (App) {
    'use strict';
    var OS = require('opensubtitles-api'),
        openSRT;

    var OpenSubtitles = function () {
        openSRT = new OS({
            
            useragent: 'Popcorn Time NodeJS',
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
        Object.keys(data).forEach(function(key,index) {
            // iterating required because of possible multiple subs per language format
            if (key === 'pb' || key.indexOf('pb|') === 0) {
                data[key] = data[ key.replace('pb','pt-br') ];
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
            multi_id=1;
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
        return Common.sanitize(data);
    };

    OpenSubtitles.prototype.fetch = function (queryParams) {
        queryParams.extensions = ['srt'];
        // this will return all available subtitles, not just 1 per language
        queryParams.limit='all';
        return openSRT.search(queryParams)
            .then(formatForButter);
    };

    OpenSubtitles.prototype.upload = function (queryParams) {
        return openSRT.upload(queryParams);
    };

    App.Providers.install(OpenSubtitles);

})(window.App);
