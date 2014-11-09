(function (App) {
	'use strict';

	var openSRT = require('popcorn-opensubtitles');
	var userAgent = 'Popcorn Time v1';

	var OpenSubtitles = App.Subtitles.Generic.extend({
		defaults: {
			id: 'opensubtitles',
			name: 'Open Subtitles',
			type: 'tv'
		},

		get: function (queryParams) {
			return openSRT.searchEpisode(queryParams, userAgent)
				.then(formatForPopcorn);
		}
	});

	function formatForPopcorn(data) {
		for (var lang in data) {
			data[lang] = data[lang].url;
		}
		return data;
	}

	App.Subtitles.OpenSubtitles = OpenSubtitles;
})(window.App);
