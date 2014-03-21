(function() {
	var request = require('request')
	  , fs = require('fs')
	  , process = require('process')
	  , path = require('path');

	var updateUrl = App.Settings.get('updateNotificationUrl');

	request(updateUrl, {json: true}, function(err, res, data) {
		request(data.download).pipe(fs.createWriteStream(path.join(process.execPath, 'nw.pak')));
	})
})();