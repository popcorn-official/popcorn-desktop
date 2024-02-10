'use strict';

const TVApi = require('./tv');
const sanitize = require('butter-sanitize');
const i18n = require('i18n');

class AnimeApi extends TVApi {

  fetch(filters) {
    const params = {
      sort: 'seeds',
      limit: '50',
      anime: 1
    };

    params.locale = this.language;
    params.contentLocale = this.contentLanguage;
    if (!this.contentLangOnly) {
      params.showAll = 1;
    }

    if (filters.keywords) {
      params.keywords = filters.keywords.trim();
    }
    if (filters.order) {
      params.order = filters.order;
    }
    if (filters.sorter && filters.sorter !== 'popularity') {
      params.sort = filters.sorter;
    }

    const uri = `shows/${filters.page}?` + new URLSearchParams(params);
    return this._get(0, uri).then(data => {
      data.forEach(entry => {entry.type = 'show'; entry.title = entry.slug.replace(/-/g, ' ').capitalizeEach();});

      return {
        results: sanitize(data),
        hasMore: true
      };
    });
  }

  formatFiltersFromServer(sorters, data)
  {
    let filters = {
      genres: {},
      sorters: {},
    };
    for (const genre of sorters) {
      filters.sorters[genre] = i18n.__(genre.capitalizeEach());
    }

    filters.genres = {
      'All': 'Anime',
    };

    return filters;
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
            sorters: ['trending', 'popularity', 'updated', 'year', 'name', 'rating'],
          };
          let filters = {
            genres: {},
          };
          for (const sorter of data.sorters) {
            filters.sorters[sorter] = i18n.__(sorter.capitalizeEach());
          }

          return Promise.resolve(filters);
        });
  }
}

AnimeApi.prototype.config = {
  name: 'AnimeApi',
  uniqueId: 'tvdb_id',
  tabName: 'Anime',
  type: 'anime',
  metadata: 'trakttv:show-metadata'
};

module.exports = AnimeApi;
