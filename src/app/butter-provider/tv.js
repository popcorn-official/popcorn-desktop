'use strict';

const Generic = require('./generic');
const request = require('request');
const sanitize = require('butter-sanitize');
const TVDB = require('node-tvdb');

class TVApi extends Generic {
  constructor(args) {
    super(args);

    if (args.apiURL) this.apiURL = args.apiURL.split(',');

    this.language = args.language;
    this.quality = args.quality;
    this.translate = args.translate;

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

  _get(index, url, qs) {
    const req = this.buildRequest(
      {
        url,
        json: true,
        qs
      },
      this.apiURL[index]
    );
    console.info(`Request to TVApi: ${req.url}`);

    return new Promise((resolve, reject) => {
      request(req, (err, res, data) => {
        if (err || res.statusCode >= 400) {
          console.warn(`TVApi endpoint '${this.apiURL[index]}' failed.`);
          if (index + 1 >= this.apiURL.length) {
            return reject(err || 'Status Code is above 400');
          } else {
            return this._get(index++, url);
          }
        } else if (!data || data.error) {
          err = data ? data.status_message : 'No data returned';
          console.error(`TVApi error: ${err}`);
          return reject(err);
        } else {
          return resolve(data);
        }
      });
    });
  }

  extractIds(items) {
    return items.results.map(item => item.tvdb_id);
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
    const url = `${this.apiURL[index]}shows/${filters.page}`;
    return this._get(index, url, params).then(data => {
      data.forEach(entry => (entry.type = 'show'));

      return {
        results: sanitize(data),
        hasMore: true
      };
    });
  }

  detail(torrent_id, old_data, debug) {
    const index = 0;
    const url = `${this.apiURL[index]}show/${torrent_id}`;

    return this._get(index, url).then(data => {
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
