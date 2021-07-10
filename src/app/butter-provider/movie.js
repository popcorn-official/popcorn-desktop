'use strict';

const Generic = require('./generic');
const sanitize = require('butter-sanitize');

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
        const curLang = movie.torrents[this.contentLanguage]
            ? this.contentLanguage : Object.keys(movie.torrents)[0];
        let langs = {};
        langs[curLang] = movie.torrents[curLang];
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
          torrents: movie.torrents[curLang],
          langs: langs,
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
    if (!this.contentLangOnly && params.contentLocale !== 'en') {
      params.contentLocale += ',en';
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
