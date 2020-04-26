'use strict';

const Generic = require('./generic');
const request = require('request');
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
          image: movie.images.poster,
          cover: movie.images.poster,
          backdrop: movie.images.fanart,
          poster: movie.images.poster,
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

  _get(index, url, qs) {
    const req = this.buildRequest(
      {
        url,
        json: true,
        qs
      },
      this.apiURL[index]
    );
    console.info(`Request to MovieApi: '${req.url}'`);

    return new Promise((resolve, reject) => {
      request(req, (err, res, data) => {
        if (err || res.statusCode >= 400) {
          console.warn(`MovieApi endpoint 'this.apiURL[index]' failed.`);
          if (index + 1 >= this.apiURL.length) {
            return reject(err || 'Status Code is above 400');
          } else {
            return this._get(index++, url);
          }
        } else if (!data || data.error) {
          err = data ? data.status_message : 'No data returned';
          console.error(`MovieApi error: ${err}`);
          return reject(err);
        } else {
          return resolve(this._formatForPopcorn(data));
        }
      });
    });
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
      params.keywords = filters.keywords.replace(/\s/g, '% ');
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

    const index = 0;
    const url = `${this.apiURL[index]}movies/${filters.page}`;
    return this._get(index, url, params);
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
