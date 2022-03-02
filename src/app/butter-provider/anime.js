'use strict';

const Generic = require('./generic');
const sanitize = require('butter-sanitize');
const i18n = require('i18n');

class AnimeApi extends Generic {
  constructor(args) {
    super(args);

    this.language = args.language;
  }

  extractIds(items) {
    return items.results.map(item => item.mal_id);
  }

  fetch(filters) {
    const params = {
      sort: 'seeds',
      limit: '50'
    };

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

    const uri = `animes/${filters.page}?` + new URLSearchParams(params);
    return this._get(0, uri).then(animes => {
      animes.forEach(anime => {
        return {
          images: {
            poster: 'https://media.kitsu.io/anime/poster_images/' + anime._id + '/large.jpg',
            banner: 'https://media.kitsu.io/anime/cover_images/' + anime._id + '/original.jpg',
            fanart: 'https://media.kitsu.io/anime/cover_images/' + anime._id + '/original.jpg',
          },
          mal_id: anime._id,
          haru_id: anime._id,
          tvdb_id: 'mal-' + anime._id,
          imdb_id: anime._id,
          slug: anime.slug,
          title: anime.title,
          year: anime.year,
          type: anime.type,
          item_data: anime.type,
          rating: anime.rating
        };
      });

      return { results: sanitize(animes), hasMore: true };
    });
  }

  detail(torrent_id, old_data, debug) {
    const uri = `anime/${torrent_id}`;

    return this._get(0, uri).then(anime => {
      var result = {
        mal_id: anime._id,
        haru_id: anime._id,
        tvdb_id: 'mal-' + anime._id,
        imdb_id: anime._id,
        slug: anime.slug,
        title: anime.title,
        item_data: anime.type,
        country: 'Japan',
        genre: anime.genres,
        genres: anime.genres,
        num_seasons: 1,
        runtime: anime.runtime,
        status: anime.status,
        synopsis: anime.synopsis,
        network: [], //FIXME
        rating: anime.rating,
        images: {
          poster: 'https://media.kitsu.io/anime/poster_images/' + anime._id + '/large.jpg',
          banner: 'https://media.kitsu.io/anime/cover_images/' + anime._id + '/original.jpg',
          fanart: 'https://media.kitsu.io/anime/cover_images/' + anime._id + '/original.jpg',
        },
        year: anime.year,
        type: anime.type
      };

      if (anime.type === 'show') {
        result = Object.extend(result, { episodes: anime.episodes });
      }

      return sanitize(result);
    });
  }

  filters() {
    const data = {
      genres: [
        'All',
        'Action',
        'Adventure',
        'Cars',
        'Comedy',
        'Dementia',
        'Demons',
        'Drama',
        'Ecchi',
        'Fantasy',
        'Game',
        'Harem',
        'Historical',
        'Horror',
        'Josei',
        'Kids',
        'Magic',
        'Martial Arts',
        'Mecha',
        'Military',
        'Music',
        'Mystery',
        'Parody',
        'Police',
        'Psychological',
        'Romance',
        'Samurai',
        'School',
        'Sci-Fi',
        'Seinen',
        'Shoujo',
        'Shoujo Ai',
        'Shounen',
        'Shounen Ai',
        'Slice of Life',
        'Space',
        'Sports',
        'Super Power',
        'Supernatural',
        'Thriller',
        'Vampire'
      ],
      sorters: ['popularity', 'name', 'year'],
      types: ['All', 'Movies', 'TV', 'OVA', 'ONA']
    };
    let filters = {
      genres: {},
      sorters: {},
      types: {},
    };
    for (const genre of data.genres) {
      filters.genres[genre] = i18n.__(genre.capitalizeEach());
    }
    for (const sorter of data.sorters) {
      filters.sorters[sorter] = i18n.__(sorter.capitalizeEach());
    }
    for (const type of data.types) {
      filters.types[type] = i18n.__(type);
    }

    return Promise.resolve(filters);
  }
}

AnimeApi.prototype.config = {
  name: 'AnimeApi',
  uniqueId: 'mal_id',
  tabName: 'Animes',
  type: 'anime',
  metadata: 'trakttv:anime-metadata'
};

module.exports = AnimeApi;
