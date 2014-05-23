(function(App) {
	'use strict';
    var openSRT = require('opensrt_js');

    var OpenSubtitles = function() {};
    OpenSubtitles.prototype.constructor = OpenSubtitles;
    
    var querySubtitles = function(queryParams, cb) {
    	openSRT.searchEpisode(queryParams, function(err, subs) {
    		cb(subs||{});
    	});
    };
    
    var formatForPopcorn = function(data) {
    	for(var lang in data) {
    		data[lang] = data[lang].url;
		}
    	return data;
    };
	
    // TODO: TV episode subs query calls are asynchronous
    // maybe we can define a new interface for sync calls 
    // or use Q promise on calling party (streamer)
    OpenSubtitles.prototype.query = function(queryParams, cb) {
    	querySubtitles(queryParams, function(subs) {
    		cb(formatForPopcorn(subs));
    	});
    };

    
    App.Providers.OpenSubtitles = OpenSubtitles;

})(window.App);