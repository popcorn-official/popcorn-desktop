'use strict';

const Generic = require('./generic');
const sanitize = require('butter-sanitize');
const TVDB = require('node-tvdb');

class TVApi extends Generic {
  constructor(args) {
    super(args);

    this.language = args.language;
    this.contentLanguage = args.contentLanguage || this.language;

    try {
      this.tvdb = new TVDB('7B95D15E1BE1D75A');
      this.tvdb.getLanguages().then(langlist => (this.TVDBLangs = langlist));
    } catch (err) {
      this.TVDBLangs = false;
      console.warn(
        'Something went wrong with TVDB, overviews can\'t be translated.'
      );
    }
  }

  extractIds(items) {
    return items.results.map(item => item.tvdb_id);
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
    const params = {};
    if (this.language) {
      params.locale = this.language;
    }
    if (this.language !== this.contentLanguage) {
      params.contentLocale = this.contentLanguage;
    }
    const uri = `show/${torrent_id}?` + new URLSearchParams(params);

    return this._get(0, uri).then(data => {
      console.log(data._id);
      if (this.translate && this.language !== 'en') {
        let langAvailable;
        for (let x = 0; x < this.TVDBLangs.length; x++) {
          if (this.TVDBLangs[x].abbreviation.indexOf(this.language) > -1) {
            langAvailable = true;
            break;
          }
        }

        if (!langAvailable) {
          return sanitize(data);
        } else {
          const reqTimeout = setTimeout(() => sanitize(data), 2000);

          console.info(
            `Request to TVApi: '${old_data.title}' - ${this.language}`
          );
          return this.tvdb
            .getSeriesAllById(old_data.tvdb_id)
            .then(localization => {
              clearTimeout(reqTimeout);

              data = Object.assign(data, {
                synopsis: localization.Overview
              });

              for (let i = 0; i < localization.Episodes.length; i++) {
                for (let j = 0; j < data.episodes.length; j++) {
                  if (
                    localization.Episodes[i].id.toString() ===
                    data.episodes[j].tvdb_id.toString()
                  ) {
                    data.episodes[j].overview =
                      localization.Episodes[i].Overview;
                    break;
                  }
                }
              }

              return sanitize(data);
            })
            .catch(err => sanitize(data));
        }
      } else {
        return sanitize(data);
      }
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
