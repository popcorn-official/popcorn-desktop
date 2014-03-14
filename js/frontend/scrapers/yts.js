var url = 'http://yts.re/api/list.json?sort=seeds&limit=50';

var Yts = Backbone.Collection.extend({
    url: url,
    model: App.Model.Movie,

    initialize: function(models, options) {
        if (options.keywords) {
            this.url += '&keywords=' + options.keywords;
        }

        if (options.genre) {
            this.url += '&genre=' + options.genre;
        }

        if (options.page && options.page.match(/\d+/)) {
            this.url += '&set=' + options.page;
        }
    },

    parse: function (data) {
        var movies = [],
            memory = {};

        if (data.error || typeof data.MovieList === 'undefined') {
            return movies;
        }

        data.MovieList.forEach(function (movie) {
            // No imdb, no movie.
            if( typeof movie.ImdbCode != 'string' || movie.ImdbCode.replace('tt', '') == '' ){ return; }

            // Temporary object
            var movieModel = {
                imdb:       movie.ImdbCode.replace('tt', ''),
                coverImage: movie.CoverImage,
                year:       movie.MovieYear,
                title:      movie.MovieTitleClean,
                torrent:    movie.TorrentUrl,
                torrents:   {},
                quality:    movie.Quality,
                seeders:    movie.TorrentSeeds,
                leechers:   movie.TorrentPeers
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

        console.log('Torrents found:', data.MovieList.length);

        return movies;
    }
});

App.Scrapers.Yts = Yts;