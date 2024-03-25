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
            return new Promise(function (resolve, reject) {
                fs.copyFile(torrent, filePath, function (err) {
                    if (err) {
                        return handlers.handleError('TorrentCache.handletorrent() error: ' + err, torrent);
                    }
                    resolve(filePath);
                });
            });
        },
        handletorrenturl: function (filePath, torrent) {
            const request = fetch(torrent)
                .then(result => result.arrayBuffer())
                .catch(error => {
                    return handlers.handleError('TorrentCache.handletorrenturl() error: ' + error, torrent);
                });
            return request.then(function (result) {
                fs.writeFileSync(filePath, Buffer.from(result));
                return Promise.resolve(filePath);
            });
        },
        handlemagnet: function (filePath, torrent) {
            return Promise.resolve(torrent);
        },
        handleSuccess: function (filePath) {
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
        mkdirp.sync(tpmDir);
    };

    pmod.getType = function (torrent) {
        if (typeof torrent === 'string') {
            if (torrent.substring(0, 8) === 'magnet:?') {
                return 'magnet';
            }
            if (torrent.indexOf('https://') === 0) {
                return 'torrenturl';
            }
            if (torrent.indexOf('http://') === 0) {
                return 'torrenturl';
            }
            if (torrent.indexOf('.torrent') !== -1) {
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
        return new Promise((resolve, reject) => {
            var name = this._getKey(torrent) + '.torrent',
                targetPath = path.join(tpmDir, name);

            // check if file already exists
            fs.readdir(tpmDir, function (err, files) {
                if (err) {
                    handlers.handleError('TorrentCache.checkCache() readdir:' + err, torrent);
                    return reject(err);
                }
                var idx = files.indexOf(name);
                if (idx === -1) {
                    return resolve([targetPath, false]);
                }
                // check if it actually is a file, not dir..
                fs.lstat(targetPath, function (err, stats) {
                    if (err) {
                        handlers.handleError('TorrentCache.checkCache() lstat:' + err, torrent);
                        return reject(err);
                    }
                    if (stats.isFile()) {
                        return resolve([targetPath, true]);
                    }
                    handlers.handleError('TorrentCache.checkCache() target torrent is directory', torrent);
                    reject('Target torrent is directory');
                });
            });
        });
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
