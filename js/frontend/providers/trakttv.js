/*var request = require('request')
  ,*/ var URI = require('URIjs');

// Tempoary wrapper around $.get for request
function request (uri, options, callback) {
	if (typeof uri === 'undefined') throw new Error('undefined is not a valid uri or options object.');
	if ((typeof options === 'function') && !callback) callback = options;
	if (options && typeof options === 'object') {
		options.uri = uri;
	} else if (typeof uri === 'string') {
		options = {uri:uri};
	} else {
		options = uri;
	}

	var jqueryOptions = {
		url: options.uri || options.url
	}
	if(options.json)
		jqueryOptions.dataType = 'json';
	if(options.headers)
		jqueryOptions.headers = options.headers;
	if(options.method)
		jqueryOptions.type = options.method;
	if(options.body)
		jqueryOptions.data = options.body.toString();
	if(options.timeout)
		jqueryOptions.timeout = options.timeout;

	window.$.ajax(jqueryOptions)
		.done(function(data, status, xhr) {
			callback(undefined, xhr, data);
		})
		.fail(function(xhr, status, err) {
			callback(err, xhr, undefined);
		});
}

var API_ENDPOINT = URI('http://api.trakt.tv/'),
	MOVIE_PATH = 'movie',
	API_KEY = '7b7b93f7f00f8e4b488dcb3c5baa81e1619bb074';

function MovieCollection(imdbIDs) {
	this.ids = imdbIDs;
	return this;
}

MovieCollection.prototype.getSummaries = function(callback) {
	if(this.ids.length == 0) {
		callback([]);
		return;
	}

	var uri = API_ENDPOINT.clone()
				.segment([
					MOVIE_PATH,
					'summaries.json',
					API_KEY,
					this.ids.sort().join(','),
					'full'
				]);

	console.logger.debug('Requesting from Trakt.tv: %s', uri.toString());
	console.time('Trakt.tv Request Took');
	request(uri.toString(), {json: true}, function(err, res, body) {
		console.timeEnd('Trakt.tv Request Took');
		callback(body);
	});
}

exports.MovieCollection = MovieCollection;

exports.resizeImage = function(imageUrl, width) {
	var uri = URI(imageUrl),
		ext = uri.suffix()
		file = uri.filename().split('.' + ext)[0];

	return uri.filename(file + '-' + width + '.' + ext).toString();
}