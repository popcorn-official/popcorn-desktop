'use strict';

const Generic = require('./generic');
const sanitize = require('butter-sanitize');
const i18n = require('i18n');

class TVApi extends Generic {
  constructor(args) {
    super(args);

    this.language = args.language;
    this.contentLanguage = args.contentLanguage || this.language;
    this.contentLangOnly = args.contentLangOnly || false;
  }

  extractIds(items) {
    return items.results.map(item => item.tvdb_id);
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

    const uri = `shows/${filters.page}?` + new URLSearchParams(params);
    return this._get(0, uri).then(data => {
      data.forEach(entry => (entry.type = 'show'));

      return {
        results: sanitize(data),
        hasMore: true
      };
    });
  }

  detail(torrent_id, old_data, debug) {
    return this.contentOnLang(torrent_id, old_data.contextLocale);
  }

  contentOnLang(torrent_id, lang) {
    const params = {};
    if (this.language) {
      params.locale = this.language;
    }
    if (this.language !== lang) {
      params.contentLocale = lang;
    }
    const uri = `show/${torrent_id}?` + new URLSearchParams(params);

    return this._get(0, uri).then(data => {
      return data;
      return sanitize(data);
    });
  }

  filters() {
    const params = {
      contentLocale: this.contentLanguage,
    };
    if (!this.contentLangOnly) {
      params.showAll = 1;
    }
    return this._get(0, 'shows/stat?' + new URLSearchParams(params))
        .then((result) => this.formatFiltersFromServer(
            ['trending', 'popularity', 'updated', 'year', 'name', 'rating'],
            result
        )).catch(() => {
          const data = {
            genres: [
              'All',
              'Action',
              'Adventure',
              'Animation',
              'Children',
              'Comedy',
              'Crime',
              'Documentary',
              'Drama',
              'Family',
              'Fantasy',
              'Game Show',
              'Home and Garden',
              'Horror',
              'Mini Series',
              'Mystery',
              'News',
              'Reality',
              'Romance',
              'Science Fiction',
              'Soap',
              'Special Interest',
              'Sport',
              'Suspense',
              'Talk Show',
              'Thriller',
              'Western'
            ],
            sorters: ['trending', 'popularity', 'updated', 'year', 'name', 'rating'],
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

TVApi.prototype.config = {
  name: 'TVApi',
  uniqueId: 'tvdb_id',
  tabName: 'TV Shows',
  type: 'tvshow',
  metadata: 'trakttv:show-metadata'
};

module.exports = TVApi;
