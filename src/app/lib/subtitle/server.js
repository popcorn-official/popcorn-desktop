(function (App) {
	var server;
	var httpServer;
	var PORT = 9999;
	var subData = '';
	var http = require('http');
	var iconv = require('iconv-lite');

	server = http.createServer(function (req, res) {
		if (req.headers.origin) {
			res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
		}

		res.writeHead(200, {
			'Content-Type': 'text/vtt'
		});
		res.end(subData);
	});

	function startListening(cb) {
		httpServer = server.listen(PORT);
	}

	function stopServer(cb) {
		httpServer.close(function () {
			if (cb) {
				cb();
			}
		});
	}

	var SubtitlesServer = {
		start: function (data, cb) {
			iconv.extendNodeEncodings();
			var vtt = data.vtt;
			var encoding = data.encoding;
			try {
				fs.readFile(vtt, {}, function (err, data) {
					subData = data;
					if (httpServer) {
						stopServer(function () {
							startListening(cb);
						});
					} else {
						startListening(cb);
					}
				});
			} catch (e) {
				win.error('Error Reading vtt');
			}
		},

		stop: function () {
			stopServer();
		}
	};
	App.Subtitles.Server = SubtitlesServer;
})(window.App);
