(function (App) {
    'use strict';

    var BUFFERING_SIZE = 10 * 1024 * 1024;

    var WebTorrentStreamer = function () {

        // WebTorrent instance
        this.webtorrent = null;

        // Torrent Backbone Model
        this.torrentModel = null;

        // State Backbone Model
        this.stateModel = null;

        // Stream Info Backbone Model, which keeps showing ratio/download/upload info.
        // See models/stream_info.js
        this.streamInfo = null;

        // Boolean to indicate if initial buffer is ready
        this.bufferReady = false;

        // Boolean to indicate if subtitles are already downloaded and ready to use
        this.subtitleReady = false;

        // Interval controller for StreamInfo view, which keeps showing ratio/download/upload info.
        // See models/stream_info.js
        this.updateStatsInterval = null;

    };

    WebTorrentStreamer.prototype = {

        start: function (model) {

            this.torrentModel = model;

            this.stateModel = new Backbone.Model({
                state: 'connecting',
                backdrop: this.torrentModel.get('backdrop'),
                title: '',
                player: '',
                show_controls: false
            });

            App.vent.trigger('stream:started', this.stateModel);

            // if webtorrent is created/running, we stop/destroy it
            if (this.webtorrent) {
                this.stop();
            }

            this.setup()
                .then(this.stream.bind(this));

        },

        stop: function () {

            if (this.webtorrent) {
                this.webtorrent.destroy();
            }

            this.webtorrent = null;
            this.torrentModel = null;
            this.stateModel = null;
            this.streamInfo = null;

            this.bufferReady = false;
            this.subtitleReady = false;

            clearInterval(this.updateStatsInterval);
            this.updateStatsInterval = null;

            App.vent.off('subtitle:downloaded');

            win.info('Streaming cancelled.');
        },

        getWebTorrentInstance: function() {

            if (this.webtorrent === null) {
                this.webtorrent = new WebTorrent({
                    dht: true,
                    maxConns: parseInt(Settings.connectionLimit, 10) || 100,
                    tracker: {
                        peerId: crypt.pseudoRandomBytes(10).toString('hex'),
                        announce: [
                            'udp://tracker.openbittorrent.com:80',
                            'udp://tracker.coppersurfer.tk:6969',
                            'udp://9.rarbg.com:2710/announce',
                            'udp://tracker.publicbt.com:80/announce'
                        ]
                    }
                });

            }

            return this.webtorrent;
        },

        fetchTorrent: function(torrentUrl) {

            var defer = Q.defer();

            this.getWebTorrentInstance().add(torrentUrl, {
                path: this.__getTmpFilename()
            }, function(torrent) {
                defer.resolve(torrent);
            });

            return defer.promise;
        },

        /**
         * This method is responsible for discover torrentModel info.
         * If torrentModel has title, we need to do nothing (torrentModel is already 'formatted')
         * If we are forcing torrent reading (torrent_read == true, e.g FileSelector) , we discover its info from Common.matchTorrent
         * If we just have an URL, we parse it with read-torrent and open FileSelector for user interaction
         */
        setup: function() {

            var defer = Q.defer(),
                torrentModel = this.torrentModel,
                torrentInfo = torrentModel.get('torrent'),
                torrentUrl = torrentInfo.magnet || torrentInfo.url || torrentInfo;

            this.fetchTorrent(torrentUrl).then(function(torrent) {

                torrentModel.set('torrent', torrent);

                if ( torrentModel.get('title') ) {
                    return defer.resolve();
                }

                if ( torrentModel.get('torrent_read') ) {
                    // if torrent was readed before, just need to discover

                    // set config subtitle language to torrent
                    torrentModel.set('defaultSubtitle', Settings.subtitle_language);

                    Common.matchTorrent(torrent.name).then(function (res) {

                        // if we got errors, try force to play
                        if (res.error) {
                            win.warn(res.error);
                            torrentModel.set('title', res.filename);
                            return defer.resolve();
                        }

                        // populating torrentModel with the new data
                        switch (res.type) {
                            case 'movie':
                                $('.loading-background').css('background-image', 'url(' + res.movie.image + ')');
                                torrentModel.set('quality', res.quality);
                                torrentModel.set('imdb_id', res.movie.imdbid);
                                torrentModel.set('title', res.movie.title);
                                break;
                            case 'episode':
                                $('.loading-background').css('background-image', 'url(' + res.show.episode.image + ')');
                                torrentModel.set('quality', res.quality);
                                torrentModel.set('tvdb_id', res.show.tvdbid);
                                torrentModel.set('episode_id', res.show.episode.tvdbid);
                                torrentModel.set('imdb_id', res.show.imdbid);
                                torrentModel.set('episode', res.show.episode.episode);
                                torrentModel.set('season', res.show.episode.season);
                                torrentModel.set('title', res.show.title + ' - ' + i18n.__('Season %s', res.show.episode.season) + ', ' + i18n.__('Episode %s', res.show.episode.episode) + ' - ' + res.show.episode.title);
                                break;
                            default:
                        }

                        return defer.resolve();
                    }).catch(function(err) {
                        win.error('An error occured while trying to get metadata and subtitles', err);
                        return defer.resolve();
                    });

                    return defer.resolve();
                }

                // hide non-video files from selection
                for (var f in torrent.files) {
                    torrent.files[f].index = f;
                    if (isVideo(torrent.files[f].name)) {
                        torrent.files[f].display = true;
                    } else {
                        torrent.files[f].display = false;
                    }
                }

                var fileIndex = torrentModel.get('file_index');

                // if needs user interaction for file selection
                if (torrent.files && torrent.files.length > 0 && !fileIndex && fileIndex !== 0) {

                    var fileModel = new Backbone.Model({
                        torrent: torrent,
                        files: torrent.files
                    });
                    App.vent.trigger('system:openFileSelector', fileModel);
                }

                return defer.reject();

            });

            return defer.promise;
        },

        /**
         * Start torrent streaming based on torrentModel, which was formatted before
         */
        stream: function () {

            var torrent = this.torrentModel.get('torrent');

            this.streamInfo = new App.Model.StreamInfo();
            this.streamInfo.set('torrentModel', this.torrentModel);

            // compatibility
            this.streamInfo.set('title', this.torrentModel.get('title'));
            this.streamInfo.set('player', this.torrentModel.get('device'));
            this.streamInfo.set('device', this.torrentModel.get('device'));
            this.streamInfo.set('quality', this.torrentModel.get('quality'));
            this.streamInfo.set('defaultSubtitle', this.torrentModel.get('defaultSubtitle'));
            // end compatibility

            this.stateModel.set('streamInfo', this.streamInfo);

            this.streamInfo.selectFile();
            this.streamInfo.updateStats();
            this.updateStatsInterval = setInterval(this.streamInfo.updateStats.bind(this.streamInfo), 1000);

            this.stateModel.set('state', 'startingDownload');

            var serverPort, serverCreated = false;

            while (!serverCreated) {

                serverPort = this.__generatePortNumber();

                try {
                    win.info('Trying to create stream server on port: ', serverPort);
                    torrent.createServer().listen(serverPort);
                    serverCreated = true;
                } catch (e) {
                    win.info('Could not listen on port: ', serverPort);
                }

            }

            this.stateModel.set('state', 'downloading');

            // when state get 'ready' value
            // we emit 'stream:ready' to players
            this.stateModel.on('change:state', function () {

                if (this.stateModel.get('state') !== 'ready') {
                    return;
                }

                if (this.streamInfo.get('player') && this.streamInfo.get('player').id !== 'local') {
                    this.stateModel.set('state', 'playingExternally');
                }

                this.streamInfo.set('downloaded', 0);

                App.vent.trigger('stream:ready', this.streamInfo);
                this.stateModel.destroy();

            }.bind(this));

            // search for media file index
            var fileIndex = 0,
                __size = 0;
            torrent.files.forEach(function (file, idx) {

                if (__size < file.length) {
                    __size = file.length;
                    fileIndex = idx;
                }
            });

            // set location to player
            this.streamInfo.set('src', 'http://127.0.0.1:' + serverPort + '/' + fileIndex);
            this.streamInfo.set('type', 'video/mp4');

            this.__handleSubtitles(torrent.files[fileIndex]);

            // when download size reaches BUFFERING_SIZE, we set state as 'ready'
            var onDownload = function() {

                if (torrent.downloaded <= BUFFERING_SIZE) {
                    return;
                }

                // once torrent is "ready" we dont need this check anymore
                torrent.removeListener('download', onDownload);

                this.bufferReady = true;

                if (!this.subtitleReady) {
                    return this.stateModel.set('state', 'waitingForSubtitles');
                }

                return this.stateModel.set('state', 'ready');

            }.bind(this);

            torrent.on('download', onDownload);

        },

        __getTmpFilename: function() {
            return App.settings.tmpLocation;
        },

        __handleSubtitles: function(videoFile) {

            var torrent = this.torrentModel.get('torrent'),
                defaultSubtitle = this.torrentModel.get('defaultSubtitle');

            // after downloaded subtitles, we set the srt file to streamInfo
            App.vent.on('subtitle:downloaded', function (sub) {

                if (sub) {
                    this.streamInfo.set('subFile', sub);
                    App.vent.trigger('subtitle:convert', {
                        path: sub,
                        language: defaultSubtitle
                    }, function (err, res) {
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
                            App.Subtitles.Server.start(res);
                        }
                    }.bind(this));
                }

            }.bind(this));

            this.findSubtitles().then(function(subtitles) {

                // if thereis default subtitle set, we download the subtitle
                if ( defaultSubtitle && defaultSubtitle !== 'none') {
                    App.vent.trigger('subtitle:download', {
                        url: subtitles[defaultSubtitle],
                        path: path.join(this.__getTmpFilename(), videoFile.path)
                    });
                }

                this.streamInfo.set('subtitle', subtitles);

                if (subtitles.length === 0) {
                    this.streamInfo.set('subtitle', this.torrentModel.get('subtitle'));
                }

                this.subtitleReady = true;

                if (this.bufferReady) {
                    this.stateModel.set('state', 'ready');
                }

            }.bind(this));

        },

        /**
         * Method to discover and find subtitles from providers by torrent informed
         */
        findSubtitles: function () {

            var defer = Q.defer(),
                queryData = {},
                extractSubtitle = this.torrentModel.get('extract_subtitle');

            if (typeof extractSubtitle === 'object') {
                queryData = extractSubtitle;
            }

            queryData.filename = this.torrentModel.get('torrent').name;
            queryData.keywords = this.__getSubtitleKeywords();

            if (this.torrentModel.get('imdb_id')) {
                queryData.imdb_id = this.torrentModel.get('imdb_id');
            }

            if (this.torrentModel.get('season')) {
                queryData.season = this.torrentModel.get('season');
            }

            if (this.torrentModel.get('episode')) {
                queryData.episode = this.torrentModel.get('episode');
            }

            var subtitleProvider = App.Config.getProviderForType('subtitle');
            subtitleProvider.fetch(queryData).then(function (subs) {

                    if (subs && Object.keys(subs).length > 0) {
                        win.info(Object.keys(subs).length + ' subtitles found');
                        return defer.resolve(subs);
                    }

                    win.warn('No subtitles returned');

                    if (Settings.subtitle_language !== 'none') {
                        App.vent.trigger('notification:show', new App.Model.Notification({
                            title: i18n.__('No subtitles found'),
                            body: i18n.__('Try again later or drop a subtitle in the player'),
                            showRestart: false,
                            type: 'warning',
                            autoclose: true
                        }));
                    }

                    defer.resolve([]);

                }.bind(this))
                .catch(function (err) {
                    win.error('subtitleProvider.fetch()', err);
                    defer.resolve([]);
                }.bind(this));

            return defer.promise;
        },

        /**
         * Method to return keywords for subttiles search bases on Localization
         */
        __getSubtitleKeywords: function () {
            var keywords = [];
            for (var key in App.Localization.langcodes) {
                if (App.Localization.langcodes[key].keywords !== undefined) {
                    keywords[key] = App.Localization.langcodes[key].keywords;
                }
            }

            return keywords;
        },

        // generate an port number between 1024 and 65000
        __generatePortNumber: function() {
            var min = 1024, max = 65000;

            return Math.floor(Math.random() * (max - min)) + min;
        }
    };

    var streamer = new WebTorrentStreamer();

    App.vent.on('stream:start', streamer.start.bind(streamer));
    App.vent.on('stream:stop', streamer.stop.bind(streamer));

})(window.App);
