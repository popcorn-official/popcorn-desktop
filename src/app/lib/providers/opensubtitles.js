(function(App) {
	'use strict';
    var openSRT = require('opensrt_js');
    var Q = require('q');

    var OpenSubtitles = function() {};
    OpenSubtitles.prototype.constructor = OpenSubtitles;
    
    var querySubtitles = function(queryParams) {
    	var deferred = Q.defer();
    	openSRT.searchEpisode(queryParams, function(error, subs) {
    		if(error) {
                deferred.reject(error);
            } else {
                deferred.resolve(subs||{});
            }
    	});
    	return deferred.promise;
    };
    
    var formatForPopcorn = function(data) {
    	for(var lang in data) {
    		data[lang] = data[lang].url;
		}
    	return data;
    };
    
    OpenSubtitles.prototype.fetch = function(queryParams) {
    	return querySubtitles(queryParams)
    		.then(formatForPopcorn);
    };

    
    App.Providers.OpenSubtitles = OpenSubtitles;

})(window.App);