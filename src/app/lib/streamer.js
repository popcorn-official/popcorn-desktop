(function(App) {
    "use strict";

    var STREAM_PORT = 21584; // 'PT'!
    var BUFFERING_SIZE = 10 * 1024 * 1024;

    var readTorrent = require('read-torrent');
    var peerflix = require('peerflix');
    var mime = require('mime');

    var engine = null;
    var statsUpdater = null;
    var active = function(wire) {
        return !wire.peerChoking;
    };
    var subtitles = null;


    var watchState = function(stateModel) {

        if (engine != null) {

            var swarm = engine.swarm;
            var state = 'connecting';

            if(swarm.downloaded > BUFFERING_SIZE) {
                state = 'ready';
            } else if(swarm.downloaded) {
                state = 'downloading';
            } else if(swarm.wires.length) {
                state = 'startingDownload';
            }

            stateModel.set('state', state);

            if(state != 'ready') {
                _.delay(watchState, 100, stateModel);
            }
        }
    };

    var handleTorrent = function(torrent, stateModel) {

        var tmpFilename = torrent.info.infoHash;
        tmpFilename = tmpFilename.replace(/([^a-zA-Z0-9-_])/g, '_') +'-'+ (new Date()*1);
        var tmpFile = path.join(App.settings.tmpLocation, tmpFilename);

        engine = peerflix(torrent.info, {
            connections: Settings.connectionLimit, // Max amount of peers to be connected to.
            dht: Settings.dhtLimit,
            path: tmpFile, // we'll have a different file name for each stream also if it's same torrent in same session
            buffer: (1.5 * 1024 * 1024).toString() // create a buffer on torrent-stream
        });

        var streamInfo = new App.Model.StreamInfo({engine: engine});
        statsUpdater = setInterval(_.bind(streamInfo.updateStats, streamInfo, engine), 1000);
        stateModel.set('streamInfo', streamInfo);
        watchState(stateModel);

        var checkReady = function() {
            if(stateModel.get('state') === 'ready') {

                // we need subtitle in the player
                streamInfo.set('subtitle', subtitles != null ? subtitles : torrent.subtitle);
                streamInfo.set('defaultSubtitle', torrent.defaultSubtitle);
                streamInfo.set('title', torrent.title);

                // add few info
                streamInfo.set('show_id', torrent.show_id);
                streamInfo.set('episode', torrent.episode);
                streamInfo.set('season', torrent.season);

                App.vent.trigger('stream:ready', streamInfo);
                stateModel.destroy();
            }
        };

        engine.server.on('listening', function(){
            streamInfo.set('src', 'http://127.0.0.1:' + engine.server.address().port + '/');
            streamInfo.set('type', 'video/mp4');

            // TEST for custom NW
            //streamInfo.set('type', mime.lookup(engine.server.index.name));
            stateModel.on('change:state', checkReady);
            checkReady();
        });

        // not used anymore
        engine.on('ready', function() {});

        engine.on('uninterested', function() {
            if (engine) {
                engine.swarm.pause();
            }
            
        });

        engine.on('interested', function() {
            if (engine) {
                engine.swarm.resume();
            }            
        });

    };

    var Streamer = {
        start: function(model) {

            var torrentUrl  = model.get('torrent');
            
            var stateModel = new Backbone.Model({state: 'connecting', backdrop: model.get('backdrop')});
            App.vent.trigger('stream:started', stateModel);

            if(engine) {
                Streamer.stop();
            }

            readTorrent(torrentUrl, function(err, torrent) {
                if(err) {
                    App.vent.trigger('error', err);
                    App.vent.trigger('stream:stop');
                } else {
                    // did we need to extract subtitle ?
                    var extractSubtitle = model.get('extract_subtitle');
					
                    var getSubtitles = function(data){
                        win.debug('Subtitle data request:', data);
                        
                        var subtitleProvider = new (App.Config.getProvider('tvshowsubtitle'))();
                        
                        subtitleProvider.query(data, function(subs) {
                            if (Object.keys(subs).length > 0) {
                                subtitles = subs;
                                win.info(Object.keys(subs).length + ' subtitles found');
                            }else{
                                subtitles = null;
                                win.warn('No subtitles returned');
                            }
                        });
                    };
					
                    var handleTorrent_fnc = function(){
                        // TODO: We should passe the movie / tvshow imdbid instead
                        // and read from the player
                        // so from there we can use the previous next etc
                        // and use all available function with the right imdb id

                        var torrentInfo = {
                            info: torrent,
                            subtitle: model.get('subtitle'),
                            defaultSubtitle: model.get('defaultSubtitle'),
                            title: title,
                            show_id: model.get('show_id'),
                            episode: model.get('episode'),
                            season: model.get('season')
                        };

                        handleTorrent(torrentInfo, stateModel);
                    };
					
                    if (typeof extractSubtitle == 'object') {
                        extractSubtitle.filename = torrent.name;
                        
                        var subskw = [];
                        for(var key in App.Localization.langcodes){
                            if (App.Localization.langcodes[key].keywords !== undefined) {
                                subskw[key] = App.Localization.langcodes[key].keywords;
                            }
                        }
                        extractSubtitle.keywords = subskw;
                        
                        getSubtitles(extractSubtitle);
                    }

                    //Try get subtitles for custom torrents
                    var title = model.get('title');
                    if(!title) { //From ctrl+v magnet or drag torrent
                        model.set('defaultSubtitle', Settings.subtitle_language);
                        var sub_data = {};
                        title = $.trim( torrent.name.replace('[rartv]','').replace('[PublicHD]','').replace('[ettv]','').replace('[eztv]','') ).replace(/[\s]/g,'.');
                        sub_data.filename = title;
                        var se_re = title.match(/(.*)S(\d\d)E(\d\d)/i);
                        if(se_re != null){
                            var tvshowname = $.trim( se_re[1].replace(/[\.]/g,' ') );
                            var trakt = new (App.Config.getProvider('metadata'))();
                            trakt.episodeDetail({title: tvshowname, season: se_re[2], episode: se_re[3]}, function(error, data) {
                                if(error) {
                                    win.warn(error);
                                    getSubtitles(sub_data);
                                } else if(!data) {
                                    win.warn('TTV error:', error.error);
                                    getSubtitles(sub_data);
                                } else {
                                    $('.loading-background').css('background-image', 'url('+data.show.images.fanart+')');
                                    sub_data.imdbid = data.show.imdb_id;
                                    sub_data.season = data.episode.season.toString();
                                    sub_data.episode = data.episode.number.toString();
                                    getSubtitles(sub_data);
                                    model.set('show_id', data.show.tvdb_id);
                                    model.set('episode', sub_data.season);
                                    model.set('season', sub_data.episode);
                                    title = data.show.title + ' - ' + i18n.__('Season') + ' ' + data.episode.season + ', ' + i18n.__('Episode') + ' ' + data.episode.number + ' - ' + data.episode.title;
                                }
                                handleTorrent_fnc();
                            });
                        }else{
                            getSubtitles(sub_data);
                            handleTorrent_fnc();
                        }
                    } else {
                        handleTorrent_fnc();
                    }
                }
            });
        },

        stop: function() {
            if (engine) {
                engine.destroy();
            }
            engine = null;
            subtitles = null; // reset subtitles to make sure they will not be used in next session.
            win.info("Streaming cancelled");
        }
    };

    App.vent.on('stream:start', Streamer.start);
    App.vent.on('stream:stop', Streamer.stop);

})(window.App);