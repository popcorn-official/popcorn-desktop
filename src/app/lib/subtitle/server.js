(function (App) {
	var server;
	var httpServer;
	var PORT = 9999;
	var subtitleData = {};
	var encoding = 'utf8';
	var http = require('http');
	var path = require('path');
	var url = require('url');
	var iconv = require('iconv-lite');

	server = http.createServer(function (req, res) {
		var uri = url.parse(req.url);
		var ext = path.extname(uri.pathname).substr(1);
		if (req.headers.origin) {
			res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
		}

		if (ext in subtitleData) {
			res.writeHead(200, {
				'Content-Type': 'text/' + ext + ';charset=' + encoding
			});
			res.end(subtitleData[ext]);
			win.debug('SubtitlesServer: served vtt/srt with encoding: ' + encoding);
		} else {
			res.writeHead(404);
			res.end();
			win.error('SubtitlesServer: No subtitle with format %s available.', ext);
		}
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

			encoding = data.encoding || 'utf8';
			win.debug(data.srt);
			if (data.vtt) {
				fs.readFile(data.vtt, function (err, data) {
					if (err) {
						win.error('SubtitlesServer: Unable to load VTT file');
						return;
					}
					subtitleData['vtt'] = data;
				});
			}

			if (data.srt) {
				fs.readFile(data.srt, function (err, data) {
					if (err) {
						win.error('SubtitlesServer: Unable to load SRT file');
						return;
					}
					subtitleData['srt'] = data;
				});
			}

			if (!httpServer) {
				startListening(cb);
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
