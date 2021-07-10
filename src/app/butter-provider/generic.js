var memoize = require('memoizee');
var _ = require('lodash');
const socksProxyAgent = require( 'socks-proxy-agent' );

String.prototype.capitalizeEach = function () {
  return this.replace(/\w*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

var processArgs = function(config, args) {
  var newArgs = {};
  Object.keys(config.args).map(function(k) {
    if (!args || !args[k]) {
      console.error('value', k, 'was not provided');
      return;
    }

    console.log('processing', k);
    switch (config.args[k]) {
      case Provider.ArgType.NUMBER:
        newArgs[k] = Number(args[k]);
        break;
      case Provider.ArgType.ARRAY:
        newArgs[k] = args[k].split(',');
        break;
      case Provider.ArgType.OBJECT:
        newArgs[k] = JSON.Parse(args[k]);
        break;
      case Provider.ArgType.BOOLEAN:
        newArgs[k] = !!args[k];
        break;
      case Provider.ArgType.STRING:
      default:
        newArgs[k] = args[k];
        break;
    }
  });

  return newArgs;
};

class Provider {
  constructor(args) {
    args = args || {};
    var config = this.config || {};
    config.args = config.args || {};

    var memopts = args.memops || {
      maxAge: 10 * 60 * 1000,
      /* 10 minutes */
      preFetch: 0.5,
      /* recache every 5 minutes */
      primitive: true
    };

    this.args = Object.assign({}, this.args, processArgs(config, args));

    this.memfetch = memoize(this.fetch.bind(this), memopts);
    this.fetch = this._fetch.bind(this);
    this.proxy = '';

    this.detail = memoize(
        this.detail.bind(this),
        _.extend(memopts, {
          async: true
        })
    );

    if (args.apiURL) { this.setApiUrls(args.apiURL); }
  };

  async _get(index, uri) {

    const req = this.buildRequest(this.apiURL[index], uri);
    let err = null;
    console.info(`Request to ${this.constructor.name}: '${req.url}'`);
    try {
      const response = await fetch(req.url, req.options);
      if (response.ok) {
        if (index > 0) {
          this.apiURL = this.apiURL.slice(index).concat(this.apiURL.slice(0, index));
        }
        return await response.json();
      }
    } catch (error) {
      err = error;
    }
    console.warn(`${this.constructor.name} endpoint 'this.apiURL[${index}]' failed.`);

    if (index + 1 >= this.apiURL.length) {
      throw err || new Error('Status Code is above 400');
    }
    return this._get(index+1, uri);
  }

  buildRequest(baseUrl, uri)
  {
    let options = {
      headers: {
        'User-Agent':
            'Mozilla/5.0 (Linux) AppleWebkit/534.30 (KHTML, like Gecko) PT/4.4.0'
      }
    };

    if (this.proxy) {
      options.agent = socksProxyAgent('socks://' + this.proxy);
    }

    // TODO: looks like this not work
    const match = baseUrl.match(/^cloudflare\+(.*):\/\/(.*)\//);
    if (match) {
      baseUrl = `${match[1]}://cloudflare.com/`;
      options.headers.Host = match[2];
    }

    return {
      url: baseUrl + uri,
      options
    };
  }

  setApiUrls(urls) {
    if (typeof urls === 'string') {
      urls = urls.split(',').map((x) => x.trim()).filter((x) => !!x);
    }
    this.apiURL = _.shuffle(urls);
  }

  filters() {return {};}
}

Provider.ArgType = {
  ARRAY: 'BUTTER_PROVIDER_ARG_TYPE_ARRAY',
  OBJECT: 'BUTTER_PROVIDER_ARG_TYPE_OBJECT',
  STRING: 'BUTTER_PROVIDER_ARG_TYPE_STRING',
  BOOLEAN: 'BUTTER_PROVIDER_ARG_TYPE_BOOLEAN',
  NUMBER: 'BUTTER_PROVIDER_ARG_TYPE_NUMBER'
};

Provider.TabType = {
  MOVIE: 'movie',
  TVSHOW: 'tvshow',
  ANIME: 'anime'
};

function warnDefault(fn, support) {
  console.warn(`you are using the default ${fn} implementation,`);
  if (support) {
    console.warn(`you will probably want to use your own to support:${support}.`);
  }
}

function randomArray(a) {
  return a[Math.ceil(Math.random(a.length))];
}

Provider.prototype.resolveStream = function(src, config, data) {
  warnDefault('resolveStream', 'multiple languages');
  return src;
};

Provider.prototype.random = function() {
  console.log('WTDGD');
  warnDefault('random', 'faster random');
  return this.fetch
    .bind(this)()
    .then(function(data) {
      return randomArray(data.results);
    });
};

Provider.prototype.extractIds = function(items) {
  warnDefault('extractIds');
  return _.map(items.results, this.config.uniqueId);
};

Provider.prototype._fetch = function(filters) {
  filters = filters || {};
  filters.toString = this.toString;
  var promise = this.memfetch.bind(this)(filters),
    _this = this;
  promise.catch(function(error) {
    // Delete the cached result if we get an error so retry will work
    _this.memfetch.delete(filters);
  });
  return promise;
};

Provider.prototype.toString = function(arg) {
  return JSON.stringify(this);
};

Provider.prototype.parseArgs = function(name) {
  var tokenize = name.split('?');

  // XXX:reimplement querystring.parse to not escape
  var args = {};
  tokenize[1] &&
    tokenize[1].split('&').map(function(v) {
      var m = v.split('=');
      args[m[0]] = m[1];
    });

  return {
    name: tokenize[0],
    args: args
  };
};

module.exports = Provider;
