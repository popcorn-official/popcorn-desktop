'use strict';

const Generic = require('./generic');
const request = require('request');
const fetch = require('node-fetch');
const sanitize = require('butter-sanitize');

class MovieApi extends Generic {
  constructor(args) {
    super(args);

    if (args.apiURL) {
      this.apiURL = args.apiURL.split(',');
    }
    this.language = args.language;
    this.quality = args.quality;
    this.translate = args.translate;
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
            movie.torrents['en'] !== null
              ? movie.torrents['en']
              : movie.torrents[Object.keys(movie.torrents)[0]],
          langs: movie.torrents
        });
      }
    });

    return {
      results: sanitize(results),
      hasMore: true
    };
  }

  async _get(index, uri) {

    const req = this.buildRequestWithBased(this.apiURL[index], uri);
    let err = null;
    console.info(`Request to MovieApi: '${req.url}'`);
    alert(JSON.stringify(req));
    try {
      const response = await fetch(req.url, req.options);
      if (response.ok) {
        if (index > 0) {
          // TODO: put all broken urls to end
        }
        return await response.json();
      }
    } catch (error) {
      err = error;
    }
    console.warn(`MovieApi endpoint 'this.apiURL[index]' failed.`);

    if (index + 1 >= this.apiURL.length) {
      throw err || new Error('Status Code is above 400');
    }
    return this._get(index+1, uri);
  }

  extractIds(items) {
    return items.results.map(item => item.imdb_id);
  }

  fetch(filters) {
    const params = {
      sort: 'seeds',
      limit: '50'
    };

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
