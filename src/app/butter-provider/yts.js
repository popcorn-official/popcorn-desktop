'use strict';

const Generic = require('./generic');
const sanitize = require('butter-sanitize');

class YTSApi extends Generic {
  constructor(args) {
    super(args);

    this.language = args.language;
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
                magnet: `magnet:?xt=urn:btih:${torrent.hash}`,
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

    const uri = `api/v2/list_movies.json?` + new URLSearchParams(params);
    return this._get(0, uri).then((data) => this._formatForPopcorn(data.data.movies))
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
