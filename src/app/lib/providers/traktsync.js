(function(App) {
  'use strict';

  function syncShows() {
    return Promise.all([syncShowsFromTrakt(), syncShowsFromLocal()]);
  }

  function syncShowsFromTrakt() {
    return App.Trakt.show.getWatched()
      .then(function(data) {
        // Format them for insertion
        var watched = [];

        if (data) {
          var show;
          var season;
          for (var d in data) {
            show = data[d];
            for (var s in show.seasons) {
              season = show.seasons[s];
              for (var e in season.episodes) {
                watched.push({
                  tvdb_id: show.tvdb_id.toString(),
                  show_imdb_id: show.imdb_id.toString(),
                  season: season.season.toString(),
                  episode: season.episodes[e].toString(),
                  type: 'episode',
                  date: new Date()
                });
              }
            }
          }
        }

        return watched;
      })
      .then(function(traktWatched) {
        // Insert them locally
        return new Promise(function(resolve, reject) {
          Database.markEpisodesWatched(traktWatched, function(err, results) {
            if (err) {
              return reject(err);
            }

            return resolve(results);

          });
        });
      });
  }

  function syncShowsFromLocal() {
    return new Promise(function(resolve, reject) {
        Database.getAllEpisodesWatched(function(err, results) {
          if (err) {
            return reject(err);
          }

          return resolve(results);

        });
      })
      .then(function(results) {
        return results.reduce(function(prev, current) {
          if (current.tvdb_id) {
            if (!prev[current.tvdb_id]) {
              prev[current.tvdb_id] = {
                tvdb_id: current.tvdb_id,
                episode: []
              };
            }

            prev[current.tvdb_id].episode.push({
              season: current.season,
              episode: current.episode
            });
          }

          return prev;
        }, {});
      })
      .then(function(shows) {

        var promises = Object.keys(shows).map(function(showId) {
          var show = shows[showId];
          return App.Trakt.show.episodeSeen(show.tvdb_id, show.episode);
        });

        return Promise.all(promises);
      });
  }

  function syncMovies() {
    return Promise.all([syncMoviesFromTrakt(), syncMoviesFromLocal()]);
  }

  function syncMoviesFromTrakt() {
    App.Trakt.movie.getWatched()
      .then(function(data) {
        var watched = [];

        if (data) {
          var movie;
          for (var m in data) {
            movie = data[m];
            watched.push({
              movie_id: movie.imdb_id.toString(),
              date: new Date(),
              type: 'movie'
            });
          }
        }

        return watched;
      })
      .then(function(traktWatched) {
        return new Promise(function(resolve, reject) {
          Database.markMoviesWatched(traktWatched, function(err, results) {
            if (err) {
              return reject(err);
            }

            return resolve(results);

          });
        });
      });
  }

  function syncMoviesFromLocal() {
    return new Promise(function(resolve, reject) {
        Database.getMoviesWatched(function(err, results) {
          if (err) {
            return reject(err);
          }

          return resolve(results);

        });
      })
      .then(function(results) {
        return results.map(function(item) {
          return item.movie_id;
        });
      })
      .then(function(movieIds) {
        return App.Trakt.movie.seen(movieIds);
      });
  }

  var TraktSync = function() {
    return Promise.all([syncShows(), syncMovies()]);
  };

  App.Providers.TraktSync = TraktSync;

})(window.App);