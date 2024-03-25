(function (App) {
    var server;
    var httpServer;
    var PORT = 9999;
    var subtitlePath = {};
    var encoding = 'utf8';
    var send = require('send');

    server = http.createServer(function (req, res) {
        var uri = url.parse(req.url);
        var ext = path.extname(uri.pathname).substr(1);
        var sub_path = subtitlePath[ext];
        var sub_dir = path.dirname(sub_path);
        var sub_uri = '/' + path.basename(sub_path);

        var headers = function (res, path, stat) {
            if (req.headers.origin) {
                res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
            }
            res.setHeader('Content-Type', 'text/' + ext + ';charset=' + encoding);
        };

        if (ext in subtitlePath) {
            send(req, sub_uri, {
                    root: sub_dir
                })
                .on('headers', headers)
                .pipe(res);
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

            encoding = data.encoding || 'utf8';
            if (data.vtt) {
                fs.readFile(data.vtt, function (err, data) {
                    if (err) {
                        return;
                    }
                });
                subtitlePath['vtt'] = data.vtt;
            }

            if (data.srt) {
                fs.readFile(data.srt, function (err, data) {
                    if (err) {
                        return;
                    }
                });
                subtitlePath['srt'] = data.srt;
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
    App.SubtitlesServer = SubtitlesServer;
})(window.App);
