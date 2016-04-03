(function (App) {
    'use strict';
    var safeMagetTID = null,
        stateModel = null;

    /**
     * takes care that magnet and .torr urls always return actual torrent file
     */
    var tpmDir = path.join(App.settings.tmpLocation, 'TorrentCache'),
        MAGNET_RESOLVE_TIMEOUT = 60 * 1000; // let's give max a minute to resolve a magnet uri

    var handlers = {
        handletorrent: function (filePath, torrent) {
            // just copy the torrent file
            var deferred = Q.defer();
            Common.copyFile(torrent, filePath, function (err) {
                if (err) {
                    return handlers.handleError('TorrentCache.handletorrent() error: ' + err, torrent);
                }
                deferred.resolve(filePath);
            });
            return deferred.promise;
        },
        handletorrenturl: function (filePath, torrent) {
            // try to download the file
            var deferred = Q.defer(),
                safeTimeoutID = null,
                doneReached = false;
            var done = function (error) {
                clearTimeout(safeTimeoutID);
                if (doneReached) {
                    return;
                }
                doneReached = true;
                if (error) {
                    // try unlinking the file in case it was created
                    try {
                        fs.unlink(filePath);
                    } catch (e) {}
                    return handlers.handleError('TorrentCache.handletorrenturl() error: ' + error, torrent);
                }
                deferred.resolve(filePath);
            };
            try { // in case somehow invaid link hase made it through to here
                var ws = fs.createWriteStream(filePath),
                    params = {
                        url: torrent,
                        headers: {
                            'accept-charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
                            'accept-language': 'en-US,en;q=0.8',
                            'accept-encoding': 'gzip,deflate',
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.143 Safari/537.36'
                        }
                    },
                    req = request(params)
                    .on('response', function (resp) {
                        if (resp.statusCode >= 400) {
                            return done('Invalid status: ' + resp.statusCode);
                        }
                        switch (resp.headers['content-encoding']) {
                        case 'gzip':
                            resp.pipe(zlib.createGunzip()).pipe(ws);
                            break;
                        case 'deflate':
                            resp.pipe(zlib.createInflate()).pipe(ws);
                            break;
                        default:
                            resp.pipe(ws);
                            break;
                        }
                        ws
                            .on('error', done)
                            .on('close', done);
                    })
                    .on('error', done)
                    .on('end', function () {
                        // just to be on the safe side here, set 'huge' amount of time, close event should be triggered on ws long before this one if all goes good.
                        safeTimeoutID = setTimeout(function () {
                            done('Waiting for stream to end error: timed out.');
                        }, 5 * 1000);
                    });
            } catch (e) {
                done(e);
            }
            return deferred.promise;
        },
        handlemagnet: function (filePath, torrent) {
            clearTimeout(safeMagetTID);

            var deferred = Q.defer(),
                error = false,
                engine = peerflix(torrent, {
                    list: true
                }); // just list files, this won't start the torrent server

            // lets wait max a minute
            // because engine does not report any error on wrong magnet links
            /*jshint -W120 */
            var currentTID = safeMagetTID = setTimeout(function () {
                engine.destroy();
                handlers.handleError('TorrentCache.handlemagnet() error: timed out', torrent);
            }, MAGNET_RESOLVE_TIMEOUT);


            var resolve = function () {
                // maybe somehow new magnet was pasted in while loading this one
                if (currentTID !== safeMagetTID) {
                    return;
                }
                if (error) {
                    return handlers.handleError('TorrentCache.handlemagnet() error: ' + error, torrent);
                }
                deferred.resolve(filePath);
            };
            var destroyEngine = function () {
                engine.destroy();
                engine = null;
            };

            engine.on('ready', function () {
                var resolvedTorrentPath = engine.path;
                clearTimeout(currentTID);
                if (resolvedTorrentPath) {
                    // copy resolved path to cache so it will be awailable next time
                    Common.copyFile(resolvedTorrentPath + '.torrent', filePath, function (err) {
                        if (err) {
                            error = err;
                        }
                        resolve();
                        destroyEngine();
                    });
                } else {
                    error = 'TorrentCache.handlemagnet() engine returned no file';
                    destroyEngine();
                }
            });

            return deferred.promise;
        },
        handleSuccess: function (filePath) {
            win.debug('TorrentCache.handleSuccess() ' + filePath + ' stopped: ' + !stateModel);
            if (!stateModel) {
                return;
            }
            var torrentStart = new Backbone.Model({
                torrent: filePath,
                is_file: true
            });
            App.vent.trigger('stream:start', torrentStart);
        },
        handleError: function (err, torrent) {
            win.error('TorrentCache.handleError(): ' + err, torrent);
            handlers.updateState('Error resolving torrent.');
        },
        updateState: function (state) {
            if (stateModel) {
                stateModel.set('state', state);
            }
        }
    };

    var mod = function () {
            this._checkTmpDir();
        },
        pmod = mod.prototype;

    pmod.config = {
        name: 'TorrentCache'
    };

    pmod.getTmpDir = function () {
        return tpmDir;
    };

    pmod.clearTmpDir = function () {
        var self = this;
        rimraf(tpmDir, function (err) {
            if (err) {
                win.error('TorrentCache.clearTmpDir()', err);
            }
            self._checkTmpDir();
        });
    };

    pmod._checkTmpDir = function () {
        mkdirp(tpmDir, function (err) {
            if (err) {
                win.error('TorrentCache._checkTmpDir()', err);
            }
        });
    };

    pmod.getType = function (torrent) {
        if (typeof torrent === 'string') {
            if (torrent.substring(0, 8) === 'magnet:?') {
                return 'magnet';
            }
            if (torrent.indexOf('.torrent') !== -1) {
                if (torrent.indexOf('http://') === 0) {
                    return 'torrenturl';
                }
                return 'torrent';
            }
        }
        return 'unknown';
    };

    pmod.resolve = function (torrent) {
        var type = this.getType(torrent);
        stateModel = new Backbone.Model({
            state: 'Resolving..',
            backdrop: '',
            title: '',
            player: '',
            show_controls: false
        });
        App.vent.trigger('stream:started', stateModel);
        switch (type) {
        case 'torrenturl':
        case 'torrent':
        case 'magnet':
            this.checkCache(torrent).then(function (result) {
                var filePath = result[0],
                    exists = result[1];
                if (exists) {
                    return handlers.handleSuccess(filePath);
                }
                // try to store this torrent into our cache
                handlers['handle' + type](filePath, torrent).then(handlers.handleSuccess);
            }.bind(this));
            break;
        default:
            handlers.handleError('TorrentCache.resolve(): Unknown torrent type', torrent);
            return false;
        }
        return true;
    };

    pmod._getKey = function (name) {
        return Common.md5(path.basename(name));
    };

    pmod.checkCache = function (torrent) {
        var deferred = Q.defer(),
            name = this._getKey(torrent) + '.torrent',
            targetPath = path.join(tpmDir, name);

        // check if file already exists
        fs.readdir(tpmDir, function (err, files) {
            if (err) {
                handlers.handleError('TorrentCache.checkCache() readdir:' + err, torrent);
                return deferred.reject(err);
            }
            var idx = files.indexOf(name);
            if (idx === -1) {
                return deferred.resolve([targetPath, false]);
            }
            // check if it actually is a file, not dir..
            fs.lstat(targetPath, function (err, stats) {
                if (err) {
                    handlers.handleError('TorrentCache.checkCache() lstat:' + err, torrent);
                    return deferred.reject(err);
                }
                if (stats.isFile()) {
                    return deferred.resolve([targetPath, true]);
                }
                handlers.handleError('TorrentCache.checkCache() target torrent is directory', torrent);
                deferred.reject('Target torrent is directory');
            });
        });
        return deferred.promise;
    };

    pmod.stop = function () {
        stateModel = null;
    };

    var singleton = new mod();

    App.vent.on('torrentcache:stop', singleton.stop);

    App.Providers.TorrentCache = function () {
        return singleton;
    };

    App.Providers.install(mod);

})(window.App);
