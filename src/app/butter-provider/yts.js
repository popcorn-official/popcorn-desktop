'use strict';

const Generic = require('./generic');
const request = require('request');
const sanitize = require('butter-sanitize');

const ytsTrackers = [
  'udp://glotorrents.pw:6969',
  'udp://tracker.opentrackr.org:1337',
  'udp://tracker.tiny-vps.com:6969',
  'udp://tracker.openbittorrent.com:1337',
  'udp://tracker.coppersurfer.tk:6969',
  'udp://tracker.leechers-paradise.org:6969',
  'udp://p4p.arenabg.ch:1337',
  'udp://p4p.arenabg.com:1337',
  'udp://tracker.internetwarriors.net:1337',
  'udp://9.rarbg.to:2710',
  'udp://9.rarbg.me:2710',
  'udp://exodus.desync.com:6969',
  'udp://tracker.cyberia.is:6969',
  'udp://tracker.torrent.eu.org:451',
].map(t => `&tr=${t}`).join('');

class YTSApi extends Generic {
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
    if (movies) {
      movies.forEach(movie => {
        if (movie.torrents) {
          results.push({
            type: 'movie',
            imdb_id: movie.imdb_code,
            title: movie.title_english,
            year: movie.year,
            genre: movie.genres,
            rating: movie.rating,
            runtime: movie.runtime,
            images: '',
            image: movie.large_cover_image,
            cover: movie.large_cover_image,
            backdrop: movie.background_image_original,
            poster: movie.large_cover_image,
            synopsis: movie.description_full,
            trailer: 'https://www.youtube.com/watch?v=' + movie.yt_trailer_code || false,
            certification: movie.mpa_rating,
            torrents: movie.torrents.reduceRight(function (torrents, torrent) {
              torrents[torrent.quality] = {
                url: torrent.url,
                magnet: `magnet:?xt=urn:btih:${torrent.hash}${ytsTrackers}`,
                size: torrent.size_bytes,
                filesize: torrent.size,
                seed: torrent.seeds,
                peer: torrent.peers
              };
              return torrents;
            }, {}),
            langs: {[movie.language.replace('cn', 'zh-cn')]: {}}
          });
        }
      });
    }
    return {
      results: sanitize(results),
      hasMore: movies ? movies.movie_count > movies.page_number * movies.limit : false
    };
  }

  _get(index, url, qs) {
    const req = this.buildRequest(
      {
        url: url + 'api/v2/list_movies.json',
        json: true,
        qs,
        timeout: 10000
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
          return resolve(this._formatForPopcorn(data.data.movies));
        }
      });
    });
  }

  extractIds(items) {
    return items.results.map(item => item.imdb_id);
  }

  fetch(filters) {
    const params = {
      sort_by: 'date_added',
      limit: 50,
      with_rt_ratings: true
    };

    if (filters.page) {
      params.page = filters.page;
    }
    if (filters.keywords) {
      params.query_term = filters.keywords.trim().replace(/\s|-|'|:\./g, 'temp0123').replace(/[^a-zA-Z0-9]/g,'').replace(/temp0123/g, '% ');
    }
    if (filters.type && filters.type !== 'All') {
      params.quality = filters.type;
    }
    if (filters.genre && filters.genre !== 'All') {
      params.genre = filters.genre;
    }
    if (filters.order === 1) {
      params.order_by = 'asc';
    }
    if (filters.sorter && filters.sorter !== 'last added') {
      switch (filters.sorter) {
      case 'popularity':
      case 'trending':
        params.sort_by = 'download_count';
        break;
      default:
        params.sort_by = filters.sorter;
      }
    }
    if (filters.rating && filters.rating !== 'All') {
      params.minimum_rating = filters.rating;
    }

    const index = 0;
    const url = `${this.apiURL[index]}`;
    return this._get(index, url, params);
  }

  random() {}

  detail(torrent_id, old_data, debug) {
    return new Promise((resolve, reject) => resolve(old_data));
  }
}

YTSApi.prototype.config = {
  name: 'YTSApi',
  uniqueId: 'imdb_id',
  tabName: 'Movies',
  type: 'movie',
  metadata: 'trakttv:movie-metadata'
};

module.exports = YTSApi;
