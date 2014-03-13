var xmlrpc = require('xmlrpc'),
    request = require('request'),
    zlib = require('zlib'),
    fs = require('fs'),

    appUserAgent = 'PopcornHour v1',

    client = xmlrpc.createClient({
        url: 'http://api.opensubtitles.org/xml-rpc',
        headers: {
            'User-Agent': appUserAgent
        }
    }),
    
    Languages = window.Languages = {
        'spa': 'Spanish',
        'eng': 'English',
        'pob': 'Portuguese(Brazil)',
        'rum': 'Romanian',
        'tur': 'Turkish',
        'dut': 'Dutch',
        'fre': 'French',
        'ger': 'German',
        'lit': 'Lithuanian',
        'lat': 'Latvian',
        'hun': 'Hungarian',
        'rus': 'Russian',
        'ukr': 'Ukrainian',
        'fin': 'Finnish',
        'bul': 'Bulgarian'    },

    token;

client.methodCall('LogIn', [
    null,
    null,
    null,
    appUserAgent
], function (error, data) {
    if (!error) {
        token = data.token;
    }
});

App.unzip = function (url, filename) {
    var output = fs.createWriteStream(filename);

    request({
        url: url,
        headers: {
            'Accept-Encoding': 'gzip'
        }
    }).pipe(zlib.createGunzip()).pipe(output);
};

App.findSubtitle = function (model, cb, isFallback) {
    var doRequest = function () {
        if (!token) {
            return setTimeout(function () {
                App.findSubtitle(model, cb);
            }, 200);
        }

        var queries = [],
            params;

        Object.keys(Languages).forEach(function (lang) {
            var opts = {
                sublanguageid: lang
            };

            if (isFallback) {
                opts.imdbid = model.imdb;
            } else {
                opts.query = model.title + ' YIFY';
            }

            queries.push(opts);
        });

        params = [
            token,
            queries,
            {
                limit: 5
            }
        ];

        client.methodCall('SearchSubtitles', params, function (error, data) {
            if (!error && data && !isFallback && data.data === false) {
                return App.findSubtitle(model, cb, true);
            }

            if (!error && data.data && data.data.length) {

                var subs = {};

                _.each(data.data, function (sub) {
                    if (typeof subs[sub.SubLanguageID] === 'undefined') {
                        subs[sub.SubLanguageID] = sub.SubDownloadLink;
                    }
                });

                // Save to cache
                App.Cache.setItem('subtitle', model, subs);

                // Callback
                cb(subs);
            }
        });
    };

    App.Cache.getItem('subtitle', model, function (cachedItem) {
        if (cachedItem) {
            cb(cachedItem);
        } else {
            doRequest();
        }
    });
};
