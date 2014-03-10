App.getTorrentsCollection = function (options) {

    var start = +new Date(),
        url = 'http://subapi.com/';

    var supportedLanguages = ['english', 'french', 'dutch', 'portuguese', 'romanian', 'spanish', 'turkish', 'brazilian', 'italian'];

    if (options.genre) {
        url += options.genre.toLowerCase() + '.json';
    } else {
        if (options.keywords) {
            url += 'search.json?query=' + options.keywords;
        } else {
            url += 'popular.json';
        }
    }

    if (options.page && options.page.match(/\d+/)) {
        var str = url.match(/\?/) ? '&' : '?';
        url += str + 'page=' + options.page;
    }

    var MovieTorrentCollection = Backbone.Collection.extend({
        url: url,
        model: App.Model.Movie,
        parse: function (data) {
            
            var movies = [];

            data.movies.forEach(function (movie) {

                var torrents = {};
                torrent = '';
                var subtitles = {};

                for( var k in movie.torrents ) {
                    if( typeof torrents[movie.torrents[k].quality] == 'undefined' ) {
                        torrents[movie.torrents[k].quality] = movie.torrents[k].url;
                    }
                }

                // Pick the worst quality by default
                if( typeof torrents['1080p'] != 'undefined' ){ quality = '1080p'; torrent = torrents['1080p']; }
                if( typeof torrents['720p'] != 'undefined' ){ quality = '720p'; torrent = torrents['720p']; }

                for( var k in movie.subtitles ) {
                    if( supportedLanguages.indexOf(movie.subtitles[k].language) < 0 ){ continue; }
                    if( typeof subtitles[movie.subtitles[k].language] == 'undefined' ) {
                        subtitles[movie.subtitles[k].language] = movie.subtitles[k].url;
                    }
                }
                
                movies.push({
                    imdb:       movie.imdb_id,
                    title:      movie.title,
                    year:       movie.year,
                    runtime:    movie.runtime,
                    synopsis:   movie.synopsis,
                    voteAverage:movie.vote_average,

                    coverImage: movie.poster,
                    backdropImage: movie.backdrop,

                    quality:    quality,
                    torrent:    torrent,
                    torrents:   torrents,
                    subtitles:  subtitles,
                    seeders:    movie.seeders,
                    leechers:   movie.leechers
                });
            });

            return movies;
        }
    });

    return new MovieTorrentCollection();
};
