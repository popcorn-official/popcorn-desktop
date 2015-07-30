var Common = {};
var crypt = require('crypto');
var fs = require('fs');
var Q = require('q');
Common.healthMap = {
    0: 'bad',
    1: 'medium',
    2: 'good',
    3: 'excellent'
};

Common.calcHealth = function (torrent) {
    var seeds = torrent.seed;
    var peers = torrent.peer;

    // First calculate the seed/peer ratio
    var ratio = peers > 0 ? (seeds / peers) : seeds;

    // Normalize the data. Convert each to a percentage
    // Ratio: Anything above a ratio of 5 is good
    var normalizedRatio = Math.min(ratio / 5 * 100, 100);
    // Seeds: Anything above 30 seeds is good
    var normalizedSeeds = Math.min(seeds / 30 * 100, 100);

    // Weight the above metrics differently
    // Ratio is weighted 60% whilst seeders is 40%
    var weightedRatio = normalizedRatio * 0.6;
    var weightedSeeds = normalizedSeeds * 0.4;
    var weightedTotal = weightedRatio + weightedSeeds;

    // Scale from [0, 100] to [0, 3]. Drops the decimal places
    var scaledTotal = ((weightedTotal * 3) / 100) | 0;

    return scaledTotal;
};

Common.md5 = function (arg) {
    return crypt.createHash('md5').update(arg).digest('hex');
};

Common.copyFile = function (source, target, cb) {
    var cbCalled = false;

    var rd = fs.createReadStream(source);

    function done(err) {
        if (!cbCalled) {
            if (err) {
                fs.unlink(target);
            }
            cb(err);
            cbCalled = true;
        }
    }

    rd.on('error', done);

    var wr = fs.createWriteStream(target);
    wr.on('error', done);
    wr.on('close', function (ex) {
        done();
    });

    rd.pipe(wr);
};

Common.fileSize = function (num) {
    if (isNaN(num)) {
        return;
    }

    num = parseInt(num);

    var exponent, unit, units, base;
    var neg = num < 0;

    switch (os.platform()) {
    case 'linux':
        base = 1024;
        units = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
        break;
    case 'win32':
        base = 1024;
        units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        break;
    case 'darwin':
        /* falls through */
    default:
        base = 1000;
        units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    }

    if (neg) {
        num = -num;
    }

    if (num < 1) {
        unit = units[0];
        if (Settings.language === 'fr') {
            unit = unit.replace('B', 'o');
        }
        return (neg ? '-' : '') + num + ' ' + unit;
    }

    exponent = Math.min(Math.floor(Math.log(num) / Math.log(base)), units.length - 1);
    num = (num / Math.pow(base, exponent)).toFixed(2) * 1;
    unit = units[exponent];

    var matcher = Settings.language.match(/sq|es|hy|az|be|qu|pt|bs|ca|bg|hr|cs|da|et|fo|fi|fr|de|ka|el|hu|is|id|it|kk|lv|lt|mn|nl|nn|nb|no|pl|ro|ru|sr|sk|sl|sv|tr|uk|uz|vi/);
    if (matcher !== null) {
        num = num.toString().replace('.', ',');
    }
    if (Settings.language === 'fr') {
        unit = unit.replace('B', 'o');
    }
    return (neg ? '-' : '') + num + ' ' + unit;
};

Common.matchTorrent = function (file, torrent) {
    var defer = Q.defer();
    var data = {};

    var checkTraktSearch = function (trakt, filename) {
        return Q.Promise(function (resolve, reject) {
            var traktObj = trakt
                .match(/[\w+\s+]+/ig)[0]
                .split(' ');
            traktObj.forEach(function (word) {
                if (word.length >= 4) {
                    var regxp = new RegExp(word.slice(0,3), 'ig');
                    if (filename.replace(/\W/ig, '').match(regxp) === null) {
                        return reject(new Error('Trakt search result did not match the filename'));
                    }
                }
            });
            resolve();
        });
    };

    var searchMovie = function (title) {
        return Q.Promise(function (resolve, reject) {

            // find a matching movie
            App.Trakt.search(title, 'movie')
                .then(function (summary) {

                    if (!summary || summary.length === 0) {
                        reject(new Error('Unable to fetch data from Trakt.tv'));
                    } else {
                        checkTraktSearch(summary[0].movie.title, data.filename)
                            .then( function () {
                                data.movie = {};
                                data.type = 'movie';
                                data.movie.image = summary[0].movie.images.fanart.medium;
                                data.movie.imdbid = summary[0].movie.ids.imdb;
                                data.movie.title = summary[0].movie.title;
                                resolve(data);
                            })
                            .catch( function (err) {
                                data.error = err.message;
                                resolve(data);
                            });
                    }

                })
                .catch(function (err) {
                    reject(new Error('An error occured while trying to get subtitles'));
                });
        });
    };

    var searchEpisode = function (title, season, episode) {
        return Q.Promise(function (resolve, reject) {
            if (!title || !season || !episode) {
                return reject(new Error('Title, season and episode need to be passed'));
            }

            // find a matching show
            App.Trakt.shows.summary(title)
                .then(function (summary) {

                    if (!summary || summary.length === 0) {
                        return reject(new Error('Unable to fetch data from Trakt.tv'));
                    } else {

                        // find the corresponding episode
                        App.Trakt.episodes.summary(title, season, episode)
                            .then(function (episodeSummary) {

                                if (!episodeSummary) {
                                    return reject(new Error('Unable to fetch data from Trakt.tv'));
                                } else {
                                    data.show = {};
                                    data.show.episode = {};
                                    data.type = 'episode';
                                    data.show.episode.image = episodeSummary.images.screenshot.full;
                                    data.show.imdbid = summary.ids.imdb;
                                    data.show.episode.season = episodeSummary.season.toString();
                                    data.show.episode.episode = episodeSummary.number.toString();
                                    data.show.episode.tvdbid = episodeSummary.ids.tvdb;
                                    data.show.tvdbid = summary.ids.tvdb;
                                    data.show.title = summary.title;
                                    data.show.episode.title = episodeSummary.title;

                                    resolve(data);
                                }

                            }).catch(function (err) {
                                reject(new Error('An error occured while trying to get subtitles'));
                            });
                    }

                })
                .catch(function (err) {
                    reject(new Error('An error occured while trying to get subtitles'));
                });
        });
    };

    var injectTorrent = function (file, torrent) {
        return Q.Promise(function (resolve, reject) {
            if (!torrent) {
                resolve(file);
            }
            var torrentparsed;
            var to_re = torrent.match(/.*?(complete.series|complete.season|s\d+|season|\[|hdtv|\W\s)/i);

            if (to_re === null || to_re[0] === '') {
                torrentparsed = torrent;
            } else {
                torrentparsed = to_re[0].replace(to_re[1], '');
            }

            var torrent_regx = new RegExp(torrentparsed.split(/\W/)[0], 'ig');
            var torrent_match = file.match(torrent_regx);

            if (torrent_match === null) {
                file = torrentparsed + ' ' + file;
            }

            resolve(file);
        });
    };

    var formatTitle = function (title) {
        return Q.Promise(function (resolve, reject) {
            var formatted = {};

            // regex match
            var se_re = title.match(/(.*)S(\d\d)E(\d\d)/i); // regex try (ex: title.s01e01)
            if (se_re !== null) {
                formatted.episode = se_re[3];
                formatted.season = se_re[2];
                formatted.title = se_re[1];
            } else {
                se_re = title.match(/(.*)(\d\d\d\d)+\W/i); // try another regex (ex: title.0101)
                if (se_re !== null) {
                    formatted.episode = se_re[2].substr(2, 4);
                    formatted.season = se_re[2].substr(0, 2);
                    formatted.title = se_re[1];
                } else {
                    se_re = title.match(/(.*)(\d\d\d)+\W/i); // try yet another (ex: title.101)
                    if (se_re !== null) {
                        formatted.episode = se_re[2].substr(1, 2);
                        formatted.season = se_re[2].substr(0, 1);
                        formatted.title = se_re[1];
                    } else {
                        se_re = title.replace(/\[|\]|\(|\)/, '').match(/.*?0*(\d+)?[xE]0*(\d+)/i); // try a last one (ex: 101, or 1x01)
                        if (se_re !== null) {
                            formatted.episode = se_re[2];
                            formatted.season = se_re[1];
                            formatted.title = se_re[0].replace(/0*(\d+)?[xE]0*(\d+)/i, '');
                        } else {
                            // nothing worked :(
                        }
                    }
                }
            }

            // format
            formatted.title = formatted.title || title.replace(/\..+$/, ''); // remove extension;
            formatted.title = $.trim(formatted.title.replace(/[\.]/g, ' '))
                .replace(/^\[.*\]/, '') // starts with brackets
                .replace(/[^\w ]+/g, '') // remove brackets
                .replace(/ +/g, '-') // has multiple spaces
                .replace(/_/g, '-') // has '_'
                .replace(/\-$/, '') // ends with '-'
                .replace(/\s.$/, '') // ends with ' '
                .replace(/^\./, '') // starts with '.'
                .replace(/^\-/, ''); // starts with '-'

            // just in case
            if (!formatted.title || formatted.title.length === 0) {
                formatted.title = title;
            }

            // return :)
            resolve(formatted);
        });
    };

    // function starts here
    if (!file && !torrent) {

        // reject on missing input
        defer.reject(new Error('File name is required'));

    } else {

        // inject torrent title if not in filename
        injectTorrent(file, torrent)
            .then(function (parsed) {
                var title = $.trim(parsed.replace(/\[rartv\]/i, '').replace(/\[PublicHD\]/i, '').replace(/\[ettv\]/i, '').replace(/\[eztv\]/i, '')).replace(/[\s]/g, '.');
                data.filename = file;

                formatTitle(parsed)
                    .then(function (obj) {
                        searchEpisode(obj.title, obj.season, obj.episode)
                            .then(function (result) {
                                result.filename = data.filename;
                                defer.resolve(result);
                            })
                            .catch(function (error) {
                                searchMovie(obj.title)
                                    .then(function (result) {
                                        result.filename = data.filename;
                                        defer.resolve(result);
                                    })
                                    .catch(function (error) {
                                        data.error = error.message;
                                        defer.resolve(data);
                                    });
                            });
                    })
                    .catch(function (error) {
                        data.error = error.message;
                        defer.resolve(data);
                    });
            })
            .catch(function (error) {
                data.error = error.message;
                defer.resolve(data);
            });
    }

    return defer.promise;
 };