(function (App) {
	'use strict';
	var openSRT = require('popcorn-opensubtitles');
	var Q = require('q');
	var userAgent = 'Popcorn Time v1';

	var OpenSubtitles = function () {};
	OpenSubtitles.prototype.constructor = OpenSubtitles;

	var formatForPopcorn = function (data) {
		for (var lang in data) {
			data[lang] = data[lang].url;
		}
		return data;
	};

	OpenSubtitles.prototype.fetch = function (queryParams) {
		return openSRT.searchEpisode(queryParams, userAgent)
			.then(formatForPopcorn);
	};

	App.Providers.OpenSubtitles = OpenSubtitles;

})(window.App);
