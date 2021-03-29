'use strict';

const Generic = require('./generic');
const sanitize = require('butter-sanitize');

class MovieApi extends Generic {
  constructor(args) {
    super(args);

    this.language = args.language || 'en';
    this.contentLanguage = args.contentLanguage || this.language;
  }

  _formatForPopcorn(movies) {
    const results = [];

    movies.forEach(movie => {
      if (movie.torrents) {
        results.push({
          type: 'movie',
          imdb_id: movie.imdb_id,
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
          synopsis: movie.synopsis,
          trailer: movie.trailer !== null ? movie.trailer : false,
          certification: movie.certification,
          torrents:
            movie.torrents[this.contentLanguage]
              ? movie.torrents[this.contentLanguage]
              : movie.torrents[Object.keys(movie.torrents)[0]],
          langs: movie.torrents,
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

    if (this.language) {
      params.locale = this.language;
    }
    if (this.language !== this.contentLanguage) {
      params.contentLocale = this.contentLanguage;
    }
    if (filters.keywords) {
      params.keywords = this.apiURL[0].includes('popcorn-ru') ? filters.keywords.trim() : filters.keywords.trim().replace(/[^a-zA-Z0-9]|\s/g, '% ');
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

  detail(torrent_id, old_data, debug) {
    return new Promise((resolve, reject) => resolve(old_data));
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
