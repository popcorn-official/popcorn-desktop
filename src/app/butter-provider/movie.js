'use strict';

const Generic = require('./generic');
const sanitize = require('butter-sanitize');
const i18n = require('i18n');

class MovieApi extends Generic {
  constructor(args) {
    super(args);

    this.language = args.language;
    this.contentLanguage = args.contentLanguage || this.language;
    this.contentLangOnly = args.contentLangOnly || false;
  }

  _formatForPopcorn(movies) {
    const results = [];

    movies.forEach(movie => {
      if (movie.torrents) {
        results.push({
          type: 'movie',
          imdb_id: movie.imdb_id,
          tmdb_id: movie.tmdb_id,
          title: movie.title,
          year: movie.year,
          genre: movie.genres,
          rating: parseInt(movie.rating.percentage, 10) / 10,
          runtime: movie.runtime,
          images: movie.images,
          image: movie.images ? movie.images.poster : false,
          cover: movie.images ? movie.images.poster : false,
          backdrop: movie.images ? movie.images.fanart : false,
          poster: movie.images ? movie.images.poster : false,
          poster_medium: movie.images ? movie.images.poster_medium : false,
          synopsis: movie.synopsis,
          trailer: movie.trailer !== null ? movie.trailer : false,
          certification: movie.certification,
          torrents: movie.torrents[movie.contextLocale],
          langs: movie.torrents,
          defaultAudio: movie.contextLocale,
          locale: movie.locale || null,
        });
      }
    });

    return {
      results: sanitize(results),
      hasMore: true
    };
  }

  extractIds(items) {
    return items.results.map(item => item.imdb_id);
  }

  fetch(filters) {
    const params = {
      sort: 'seeds',
      limit: '50'
    };

    params.locale = this.language;
    params.contentLocale = this.contentLanguage;
    if (!this.contentLangOnly) {
      params.showAll = 1;
    }

    if (filters.keywords) {
      params.keywords = filters.keywords.trim();
    }
    if (filters.genre) {
      params.genre = filters.genre;
    }
    if (filters.order) {
      params.order = filters.order;
    }
    if (filters.sorter && filters.sorter !== 'popularity') {
      params.sort = filters.sorter;
    }

    const uri = `movies/${filters.page}?` + new URLSearchParams(params);
    return this._get(0, uri).then((data) => this._formatForPopcorn(data));
  }

  random() {}

  detail(imdb_id, old_data, debug) {
    return new Promise((resolve, reject) => resolve(old_data));
  }

  feature(name) { return name==='torrents'; }

  torrents(imdb_id, lang) {
    const params = {
      locale: this.language,
      contentLocale: lang,
    };
    const uri = `movie/${imdb_id}/torrents?` + new URLSearchParams(params);
    return this._get(0, uri);
  }

  filters() {
    const params = {
      contentLocale: this.contentLanguage,
    };
    if (!this.contentLangOnly) {
      params.showAll = 1;
    }
    return this._get(0, 'movies/stat?' + new URLSearchParams(params))
        .then((result) => this.formatFiltersFromServer(
          ['trending', 'popularity', 'last added', 'year', 'title', 'rating'],
          result
        )).catch(() => {
          const data = {
            genres: [
              'All',
              'Action',
              'Adventure',
              'Animation',
              'Biography',
              'Comedy',
              'Crime',
              'Documentary',
              'Drama',
              'Family',
              'Fantasy',
              'Film-Noir',
              'History',
              'Horror',
              'Music',
              'Musical',
              'Mystery',
              'Romance',
              'Sci-Fi',
              'Short',
              'Sport',
              'Thriller',
              'War',
              'Western'
            ],
            sorters: ['trending', 'popularity', 'last added', 'year', 'title', 'rating'],
          };
          let filters = {
            genres: {},
            sorters: {},
          };
          for (const genre of data.genres) {
            filters.genres[genre] = i18n.__(genre.capitalizeEach());
          }
          for (const sorter of data.sorters) {
            filters.sorters[sorter] = i18n.__(sorter.capitalizeEach());
          }

          return Promise.resolve(filters);
        });
  }
}

MovieApi.prototype.config = {
  name: 'MovieApi',
  uniqueId: 'imdb_id',
  tabName: 'Movies',
  type: 'movie',
  metadata: 'trakttv:movie-metadata'
};

module.exports = MovieApi;
