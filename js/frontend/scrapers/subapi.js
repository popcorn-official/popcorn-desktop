var url = 'http://subapi.com/';

var supportedLanguages = ['english', 'french', 'dutch', 'portuguese', 'romanian', 'spanish', 'turkish', 'brazilian',
                              'italian', 'german', 'hungarian', 'russian', 'ukrainian', 'finnish', 'bulgarian', 'latvian'];

var SubApi = Backbone.Collection.extend({
    url: url,
    model: App.Model.Movie,

    initialize: function(models, options) {
        if (options.genre) {
            this.url += options.genre.toLowerCase() + '.json';
        } else {
            if (options.keywords) {
                this.url += 'search.json?query=' + options.keywords;
            } else {
                this.url += 'popular.json';
            }
        }

        if (options.page && options.page.match(/\d+/)) {
            var str = this.url.match(/\?/) ? '&' : '?';
            this.url += str + 'page=' + options.page;
        }

        this.options = options;
        Yts.__super__.initialize.apply(this, arguments);
    },

    parse: function (data) {

        var movies = [];

        data.movies.forEach(function (movie) {

            var videos = {};
            var torrents = {};
            torrent = '';
            quality = '';
            var subtitles = {};

            // Put the video and torrent list into a {quality: url} format
            for( var k in movie.videos ) {
                if( typeof videos[movie.videos[k].quality] == 'undefined' ) {
                  videos[movie.videos[k].quality] = movie.videos[k].url;
                }
            }

            for( var k in movie.torrents ) {
              if( typeof torrents[movie.torrents[k].quality] == 'undefined' ) {
                torrents[movie.torrents[k].quality] = movie.torrents[k].url;
              }
            }

            // Pick the worst quality by default
            if( typeof torrents['720p'] != 'undefined' ){ quality = '720p'; torrent = torrents['720p']; }
            else if( typeof torrents['1080p'] != 'undefined' ){ quality = '1080p'; torrent = torrents['1080p']; }

            for( var k in movie.subtitles ) {
                if( supportedLanguages.indexOf(movie.subtitles[k].language) < 0 ){ continue; }
                if( typeof subtitles[movie.subtitles[k].language] == 'undefined' ) {
                    subtitles[movie.subtitles[k].language] = movie.subtitles[k].url;
                }
            }

            if( (typeof movie.subtitles == 'undefined' || movie.subtitles.length == 0) && (typeof movie.videos == 'undefined' || movie.videos.length == 0) ){ return; }

            movies.push({
                imdb:       movie.imdb_id,
                title:      movie.title,
                year:       movie.year,
                runtime:    movie.runtime,
                synopsis:   movie.synopsis,
                voteAverage:movie.vote_average,

                image:      movie.poster,
                bigImage:   movie.poster,
                backdrop:   movie.backdrop,

                quality:    quality,
                torrent:    torrent,
                torrents:   torrents,
                videos:     videos,
                subtitles:  subtitles,
                seeders:    movie.seeders,
                leechers:   movie.leechers
            });
        });

        return movies;
    }
});

App.Scrapers.SubApi = SubApi;