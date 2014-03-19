

var trakt = require('./js/frontend/providers/trakttv');

var url = 'http://yts.re/api/list.json?sort=seeds&limit=50';

// Hack to keep to cancel the request in case of new request
var currentRequest = null;

var Yts = Backbone.Collection.extend({
    apiUrl: url,
    model: App.Model.Movie,

    initialize: function(models, options) {
        if (options.keywords) {
            this.apiUrl += '&keywords=' + options.keywords;
        }

        if (options.genre) {
            this.apiUrl += '&genre=' + options.genre;
        }

        if (options.page && options.page.match(/\d+/)) {
            this.apiUrl += '&set=' + options.page;
        }

        this.options = options;
        Yts.__super__.initialize.apply(this, arguments);
    },

    fetch: function() {
        var collection = this;

        if(currentRequest) {
            currentRequest.abort();
        }

        currentRequest = request(this.apiUrl, {json: true}, function(err, res, ytsData) {
            var movies = [],
            memory = {};

            if (ytsData.error || typeof ytsData.MovieList === 'undefined') {
                collection.set(movies);
                collection.trigger('loaded');
                return;
            }

            var imdbCodes = _.pluck(ytsData.MovieList, 'ImdbCode');
            var traktMovieCollection = new trakt.MovieCollection(imdbCodes);
            traktMovieCollection.getSummaries(function(trakData) {
                ytsData.MovieList.forEach(function (movie) {
                    // No imdb, no movie.
                    if( typeof movie.ImdbCode != 'string' || movie.ImdbCode.replace('tt', '') == '' ){ return; }

                    var traktInfo = _.find(trakData, function(trakMovie) { return trakMovie.imdb_id == movie.ImdbCode });
                    if(traktInfo) {
                        traktInfo.images.posterSmall = trakt.resizeImage(traktInfo.images.poster, '138');
                    } else {
                        traktInfo = {images:{}};
                    }

                    var torrents = {};
                    torrents[movie.Quality] = movie.TorrentUrl;

                    // Temporary object
                    var movieModel = {
                        imdb:       movie.ImdbCode.replace('tt', ''),
                        title:      movie.MovieTitleClean,
                        year:       movie.MovieYear,
                        runtime:    +traktInfo.runtime || 0,
                        synopsis:   traktInfo.overview || "",
                        voteAverage:parseFloat(movie.MovieRating),

                        image:      traktInfo.images.poster ? trakt.resizeImage(traktInfo.images.poster, '138') : movie.CoverImage.replace(/_med\./, '_large.'),
                        bigImage:   traktInfo.images.poster ? trakt.resizeImage(traktInfo.images.poster, '300') : movie.CoverImage.replace(/_med\./, '_large.'),
                        backdrop:   traktInfo.images.fanart,

                        quality:    movie.Quality,
                        torrent:    movie.TorrentUrl,
                        torrents:   torrents,
                        videos:     {},
                        subtitles:  {},
                        seeders:    movie.TorrentSeeds,
                        leechers:   movie.TorrentPeers,

                        // YTS do not provide metadata and subtitle
                        hasMetadata:false,
                        hasSubtitle:false
                    };

                    var stored = memory[movieModel.imdb];

                    // Create it on memory map if it doesn't exist.
                    if (typeof stored === 'undefined') {
                        stored = memory[movieModel.imdb] = movieModel;
                    }

                    if (stored.quality !== movieModel.quality && movieModel.quality === '720p') {
                        stored.torrent = movieModel.torrent;
                        stored.quality = '720p';
                    }

                    // Set it's correspondent quality torrent URL.
                    stored.torrents[movie.Quality] = movie.TorrentUrl;

                    // Push it if not currently on array.
                    if (movies.indexOf(stored) === -1) {
                        movies.push(stored);
                    }
                });

                collection.set(movies);
                collection.trigger('loaded');
                console.log(movies);
                return;
            })
        })
    }
});

App.Scrapers.Yts = Yts;