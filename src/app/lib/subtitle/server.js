(function (App) {
	var server;
	var httpServer;
	var PORT = 9999;
	var subData = '';
	var encoding = 'utf8';
	var http = require('http');
	var iconv = require('iconv-lite');

	server = http.createServer(function (req, res) {
		if (req.headers.origin) {
			res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
		}

		res.writeHead(200, {
			'Content-Type': 'text/vtt;charset='+ encoding
		});
		win.debug('SubtitlesServer: served vtt with encoding: '+ encoding);
		res.end(subData);
	});

	function startListening(cb) {
		httpServer = server.listen(PORT);
	}

	function stopServer(cb) {
		httpServer.close(function () {
			httpServer = null;
			if (cb) {
				cb();
			}
		});
	}

	var SubtitlesServer = {
		start: function (data, cb) {
			iconv.extendNodeEncodings();
			var vtt = data.vtt;
			var vttEnc = data.encoding;
			try {
				fs.readFile(vtt, {}, function (err, data) {
					win.debug('SubtitlesServer: Updated vtt data');
					subData = data;
					encoding = vttEnc || 'utf8';
					if (!httpServer) {
						startListening(cb);
					}
				});
			} catch (e) {
				win.error('Error Reading vtt', e);
			}
		},

		stop: function () {
			if (httpServer) {
				stopServer();
			}
		}
	};
	App.Subtitles.Server = SubtitlesServer;
})(window.App);
