const Server = require("webtorrent/lib/server");
const FileServer = require("./lib/file-server");
(function (App) {
    'use strict';
    var subtitle_retry;

    var WebTorrentStreamer = function () {
        // WebTorrent instance
        this.torrent = null;
        // Torrent Backbone Model
        this.torrentModel = null;
        // State Backbone Model
        this.stateModel = null;
        // Stream Info Backbone Model, which keeps showing ratio/download/upload info - See models/stream_info.js
        this.streamInfo = null;
        // Interval controller for StreamInfo view, which keeps showing ratio/download/upload info - See models/stream_info.js
        this.updateStatsInterval = null;
        // video dummy element
        this.video = null;
        // Boolean to indicate if subtitles are already downloaded and ready to use
        this.subtitleReady = false;
        // Boolean to indicate if the video file is ready
        this.canPlay = false;
        // Boolean to indicate if the process was interrupted
        this.stopped = true;
        // Boolean to indicate if Watch now or just Download
        this.downloadOnly = false;
        // Boolean to indicate preload episode state
        this.preload = false;
        // Boolean to indicate is local file
        this.isLocalFile = false;
    };

    WebTorrentStreamer.prototype = {

        initExistTorrents: function() {
          if (!Settings.continueSeedingOnStart) {
            return;
          }

          fs.readdir(App.settings.tmpLocation + '/TorrentCache/', (err, files) => {
            if (err) {
              win.error('Read exist torrents failed:', err.name, err.code);
              return;
            }

            async.eachLimit(files, 1, function (file, cb) {
              if (/^[a-f0-9]{40}$/i.test(file)) {
                fs.readFile(App.settings.tmpLocation + '/TorrentCache/' + file, 'utf8', (err, data) => {
                  if (err) {
                    win.error('Read exist torrent failed:', file, err.name, err.code);
                    return cb();
                  }

                  App.WebTorrent.add(data, {
                      path      : App.settings.tmpLocation,
                      maxConns  : 10,
                      dht       : { concurrency: parseInt(Settings.maxUdpReqLimit, 10) || 16 },
                      secure    : Settings.protocolEncryption || false,
                      announce  : Settings.trackers.forced,
                      tracker   : Settings.trackers.forced
                  }, (torrent) => {
                    return cb();
                  });
                });
              }
            }, function(err) {
              if (err) {
                win.error('Load exist torrents failed:', err.name, err.code);
              }
            });
          });

          if (!App.settings.separateDownloadsDir) {
            return;
          }

          fs.readdir(App.settings.downloadsLocation + '/TorrentCache/', (err, files) => {
            if (err) {
              win.error('Read exist torrents failed:', err.name, err.code);
              return;
            }

            async.eachLimit(files, 1, function (file, cb) {
              if (/^[a-f0-9]{40}$/i.test(file)) {
                fs.readFile(App.settings.downloadsLocation + '/TorrentCache/' + file, 'utf8', (err, data) => {
                  if (err) {
                    win.error('Read exist torrent failed:', file, err.name, err.code);
                    return cb();
                  }

                  App.WebTorrent.add(data, {
                      path      : App.settings.downloadsLocation,
                      maxConns  : 10,
                      dht       : { concurrency: parseInt(Settings.maxUdpReqLimit, 10) || 16 },
                      secure    : Settings.protocolEncryption || false,
                      announce  : Settings.trackers.forced,
                      tracker   : Settings.trackers.forced
                  }, (torrent) => {
                    return cb();
                  });
                });
              }
            }, function(err) {
              if (err) {
                win.error('Load exist torrents failed:', err.name, err.code);
              }
            });
          });
        },

        start: function(model, state) {
            if (App.WebTorrent.destroyed) {
                this.stop();
            }
            this.setModels(model, state);
            const location = this.downloadOnly && App.settings.separateDownloadsDir ? App.settings.downloadsLocation : App.settings.tmpLocation;
            if (this.isLocalFile) {
                if (this.torrentModel.get('isReady')) {
                    this.handleStreamInfo();
                    this.stateModel.set('device', this.torrentModel.get('device'));
                    this.stateModel.set('title', this.torrentModel.get('title'));
                    this.stateModel.set('state', this.torrentModel.get('device') === 'local' ? 'ready' : 'playingExternally');
                    return App.vent.trigger('stream:ready', this.torrentModel);
                }
                const index = this.torrentModel.get('video_file').index;
                const path = this.torrentModel.get('torrent').get('videoFile');
                const fileForServer = {
                    name: path.split('/').pop(),
                    path: path,
                    length: fs.statSync(path).size,
                    index: index
                };
                this.torrent = this.torrentModel.get('torrent');
                this.torrent.files = [];
                this.streamInfo.set('torrentModel', this.torrentModel).updateInfos();
                this.streamInfo.set({
                    torrent: this.torrentModel.get('torrent'),
                    files: this.torrentModel.get('files'),
                    video_file: this.torrentModel.get('video_file'),
                    imdb_id: this.torrent.get('imdb_id'),
                    tvdb_id: this.torrent.get('tvdb_id'),
                    subtitle: this.torrent.get('subtitle'),
                    defaultSubtitle: this.torrent.get('defaultSubtitle'),
                    poster: this.torrent.get('poster'),
                    backdrop: this.torrent.get('backdrop'),
                    year: this.torrent.get('year'),
                    season: this.torrent.get('season'),
                    episode: this.torrent.get('episode'),
                    episode_id: this.torrent.get('episode_id'),
                    quality: this.torrent.get('quality'),
                    downloadedPercent: 100,
                    metadataCheckRequired: true,
                    localFile: true,
                    isReady: true
                });
                this.torrent = null;
                return this.createFileServer(fileForServer).then(() => { App.vent.trigger('system:openFileSelector', this.streamInfo); });
            }
            if (!this.downloadOnly && !this.preload) {
                this.fetchTorrent(this.torrentModel.get('torrent'), location, model.get('title')).then(function (torrent) {
                    this.torrentModel.set('torrent', this.torrent = torrent);
                    this.linkTransferStatus();
                    this.handleTorrent(torrent);
                    this.handleStreamInfo();
                    this.watchState();
                    this.saveCoverToFile(location);
                    return this.createServer();
                }.bind(this)).then(this.waitForBuffer.bind(this)).catch(this.handleErrors.bind(this));
            } else {
                this.fetchTorrent(this.torrentModel.get('torrent'), location, model.get('title')).then(function (torrent) {
                    this.torrentModel.set('torrent', torrent);
                    this.handleTorrent(torrent);
                    this.saveCoverToFile(location);
                    return;
                }.bind(this));
            }
        },

        stop: function() {
            if (this.torrent) {
                // update ratio
                AdvSettings.set('totalDownloaded', Settings.totalDownloaded + this.torrent.downloaded);
                AdvSettings.set('totalUploaded', Settings.totalUploaded + this.torrent.uploaded);

                if (Settings.activateSeedbox) {
                    const removedPeers = [];
                    this.torrent.pause();

                    for (const id in this.torrent._peers) {
                        if (this.torrent._peers[id] && this.torrent._peers[id].addr) {
                            removedPeers.push(this.torrent._peers[id].addr);
                            this.torrent.removePeer(id);
                        }
                    }

                    if (removedPeers.length > 0) {
                        this.torrent.pctRemovedPeers = removedPeers;
                    }

                    if (this.torrent._xsRequests) {
                        this.torrent._xsRequests.forEach(req => {
                            req.abort();
                        });
                    }
                } else {
                    App.WebTorrent.destroy();
                    App.WebTorrent = new WebTorrent({
                        maxConns     : parseInt(Settings.connectionLimit, 10) || 55,
                        downloadLimit: parseInt(parseFloat(Settings.downloadLimit, 10) * parseInt(Settings.maxLimitMult, 10)) || -1,
                        uploadLimit  : parseInt(parseFloat(Settings.uploadLimit, 10) * parseInt(Settings.maxLimitMult, 10)) || -1,
                        dht          : { concurrency: parseInt(Settings.maxUdpReqLimit, 10) || 16 },
                        secure       : Settings.protocolEncryption || false,
                        tracker      : {
                            announce: Settings.trackers.forced
                        }
                    });
                }
            }

            if (this.video) {
                this.video.pause();
                this.video.src = '';
                this.video.load();
                this.video = null;
            }

            this.torrent = null;
            this.torrentModel = null;
            this.stateModel = null;
            this.streamInfo = null;
            this.subtitleReady = false;
            this.canPlay = false;
            this.stopped = true;
            clearInterval(this.updateStatsInterval);
            this.updateStatsInterval = null;

            App.vent.off('subtitle:downloaded');
            App.SubtitlesServer.stop();
            win.info('Streaming cancelled');
        },

        stopFS: function() {
            if (this.torrent) {
                // update ratio
                AdvSettings.set('totalDownloaded', Settings.totalDownloaded + this.torrent.downloaded);
                AdvSettings.set('totalUploaded', Settings.totalUploaded + this.torrent.uploaded);

                const removedPeers = [];

                if (this.torrent.xt) {
                    // magnet link
                    this.torrent.pause();
                } else {
                    // .torrent file
                    this.torrent.destroy();
                }

                for (const id in this.torrent._peers) {
                    if (this.torrent._peers[id] && this.torrent._peers[id].addr) {
                        removedPeers.push(this.torrent._peers[id].addr);
                        this.torrent.removePeer(id);
                    }
                }

                if (removedPeers.length > 0) {
                    this.torrent.pctRemovedPeers = removedPeers;
                }

                if (this.torrent._xsRequests) {
                    this.torrent._xsRequests.forEach(req => {
                        req.abort();
                    });
                }
            }

            if (this.video) {
                this.video.pause();
                this.video.src = '';
                this.video.load();
                this.video = null;
            }

            this.torrent = null;
            this.torrentModel = null;
            this.stateModel = null;
            this.streamInfo = null;
            this.subtitleReady = false;
            this.canPlay = false;
            this.stopped = true;
            clearInterval(this.updateStatsInterval);
            this.updateStatsInterval = null;

            App.vent.off('subtitle:downloaded');
            App.SubtitlesServer.stop();
            win.info('Streaming cancelled');
        },

        handleErrors: function (reason) {
            if (!this.stopped) {
                win.error(reason);
            }
        },

        // fire webtorrent and resolve the torrent
        fetchTorrent: function(torrentInfo, path, mediaName) {
            return new Promise(function (resolve, reject) {

                // handles magnet and hosted torrents
                var uri = torrentInfo.magnet || torrentInfo.url || torrentInfo;
                const parseTorrent = require('parse-torrent');
                var infoHash = '';
                try { infoHash = parseTorrent(uri).infoHash; } catch (err) {}
                var torrent;

                App.plugins.mediaName.setMediaName(infoHash, mediaName);

                for(const t of App.WebTorrent.torrents) {
                    if (t.infoHash === infoHash) {
                        torrent = t;
                        torrent.resume();
                        if (torrent.pctRemovedPeers) {
                            const peers = torrent.pctRemovedPeers;
                            torrent.pctRemovedPeers = undefined;
                            for (let peer of peers) {
                                if (peer) {
                                    torrent.addPeer(peer);
                                }
                            }
                        }
                        resolve(torrent);
                    }
                }

                if (!torrent) {
                  torrent = App.WebTorrent.add(uri, {
                      path      : path,
                      maxConns  : 10,
                      dht       : { concurrency: parseInt(Settings.maxUdpReqLimit, 10) || 16 },
                      secure    : Settings.protocolEncryption || false,
                      announce  : Settings.trackers.forced,
                      tracker   : Settings.trackers.forced
                  });
                }

                const fs = require('fs');
                fs.writeFileSync(path + '/TorrentCache/' + torrent.infoHash, uri);

                torrent.on('metadata', function () {
                    // deselect files, webtorrent api
                    // as of november 2016, need to remove all torrent,
                    //  then add wanted file, it's a bug: https://github.com/feross/webtorrent/issues/164
                    torrent.deselect(0, torrent.pieces.length - 1, false); // Remove default selection (whole torrent)

                    resolve(torrent);
                }.bind(this));

                torrent.on('error', function (error) {
                    if (torrent.infoHash) {
                        torrent.remove(torrent.infoHash);
                        torrent.add(torrent.infoHash);
                    } else {
                        win.error('Torrent fatal error', error);
                        this.stop();
                        reject(error);
                    }
                }.bind(this));

                App.WebTorrent.on('error', function (error) {
                    win.error('WebTorrent fatal error', error);
                    this.stop();
                    reject(error);
                }.bind(this));
            }.bind(this));
        },

        linkTransferStatus: function () {
            this.torrent.on('download', function () {
                if (this.torrentModel && this.torrent) {
                    this.torrentModel.set('downloadSpeed', Common.fileSize(this.torrent.downloadSpeed) + '/s');
                    this.torrentModel.set('downloaded', Math.round(this.torrent.downloaded).toFixed(2));
                    this.torrentModel.set('downloadedFormatted', Common.fileSize(this.torrent.downloaded));
                    this.torrentModel.set('downloadedPercent', (this.torrent.progress * 100) || 0);
                    this.torrentModel.set('active_peers', this.torrent.numPeers);
                    this.torrentModel.set('time_left', (this.torrent.timeRemaining));
                }
            }.bind(this));

            this.torrent.on('upload', function () {
                if (this.torrentModel && this.torrent) {
                    this.torrentModel.set('uploadSpeed', Common.fileSize(this.torrent.uploadSpeed) + '/s');
                    this.torrentModel.set('active_peers', this.torrent.numPeers);
                }
            }.bind(this));
        },

        // present the user with file selector
        openFileSelector: function (torrent) {
            var supported = ['.mp4', '.m4v', '.avi', '.mov', '.mkv', '.wmv'];

            try {
                torrent.files.sort(function(a, b){
                    if (a.name < b.name) { return -1; }
                    if (a.name > b.name) { return 1; }
                    return 0;
                });
            } catch (err) {}

            // hide non-video files from selection and set index
            for (var f in torrent.files) {
                torrent.files[f].index = f;
                torrent.files[f].display = supported.indexOf(path.extname(torrent.files[f].name).toLowerCase()) !== -1;
            }

            var fileModel = new Backbone.Model({
                torrent: torrent,
                files: torrent.files
            });
            App.vent.trigger('system:openFileSelector', fileModel);
        },

        lookForImages: function (metadatas) {
            App.Trakt.client.images.get({
                type: metadatas.type === 'movie' ? 'movie' : 'show',
                imdb: metadatas.type === 'movie' ? metadatas.movie.ids.imdb : metadatas.show.ids.imdb,
                tvdb: metadatas.type === 'movie' ? false : metadatas.show.ids.tvdb,
                tmdb: metadatas.type === 'movie' ? metadatas.movie.ids.tmdb : false
            }).then(function (img) {
                if (this.torrentModel) {
                    !this.torrentModel.get('backdrop') ? this.torrentModel.set('backdrop', img.background) : null;
                    !this.torrentModel.get('poster') ? this.torrentModel.set('poster', img.poster) : null;
                }
            }.bind(this));
        },

        // try to gather media metadata and manipulate torrentModel
        lookForMetadata: function (torrent) {
            if (this.stopped) {
                return;
            }

            var fileName = this.torrentModel.get('video_file').name;

            if (this.torrentModel) {
                this.torrentModel.set('title', fileName); 
            }

            App.Trakt.client.matcher.match({
                filename: fileName,
                torrent: torrent.name
            }).then(function(metadatas) {
                var props = {};

                var qualities = {
                    SD: '480p',
                    HD: '720p',
                    FHD: '1080p'
                };
                props.quality = qualities[metadatas.quality] || false;

                // populating torrentModel with the new data
                switch (metadatas.type) {
                    case 'movie':
                        props.imdb_id = metadatas.movie.ids.imdb;
                        props.title = metadatas.movie.title;
                        break;
                    case 'episode':
                        props.tvdb_id = metadatas.show.ids.tvdb;
                        props.episode_id = metadatas.episode.ids.tvdb;
                        props.imdb_id = metadatas.show.ids.imdb;
                        props.episode = metadatas.episode.number;
                        props.season = metadatas.episode.season;
                        props.title = metadatas.show.title + ' - ' + i18n.__('Season %s', metadatas.episode.season) + ', ' + i18n.__('Episode %s', metadatas.episode.number) + ' - ' + metadatas.episode.title;
                        break;
                    default:
                        throw 'trakt.matcher.match failed';
                }

                if (this.torrentModel) {
                    this.torrentModel.set(props);
                }
                this.lookForImages(metadatas);
                this.handleSubtitles();

            }.bind(this)).catch(function(err) {
                if (this.torrentModel) {
                    this.torrentModel.set('title', fileName);
                }
                this.handleSubtitles();
            }.bind(this));
            setTimeout(() => { if (!this.subtitleReady) { this.handleSubtitles(); }}, 20000);
        },

        // set video file name & index
        selectFile: function (torrent, fileName) {
            let fileIndex = 0;
            let fileSize = 0;
            if (!fileName) {
                for (let i in torrent.files) {
                    if (fileSize < torrent.files[i].length) {
                        fileIndex = i;
                        fileSize = torrent.files[i].length;
                        fileName = torrent.files[i].path;
                    }
                }
            }

            for (let f in torrent.files) { // Add selection
                let file = torrent.files[f];
                // windows specific fix
                let path = file.path.replace(/\\/g, '/');
                let name = fileName.replace(/\\/g, '/');
                // we use endsWith, not equals because from server may return without first directory
                if (path.endsWith(name)) {
                    fileIndex = f;
                    fileSize = file.length;
                    fileName = file.path;
                    file.select();
                    file.hidden = false;
                } else {
                //    file.deselect();
                }
            }
            if (!fileName.startsWith(torrent.path)) {
                fileName = path.join(torrent.path, fileName);
            }

            return {
                name: path.basename(fileName),
                size: fileSize,
                index: fileIndex,
                path: fileName
            };
        },

        // determine if the torrent is already formatted or if we need to use the file selector
        handleTorrent: function (torrent) {
            var isFormatted = Boolean(this.torrentModel.get('title')); // was formatted (from Details)
            var isRead = Boolean(this.torrentModel.get('torrent_read')); // comes from file selector
            let fileName = this.torrentModel.get('file_name');

            if (isFormatted) {
                this.torrentModel.set('video_file', this.selectFile(torrent, fileName));
                this.handleSubtitles();
            } else if (isRead) {
                this.torrentModel.set('video_file', this.selectFile(torrent, fileName));
                this.lookForMetadata(torrent);
            } else {
                this.openFileSelector(torrent);
                this.stopped = true;
                throw 'interrupt';
            }
            return;
        },

        createServer: function (port) {
            return new Promise(function (resolve) {
                var serverPort = parseInt((port || Settings.streamPort), 10);


                if (!serverPort) {
                    serverPort = this.generatePortNumber();
                }

                try {
                    this.torrentModel.get('torrent').createServer().listen(serverPort);

                    var url = 'http://127.0.0.1:' + serverPort + '/' + this.torrentModel.get('video_file').index;

                    this.streamInfo.set('src', url);
                    this.streamInfo.set('type', 'video/mp4');

                    resolve(url);
                } catch (e) {
                    setTimeout(function () {
                        return this.createServer(0).then(resolve);
                    }.bind(this), 100);
                }
            }.bind(this));
        },

        createFileServer: function (file, port) {
            return new Promise(function (resolve) {
                var serverPort = parseInt((port || Settings.streamPort), 10);


                if (!serverPort) {
                    serverPort = this.generatePortNumber();
                }

                try {
                    const server = new FileServer(file, serverPort);
                    server.listen(serverPort);

                    this.torrentModel.get('torrent').set('server', server);

                    var url = 'http://127.0.0.1:' + serverPort + '/' + file.index;

                    this.streamInfo.set('src', url);
                    this.streamInfo.set('type', 'video/mp4');

                    resolve(url);
                } catch (e) {
                    setTimeout(function () {
                        return this.createFileServer(file, 0).then(resolve);
                    }.bind(this), 100);
                }
            }.bind(this));
        },

        handleStreamInfo: function () {
            this.streamInfo.set('torrentModel', this.torrentModel);
            this.updateStatsInterval = setInterval(this.streamInfo.updateStats.bind(this.streamInfo), 1000);
            this.streamInfo.updateInfos();
            this.torrentModel.on('change', this.streamInfo.updateInfos.bind(this.streamInfo));
        },

        // dummy element to fire stream:start
        waitForBuffer: function (url) {
            this.video = document.createElement('video');

            this.video.volume = 0;
            this.video.src = url;

            this.video.play().then(function () {
                this.canPlay = true;
                this.video.pause();
                this.video.src = '';
                this.video.load();
            }.bind(this)).catch(function (error) {
                //catch the correct error and avoid erroring on server destroy (stream:stop while still loading the play())
                if (!this.stopped) {
                    win.error('Can\'t play video %s: %s, code %d', url, error.name, error.code);
                    // TODO: set state to error
                    // TODO: once we have a global option for extplayer, loads it instead
                    // for now, we ignore that so we can display error in the player:
                    this.canPlay = true;
                    this.video.pause();
                    this.video.src = '';
                    this.video.load();
                }
            }.bind(this));
        },

        setModels: function (model, state) {
            this.stopped = false;
            this.isLocalFile = state === 'local' ? true : false;
            this.downloadOnly = state === 'downloadOnly' ? true : false;
            this.preload = state === 'preload' ? true : false;
            this.torrentModel = model;
            this.streamInfo = new App.Model.StreamInfo();
            this.stateModel = new Backbone.Model({
                state: 'connecting',
                backdrop: this.torrentModel.get('backdrop'),
                title: '',
                device: '',
                show_controls: false,
                streamInfo: this.streamInfo
            });
            if (!this.downloadOnly && !this.preload) {
                App.vent.trigger('stream:started', this.stateModel);
            } else {
                this.stopped = true;
            }
        },

        watchState: function () {
            if (this.stopped) {
              return;
            }
            if (!this.torrent) {
              return;
            }
            if (!this.torrentModel) {
              this.stopped = true;
              return;
            }
            var torrentModel = this.torrentModel.get('torrent');
            var player = this.streamInfo.get('device');

            var state = 'connecting'; // default state

            if (this.canPlay) {
                if (player && player.id !== 'local') {
                    state = 'playingExternally'; // file ready to be streamed to external player
                } else {
                    state = 'ready'; // file can be played
                }
                this.streamInfo.updateInfos();
                this.torrentModel.off('change');
            } else if (torrentModel.downloaded) {
                if (torrentModel.downloadSpeed) {
                    state = 'downloading'; // is actively downloading
                } else {
                    state = 'startingDownload'; // is verifying pieces
                }
            }

            if ((state === 'ready' || state === 'playingExternally') && !this.subtitleReady) {
                state = 'waitingForSubtitles'; // can be played but subs aren't there yet
            }
            this.stateModel.set('state', state);

            if (state === 'ready' || state === 'playingExternally' ) {
                App.vent.trigger('stream:ready', this.streamInfo);
                this.stateModel.destroy();
            } else {
                _.delay(this.watchState.bind(this), 100);
            }
        },

        saveCoverToFile: async function (location) {
            if (this.torrentModel && this.torrentModel.get('type') === 'movie' && this.torrentModel.get('cover') && this.torrentModel.get('torrent').name) {
                let url = this.torrentModel.get('cover');
                const res = await fetch(url);
                const buffer = await res.arrayBuffer();
                if (buffer.byteLength < 1000) {
                    return;
                }
                try {
                    fs.writeFileSync(path.join(location, this.torrentModel.get('torrent').name) + '/cover.jpg', Buffer.from(buffer));
                } catch (err) {
                    fs.writeFileSync(location + '/' + this.torrentModel.get('torrent').name + '_cover.jpg', Buffer.from(buffer));
                }
            }
        },

        onSubtitlesFound: function (subs) {
            if (this.stopped && !this.downloadOnly && !this.preload) {
                return;
            }

            var subtitles = subs || this.torrentModel.get('subtitle');
            var total = Object.keys(subtitles).length;
            var defaultSubtitle = this.torrentModel.get('defaultSubtitle');

            win.info(total + ' subtitles found');

            if (this.torrentModel) {
                this.torrentModel.set('subtitle', subtitles);
            }

            if (defaultSubtitle !== 'none') {
                if (total === 0) {
                    App.vent.trigger('notification:show', new App.Model.Notification({
                        title: i18n.__('No subtitles found'),
                        body: i18n.__('Try again later or drop a subtitle in the player'),
                        showRestart: false,
                        type: 'warning',
                        autoclose: true
                    }));
                    // if 0 subtitles found code will not stuck at 'waiting for subtitle'
                    this.subtitleReady = true;
                } else {
                    // after downloaded subtitles, we set the srt file to streamInfo
                    App.vent.on('subtitle:downloaded', function(subtitlePath) {
                        if (subtitlePath) {
                            this.streamInfo.set('subFile', subtitlePath);
                            App.vent.trigger('subtitle:convert', {
                                path: subtitlePath,
                                language: defaultSubtitle
                            }, function(err, res) {
                                if (err) {
                                    win.error('error converting subtitles', err);
                                    this.streamInfo.set('subFile', null);
                                    App.vent.trigger('notification:show', new App.Model.Notification({
                                        title: i18n.__('Error converting subtitle'),
                                        body: i18n.__('Try another subtitle or drop one in the player'),
                                        showRestart: false,
                                        type: 'error',
                                        autoclose: true
                                    }));
                                } else {
                                    App.SubtitlesServer.start(res);
                                    this.subtitleReady = true;
                                    this.streamInfo.set('subServer', 'http://127.0.0.1/data.vtt');
                                }
                            }.bind(this));
                        } else {
                            this.subtitleReady = true;
                        }

                    }.bind(this));

                    // download the subtitle
                    App.vent.trigger('subtitle:download', {
                        url: subtitles[defaultSubtitle],
                        path: this.torrentModel.get('video_file').path,
                        lang: this.torrentModel.get('defaultSubtitle')
                    });
                }
            } else {
                this.subtitleReady = true;
            }
        },

        // serve subtitles on a local server to make them accessible to remote cast devices
        serveSubtitles: function(localPath) {
            App.vent.trigger('subtitle:convert', {
                path: localPath
            }, function(err, res) {
                if (err) {
                    win.error('error converting subtitles', err);
                    this.streamInfo.set('subFile', null);
                    App.vent.trigger('notification:show', new App.Model.Notification({
                        title: i18n.__('Error converting subtitle'),
                        body: i18n.__('Try another subtitle or drop one in the player'),
                        showRestart: false,
                        type: 'error',
                        autoclose: true
                    }));
                } else {
                    App.SubtitlesServer.start(res);
                }
            }.bind(this));
        },

        handleSubtitles: function () {
            if (this.stopped && !this.downloadOnly && !this.preload) {
                return;
            }
            // set default subtitle language (passed by a view or settings)
            var defaultSubtitle = this.torrentModel.get('defaultSubtitle') || Settings.subtitle_language;
            this.torrentModel.set('defaultSubtitle', defaultSubtitle);

            var subtitleProvider = App.Config.getProviderForType('subtitle');

            subtitleProvider
                .fetch(this.buildSubtitleQuery())
                .then(this.onSubtitlesFound.bind(this))
                .catch(function (err) {
                    this.subtitleReady = true;
                    win.error('subtitleProvider.fetch()', err);
                    if (subtitle_retry === undefined) { subtitle_retry=0; }
                    subtitle_retry++;
                    if (subtitle_retry<5) {
                        win.info('subtitle fetching error. retry: ' + subtitle_retry + ' of 4');
                        this.subtitleReady = false;
                        this.handleSubtitles(subtitle_retry);
                    } else {
                        this.subtitleReady = true;
                    }
                }.bind(this));

            setTimeout(() => { if (!this.subtitleReady) { this.subtitleReady = true; }}, 20000);
            return;
        },

        buildSubtitleQuery: function () {
            if (this.stopped && !this.downloadOnly && !this.preload) {
                return;
            }

            var queryData = {};

            var extractSubtitle = this.torrentModel.get('extract_subtitle');
            if (typeof extractSubtitle === 'object') {
                queryData = extractSubtitle;
            }

            queryData.filename = this.torrentModel.get('video_file').name;

            if (this.torrentModel.get('imdb_id')) {
                queryData.imdbid = this.torrentModel.get('imdb_id');
            }

            if (this.torrentModel.get('season')) {
                queryData.season = this.torrentModel.get('season');
            }

            if (this.torrentModel.get('episode')) {
                queryData.episode = this.torrentModel.get('episode');
            }

            return queryData;
        },

        // find a random port
        generatePortNumber: function() {
            var min = 1024, max = 65535;

            return Math.floor(Math.random() * (max - min)) + min;
        }

      };

    var streamer = new WebTorrentStreamer();

    App.vent.on('stream:loadExistTorrents', streamer.initExistTorrents.bind(streamer));
    App.vent.on('stream:start', streamer.start.bind(streamer));
    App.vent.on('stream:stop', streamer.stop.bind(streamer));
    App.vent.on('stream:stopFS', streamer.stopFS.bind(streamer));
    App.vent.on('stream:serve_subtitles', streamer.serveSubtitles.bind(streamer));
})(window.App);
