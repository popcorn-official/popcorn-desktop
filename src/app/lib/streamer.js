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

        // Stream Info Backbone Model, which keeps showing ratio/download/upload info.
        // See models/stream_info.js
        this.streamInfo = null;
        // Interval controller for StreamInfo view, which keeps showing ratio/download/upload info.
        // See models/stream_info.js
        this.updateStatsInterval = null;
        // video dummy element
        this.video = null;

        // Boolean to indicate if subtitles are already downloaded and ready to use
        this.subtitleReady = false;

        // Boolean to indicate if the video file is ready
        this.canPlay = false;


        // Boolean to indicate if the process was interrupted
        this.stopped = true;
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
                      path      : App.settings.tmpLocation + '/' + file,
                      maxConns  : 5,
                      dht       : true,
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

        // wrapper for handling a torrent
        start: function(model) {
            // if webtorrent is created/running, we stop/destroy it
            if (App.WebTorrent.destroyed) {
                this.stop();
            }

            this.setModels(model);

            this.fetchTorrent(this.torrentModel.get('torrent')).then(function (torrent) {
                this.handleTorrent(torrent);
                this.handleStreamInfo();
                this.watchState();
                return this.createServer();
            }.bind(this)).then(this.waitForBuffer.bind(this)).catch(this.handleErrors.bind(this));
        },

        download: function(torrent) {
            // if webtorrent is created/running, we stop/destroy it
            if (App.WebTorrent.destroyed) {
                this.stop();
            }

            // handles magnet and hosted torrents
            var uri = torrent.magnet || torrent.url || torrent;
            const parseTorrent = require('parse-torrent');
            var infoHash = '';
            try { infoHash = parseTorrent(uri).infoHash; } catch (err) {}
            App.WebTorrent.add(uri, {
              path      : App.settings.tmpLocation + '/' + infoHash,
              maxConns  : 5,
              dht       : true,
              announce  : Settings.trackers.forced,
              tracker   : Settings.trackers.forced
            });

            fs.writeFileSync(App.settings.tmpLocation + '/TorrentCache/' + infoHash, uri);
        },

        // kill the streamer
        stop: function() {
            if (this.torrent) {
                // update ratio
                AdvSettings.set('totalDownloaded', Settings.totalDownloaded + this.downloaded);
                AdvSettings.set('totalUploaded', Settings.totalUploaded + this.uploaded);
                this.torrent.pause();
                // complete fause torrent, stop download data
                for (const id in this.torrent._peers) {
                  this.torrent.removePeer(id);
                }

                this.torrent._xsRequests.forEach(req => {
                  req.abort();
                });
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
        fetchTorrent: function(torrentInfo) {
            return new Promise(function (resolve, reject) {

                // handles magnet and hosted torrents
                var uri = torrentInfo.magnet || torrentInfo.url || torrentInfo;
                const parseTorrent = require('parse-torrent');
                var infoHash = '';
                try { infoHash = parseTorrent(uri).infoHash; } catch (err) {}

                for(const t of App.WebTorrent.torrents) {
                    if (t.infoHash === infoHash) {
                        this.torrent = t;
                        this.torrent.resume();
                        this.torrentModel.set('torrent', this.torrent);
                        resolve(this.torrent);
                    }
                }

                if (!this.torrent) {
                  this.torrent = App.WebTorrent.add(uri, {
                      path: App.settings.tmpLocation + '/' + infoHash,
                      announce: Settings.trackers.forced
                  });
                }

                const fs = require('fs');
                fs.writeFileSync(App.settings.tmpLocation + '/TorrentCache/' + this.torrent.infoHash, uri);

                this.torrent.on('metadata', function () {
                    this.torrentModel.set('torrent', this.torrent);
                    resolve(this.torrent);
                }.bind(this));

                this.torrent.on('download', function () {
                    if (this.torrentModel) {
                        this.torrentModel.set('downloadSpeed', Common.fileSize(this.torrent.downloadSpeed) + '/s');
                        this.torrentModel.set('downloaded', Math.round(this.torrent.downloaded).toFixed(2));
                        this.torrentModel.set('downloadedFormatted', Common.fileSize(this.torrent.downloaded));
                        this.torrentModel.set('active_peers', this.torrent.numPeers);
                        this.torrentModel.set('downloadedPercent', (this.torrent.progress * 100) || 0);
                        this.torrentModel.set('active_peers', this.torrent.numPeers);
                        this.torrentModel.set('total_peers', this.torrent.numPeers);
                        this.torrentModel.set('time_left', (this.torrent.timeRemaining));
                    }
                }.bind(this));

                this.torrent.on('upload', function () {
                    if (this.torrentModel) {
                        this.torrentModel.set('uploadSpeed', Common.fileSize(this.torrent.uploadSpeed) + '/s');
                        this.torrentModel.set('active_peers', this.torrent.numPeers);
                        this.torrentModel.set('total_peers', this.torrent.numPeers);
                    }
                }.bind(this));

                this.torrent.on('error', function (error) {
                     if (this.torrent.infoHash) {
                     this.torrent.remove(this.torrent.infoHash);
                     this.torrent.add(this.torrent.infoHash);
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

        // present the user with file selector
        openFileSelector: function (torrent) {
            var supported = ['.mp4', '.m4v', '.avi', '.mov', '.mkv', '.wmv'];

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
                this.torrentModel.set('backdrop', img.background);
                this.torrentModel.set('poster', img.poster);
            }.bind(this));
        },

        // try to gather media metadata and manipulate torrentModel
        lookForMetadata: function (torrent) {
            if (this.stopped) {
                return;
            }

            var fileName = this.torrentModel.get('video_file').name;

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

                this.torrentModel.set(props);
                this.lookForImages(metadatas);
                this.handleSubtitles();

            }.bind(this)).catch(function(err) {
                win.error('An error occured while trying to get metadata', err);
                this.torrentModel.set('title', fileName);
                this.handleSubtitles();
            }.bind(this));
        },

        // set video file name & index
        selectFile: function (torrent) {
            var fileIndex = parseInt(this.torrentModel.get('file_index'));
            var fileSize = 0;

            // set fileSize
            if (!fileIndex && parseInt(fileIndex) !== 0) {
                // if no fileIndex set, get the largest
                fileIndex = 0;
                for (var i in torrent.files) {
                    if (fileSize < torrent.files[i].length) {
                        fileSize = torrent.files[i].length;
                        fileIndex = i;
                    }
                }
            } else {
                // else use the correct size
                fileSize = torrent.files[fileIndex].length;
            }

            // deselect files, webtorrent api
            // as of november 2016, need to remove all torrent,
            //  then add wanted file, it's a bug: https://github.com/feross/webtorrent/issues/164
            torrent.deselect(0, torrent.pieces.length - 1, false); // Remove default selection (whole torrent)
            for (var f in torrent.files) { // Add selection
                var file = torrent.files[f];
                if (parseInt(f) === parseInt(fileIndex)) {
                    file.select();
                } else {
                    file.deselect();
                }
            }

            this.torrentModel.set('video_file', {
                name: path.basename(torrent.files[fileIndex].path),
                size: fileSize,
                index: fileIndex,
                path: path.join(torrent.path, torrent.files[fileIndex].path)
            });
        },

        // determine if the torrent is already formatted or if we need to use the file selector
        handleTorrent: function (torrent) {
            var isFormatted = Boolean(this.torrentModel.get('title')); // was formatted (from Details)
            var isRead = Boolean(this.torrentModel.get('torrent_read')); // comes from file selector

            if (isFormatted) {
                this.selectFile(torrent);
                this.handleSubtitles();
            } else {
                if (isRead) {
                    this.selectFile(torrent);
                    this.lookForMetadata(torrent);
                } else {
                    this.openFileSelector(torrent);
                    this.stopped = true;
                    throw 'interrupt';
                }
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

        handleStreamInfo: function () {
            this.streamInfo.set('torrentModel', this.torrentModel);
            this.updateStatsInterval = setInterval(this.streamInfo.updateStats.bind(this.streamInfo), 1000);
            this.streamInfo.updateInfos();
            this.torrentModel.on('change', this.streamInfo.updateInfos.bind(this.streamInfo));
            return App.vent.trigger('stream:started', this.stateModel);
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

        setModels: function (model) {
            this.stopped = false;
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

        onSubtitlesFound: function (subs) {
            if (this.stopped) {
                return;
            }

            var subtitles = subs || this.torrentModel.get('subtitle');
            var total = Object.keys(subtitles).length;
            var defaultSubtitle = this.torrentModel.get('defaultSubtitle');

            win.info(total + ' subtitles found');


            this.torrentModel.set('subtitle', subtitles);

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
                        }

                    }.bind(this));

                    // download the subtitle
                    App.vent.trigger('subtitle:download', {
                        url: subtitles[defaultSubtitle],
                        path: this.torrentModel.get('video_file').path
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
            if (this.stopped) {
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
                        console.log('subtitle fetching error. retry: ' + subtitle_retry + ' of 4');
                    	this.subtitleReady = false;
                    	this.handleSubtitles(subtitle_retry);
                    } else {
	                   this.subtitleReady = true;
                    }
                }.bind(this));

            return;
        },

        buildSubtitleQuery: function () {
            if (this.stopped) {
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
    App.vent.on('stream:download', streamer.download.bind(streamer));
    App.vent.on('stream:serve_subtitles', streamer.serveSubtitles.bind(streamer));
})(window.App);
