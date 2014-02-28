App.getTorrentsCollection = function (options) {

    var start = +new Date(),
        url = 'http://yts.re/api/list.json?sort=seeds&limit=50';

    if (options.keywords) {
        url += '&keywords=' + options.keywords;
    }

    if (options.genre) {
        url += '&genre=' + options.genre;
    }

    if (options.page && options.page.match(/\d+/)) {
        url += '&set=' + options.page;
    }

    var MovieTorrentCollection = Backbone.Collection.extend({
        url: url,
        model: App.Model.Movie,
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

    return new MovieTorrentCollection();
};
