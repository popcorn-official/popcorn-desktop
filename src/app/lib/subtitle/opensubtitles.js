(function(App) {
	'use strict';

	var openSRT = require('opensrt_js');
	var Q = require('q');

	var OpenSubtitles = App.Subtitles.Generic.extend ({
		defaults: {
			id: 'opensubtitles',
			name: 'Open Subtitles',
			type: 'tv'
		},

		fetch: function(queryParams) {
			return querySubtitles(queryParams)
    		.then(formatForPopcorn);
		}
	});

    function querySubtitles(queryParams) {
    	var deferred = Q.defer();
    	openSRT.searchEpisode(queryParams, function(error, subs) {
			if (error) {
				deferred.reject(error);
			} else {
				deferred.resolve(subs || {});
			}
    	});
    	return deferred.promise;
    };
    
    function formatForPopcorn(data) {
    	for(var lang in data) {
    		data[lang] = data[lang].url;
		}
    	return data;
    };

	App.Subtitles.OpenSubtitles = OpenSubtitles;
})(window.App);
