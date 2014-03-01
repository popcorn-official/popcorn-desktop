var request = require('request'),
    cheerio = require('cheerio'),
    zlib = require('zlib'),
    fs = require('fs'),

    appUserAgent = 'PopcornHour v1',

    baseUrl = 'http://www.yifysubtitles.com',

    Languages = window.Languages = {
        'spanish': 'Spanish',
        'english': 'English'
    };

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

        var requestOptions = {
            url: baseUrl + '/movie-imdb/tt' + model.imdb,
            headers: {
                'User-Agent': appUserAgent
            }
        };

        request(requestOptions, function(error, response, html) {
            if (!error && response.statusCode == 200) {
                var queries = {},
                    subs = {};

                var $c = cheerio.load(html);

                $c('ul.other-subs>li').each(function(i, element){
                    var a = $c(this).children('.subtitle-download');
                    if(a.attr("href") !== undefined) {
                        var link = a.attr("href");
                        var linkData = (link.substr(link.lastIndexOf('/') + 1)).split('-');
                        var language = linkData[linkData.length-3];
                        if ($.isEmptyObject(queries[language])
                            && !($.isEmptyObject(Languages[language]))) {
                            var subtitleData = {
                                'link' : baseUrl+link
                            };
                            queries[language] = subtitleData;
                        }
                    }
                });

                Object.keys(Languages).forEach(function (language, key) {
                    if (!($.isEmptyObject(queries[language]))) {
                        var subtitleLink = queries[language]["link"];
                        var subRequestOptions = {
                            url: subtitleLink,
                            headers: {
                                'User-Agent': appUserAgent
                            }
                        };
                        request(subRequestOptions, function (error, response, html) {
                            if (!error && response.statusCode == 200) {
                                var $c = cheerio.load(html);
                                var subDownloadLink = $c('a.download-subtitle').attr('href');
                                subs[language] = subDownloadLink;
                                if (key == (Object.keys(Languages).length - 1)) {
                                    App.Cache.setItem('subtitle', model, subs);

                                    // Callback
                                    cb(subs);
                                }
                            }
                        });
                    }
                });
            }
        });


    };

    App.Cache.getItem('subtitle', model, function (cachedItem) {
        /*
         if (cachedItem) {
         cb(cachedItem);
         } else {
         doRequest();
         }
         */
        doRequest();
        if (cachedItem) {
            cb(cachedItem);
        } else {
            doRequest();
        }
    });
};