App.getTorrentsCollection = function (options) {

    var start = +new Date(),
        url = 'http://subapi.com/';


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
        url += '?page=' + options.page;
    }

    var MovieTorrentCollection = Backbone.Collection.extend({
        url: url,
        model: App.Model.Movie,
        parse: function (data) {
            
            var movies = [];

            data.movies.forEach(function (movie) {

				var torrents = {};

				for( var k in movie.torrents ) {
					if( typeof torrents[movie.torrents[k].quality] == 'undefined' ) {
						torrents[movie.torrents[k].quality] = movie.torrents[k].url;
					}
				}

				// Pick the worst quality by default
				if( typeof torrents['1080p'] != 'undefined' ){ quality = '1080p'; }
				if( typeof torrents['720p'] != 'undefined' ){ quality = '720p'; }

                movies.push({
                    imdb:       movie.imdb_id,
                    title:      movie.title,
                    year:       movie.year,
                    voteAverage:movie.vote_average,

                    coverImage: movie.poster,
                    backdropImage: movie.backdrop,

					quality:    quality,
                    torrents:   torrents,
                    subtitles:  movie.subtitles,
                    seeders:    movie.seeders,
                    leechers:   movie.leechers
                });
            });
            
console.log(movies);

            return movies;
        }
    });

    return new MovieTorrentCollection();
};
