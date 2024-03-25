(function (App) {
    'use strict';
    var rpc = require('json-rpc2');
    var server;
    var httpServer;

    function butterCallback(callback, err, result) {
        if (result === undefined) {
            result = {};
        }
        result.butterVersion = App.settings.version;
        callback(err, result);
    }

    var initServer = function () {
        return new Promise(function (resolve, reject) {
            server = rpc.Server({
                'headers': { // allow custom headers is empty by default
                    'Access-Control-Allow-Origin': '*'
                }
            });

            ////////////////////
            ////// UTILS ///////
            ////////////////////
            server.expose('listennotifications', function (args, opt, callback) {
                var timeout;
                var startTime = (new Date()).getTime();
                var events = {};

                var emitEvents = function () {
                    butterCallback(callback, false, {
                        'events': events
                    });
                };

                //Do a small delay before sending data in case there are more simultaneous events
                var reinitTimeout = function () {
                    //Only do a delay if the request won't time out in the meantime
                    if (startTime + 8000 - (new Date()).getTime() > 250) {
                        if (timeout) {
                            clearTimeout(timeout);
                        }
                        timeout = setTimeout(emitEvents, 200);
                    }
                };

                //Listen for seek position change
                App.vent.on('seekchange', function () {
                    events.seek = App.PlayerView.player.currentTime();
                    reinitTimeout();
                });

                //Listen for volume change
                App.vent.on('volumechange', function () {
                    events.volumechange = App.PlayerView.player.volume();
                    reinitTimeout();
                });

                //Listen for seek position change
                App.vent.on('fullscreenchange', function () {
                    events.fullscreen = win.isFullscreen;
                    reinitTimeout();
                });

                //Listen for playing change
                var playingChange = function () {
                    events.playing = !App.PlayerView.player.paused();
                    reinitTimeout();
                };

                App.vent.on('player:pause', playingChange);
                App.vent.on('player:play', playingChange);

                //Listen for view stack change
                var emitViewChange = function () {
                    events.viewstack = App.ViewStack;
                    reinitTimeout();
                };

                App.vent.on('viewstack:push', emitViewChange);
                App.vent.on('viewstack:pop', emitViewChange);
            });

            server.expose('ping', function (args, opt, callback) {
                butterCallback(callback);
            });

            server.expose('getviewstack', function (args, opt, callback) {
                butterCallback(callback, false, {
                    'viewstack': App.ViewStack
                });
            });

            ////////////////////
            ///// STANDARD /////
            ////////////////////
            server.expose('up', function (args, opt, callback) {
                Mousetrap.trigger('up');
                butterCallback(callback);
            });

            server.expose('down', function (args, opt, callback) {
                Mousetrap.trigger('down');
                butterCallback(callback);
            });

            server.expose('left', function (args, opt, callback) {
                Mousetrap.trigger('left');
                butterCallback(callback);
            });

            server.expose('right', function (args, opt, callback) {
                Mousetrap.trigger('right');
                butterCallback(callback);
            });

            server.expose('enter', function (args, opt, callback) {
                Mousetrap.trigger('enter');
                butterCallback(callback);
            });

            server.expose('back', function (args, opt, callback) {
                Mousetrap.trigger('backspace');
                butterCallback(callback);
            });

            ////////////////////
            ///// LIST ITEM ////
            ////////////////////
            server.expose('togglefavourite', function (args, opt, callback) {
                if (!App.ViewStack.includes('app-overlay')) {
                    Mousetrap.trigger('f', 'keydown');
                    butterCallback(callback);
                }
            });

            server.expose('togglewatched', function (args, opt, callback) {
                if (!App.ViewStack.includes('app-overlay')) {
                    Mousetrap.trigger('w', 'keydown');
                    butterCallback(callback);
                }
            });

            server.expose('setselection', function (args, opt, callback) {
                var index = 0;
                args = Object.values(args);
                if (args.length > 0) {
                    index = parseFloat(args[0]);
                } else {
                    butterCallback(callback, 'Arguments missing');
                }

                App.getView().getRegion('Content').currentView.getRegion('ItemList').currentView.selectIndex(index);

                butterCallback(callback);
            });

            server.expose('getselection', function (args, opt, callback) {
                var movieView = App.getView().getRegion('MovieDetail').currentView;
                if (movieView === undefined || movieView.model === undefined) {
                    var index = $('.item.selected').index();
                    args = Object.values(args);
                    if (args.length > 0) {
                        index = parseInt(args[0]);
                    } else {
                        if (index === -1) {
                            index = 0;
                        }
                    }
                    var result = App.getView().getRegion('Content').currentView.getRegion('ItemList').currentView.collection.models[index];
                    if (result === undefined) {
                        butterCallback(callback, 'Index not found');
                    }

                    var type = result.get('type');
                    switch (type) {
                    case 'movie':
                        butterCallback(callback, false, result.attributes);
                        break;
                    case 'show':
                    case 'anime':
                        result.set('health', false);
                        var provider = App.Providers.get(result.get('provider'));
                        var data = provider.detail(result.get('imdb_id'), result.attributes)
                            .then(function (resolve, reject) {
                                data.provider = provider.name;
                                result = new App.Model[type.charAt(0).toUpperCase() + type.slice(1)](data);
                                butterCallback(callback, false, result.attributes);
                            });

                        break;
                    }
                } else {
                    var model = movieView.model.attributes;
                    if (model.type !== 'movie') {
                        var episodeId = parseInt($('.startStreaming').attr('data-episodeid'));
                        model.episodes.forEach(function (item) {
                            if (item.tvdb_id === episodeId) {
                                model.selectedEpisode = item;
                            }
                        });
                    }
                    butterCallback(callback, false, model);
                }
            });

            ////////////////////
            ////// BROWSER /////
            ////////////////////
            server.expose('showslist', function (args, opt, callback) {
                $('.source.tvshowTabShow').click();
                butterCallback(callback);
            });

            server.expose('movieslist', function (args, opt, callback) {
                $('.source.movieTabShow').click();
                butterCallback(callback);
            });

            server.expose('animelist', function (args, opt, callback) {
                $('.source.animeTabShow').click();
                butterCallback(callback);
            });

            server.expose('showwatchlist', function (args, opt, callback) {
                $('#filterbar-watchlist').click();
                butterCallback(callback);
            });

            server.expose('showfavourites', function (args, opt, callback) {
                $('#filterbar-favorites').click();
                butterCallback(callback);
            });

            server.expose('showsettings', function (args, opt, callback) {
                $('#filterbar-settings').click();
                butterCallback(callback);
            });

            server.expose('showabout', function (args, opt, callback) {
                $('#filterbar-about').click();
                butterCallback(callback);
            });

            server.expose('toggletab', function (args, opt, callback) {
                Mousetrap.trigger('tab');
                butterCallback(callback);
            });

            server.expose('getcurrenttab', function (args, opt, callback) {
                butterCallback(callback, false, {
                    'tab': App.currentview
                });
            });

            server.expose('getcurrentlist', function (args, opt, callback) {
                var collection = App.getView().getRegion('Content').currentView.getRegion('ItemList').currentView.collection;
                var result = collection.models;
                var page = 0;
                args = Object.values(args);
                if (args.length > 0) {
                    page = parseInt(args[0]);
                    var size = page * 50;
                    if (result.length < size) {
                        collection.on('loaded', function () {
                            result = collection.models;
                            if (result.length >= size) {
                                result = result.slice((page - 1) * 50, size);
                                butterCallback(callback, false, {
                                    'type': result[0].get('type'),
                                    'list': result,
                                    'page': page,
                                    'max_page': App.getView().getRegion('Content').currentView.getRegion('ItemList').currentView.collection.filter.page
                                });
                            } else {
                                collection.fetchMore();
                            }
                        });
                        collection.fetchMore();
                    } else {
                        result = result.slice((page - 1) * 50, size);
                        butterCallback(callback, false, {
                            'type': result[0].get('type'),
                            'list': result,
                            'page': page,
                            'max_page': App.getView().getRegion('Content').currentView.getRegion('ItemList').currentView.collection.filter.page
                        });
                    }
                } else {
                    page = App.getView().getRegion('Content').currentView.getRegion('ItemList').currentView.collection.filter.page;
                    butterCallback(callback, false, {
                        'type': result[0].get('type'),
                        'list': result,
                        'page': page,
                        'max_page': page
                    });
                }
            });

            server.expose('getfullscreen', function (args, opt, callback) {
                butterCallback(callback, false, {
                    'fullscreen': win.isFullscreen
                });
            });

            ////////////////////
            ////// DETAILS /////
            ////////////////////
            server.expose('togglequality', function (args, opt, callback) {
                Mousetrap.trigger('q', 'keydown');
                butterCallback(callback);
            });

            server.expose('getplayers', function (args, opt, callback) {
                var players = App.Device.Collection.models;

                butterCallback(callback, false, {
                    'players': players
                });
            });

            server.expose('setplayer', function (args, opt, callback) {
                args = Object.values(args);
                if (args.length > 0) {
                    var el = $('.playerchoicemenu li#player-' + args[0] + ' a');
                    if (el.length > 0) {
                        App.Device.Collection.setDevice(args[0]);
                        $('.playerchoicemenu li a.active').removeClass('active');
                        el.addClass('active');
                        $('.imgplayerchoice').attr('src', el.children('img').attr('src'));
                        butterCallback(callback, false);
                    } else {
                        App.Device.Collection.models.forEach(function (item) {
                            if (item.id === args[0]) {
                                App.Device.Collection.setDevice(args[0]);
                                butterCallback(callback, false);
                            }
                        });
                        butterCallback(callback, 'Player ID invalid');
                    }
                } else {
                    butterCallback(callback, 'Arguments missing');
                }
            });

            server.expose('startstream', function (args, opt, callback) {
                if (args.imdb_id === undefined || args.torrent_url === undefined || args.backdrop === undefined || args.subtitle === undefined || args.selected_subtitle === undefined || args.title === undefined || args.quality === undefined || args.type === undefined) {
                    butterCallback(callback, 'Arguments missing');
                } else {
                    var model = {
                        imdb_id: args.imdb_id,
                        torrent: args.torrent_url,
                        backdrop: args.backdrop,
                        subtitle: args.subtitle,
                        defaultSubtitle: args.selected_subtitle,
                        title: args.title,
                        quality: args.quality,
                        type: args.type,
                        device: App.Device.Collection.selected
                    };
                    if (args.tvdb_id) {
                        model.tvdb_id = args.tvdb_id;
                    }
                    if (args.season) {
                        model.season = args.season;
                    }
                    if (args.episode) {
                        model.episode = args.episode;
                    }
                    if (args.episode_id) {
                        model.episode_id = args.episode_id;
                    }
                    if (args.epInfo) {
                        model.extract_subtitle = args.epInfo;
                    }
                    var torrentStart = new Backbone.Model(model);
                    App.vent.trigger('stream:start', torrentStart);
                    butterCallback(callback);
                }
            });

            server.expose('previousseason', function (args, opt, callback) {
                Mousetrap.trigger('ctrl+up');
                butterCallback(callback);
            });

            server.expose('nextseason', function (args, opt, callback) {
                Mousetrap.trigger('ctrl+down');
                butterCallback(callback);
            });

            server.expose('selectepisode', function (args, opt, callback) {
                args = Object.values(args);
                if (args.length <= 0) {
                    butterCallback(callback, 'Arguments missing');
                    return;
                }

                var movieView = App.getView().getRegion('MovieDetail').currentView;
                if (movieView === undefined || movieView.model === undefined || movieView.model.type === 'movie') {
                    butterCallback(callback, 'View not open');
                    return;
                }

                var season = parseInt(args[0]);
                var episode = parseInt(args[1]) - 1;

                $('li[data-tab=season-' + season + ']').click();
                $('.season-' + season + '.current li')[episode].click();

                butterCallback(callback);
            });

            server.expose('getsubtitles', function (args, opt, callback) {
                if (App.ViewStack.includes('app-overlay')) {
                    butterCallback(callback, false, {
                        'subtitles': _.keys(App.PlayerView.model.get('subtitle'))
                    });
                } else {
                    butterCallback(callback, false, {
                        'subtitles': _.keys(App.MovieDetailView.model.get('subtitle'))
                    });
                }
            });

            server.expose('setsubtitle', function (args, opt, callback) {
                args = Object.values(args);
                if (args.length <= 0) {
                    butterCallback(callback, 'Arguments missing');
                    return;
                }

                var lang = args[0];
                if (App.ViewStack.includes('app-overlay')) {
                    if (lang === 'no-subs') {
                        $('.vjs-menu-item')[0].click();
                    } else {
                        var tracks = App.PlayerView.player.textTracks();
                        for (var trackIndex = 0; trackIndex < tracks.length; trackIndex++) {
                            var track = tracks[trackIndex];
                            if (track.language() === lang) {
                                // Disable the previous active track and enable the new one.
                                App.PlayerView.player.showTextTrack(track.id(), track.kind());
                                // Force subtitle background to inline-block,
                                // else it take the full width when reloading a previously loaded sub
                                $('.vjs-text-track').css('display', 'inline-block');
                                break;
                            }
                        }
                    }
                }

                // Check to make sure this is even possible
                if (App.MovieDetailView !== undefined) {
                    App.MovieDetailView.switchSubtitle(lang);
                }

                butterCallback(callback);
            });

            ////////////////////
            ///// FILTERBAR ////
            ////////////////////
            server.expose('getgenres', function (args, opt, callback) {
                switch (App.currentview) {
                case 'shows':
                    butterCallback(callback, false, {
                        'genres': App.Config.genres_tv
                    });
                    break;
                case 'anime':
                    butterCallback(callback, false, {
                        'genres': App.Config.genres_anime
                    });
                    break;
                case 'movies':
                    butterCallback(callback, false, {
                        'genres': App.Config.genres
                    });
                    break;
                default:
                    butterCallback(callback, false, {
                        'genres': []
                    });
                    break;
                }
            });

            server.expose('getsorters', function (args, opt, callback) {
                switch (App.currentview) {
                case 'movies':
                    butterCallback(callback, false, {
                        'sorters': App.Config.sorters
                    });
                    break;
                case 'shows':
                    butterCallback(callback, false, {
                        'sorters': App.Config.sorters_tv
                    });
                    break;
                case 'anime':
                    butterCallback(callback, false, {
                        'sorters': App.Config.sorters_anime
                    });
                    break;
                case 'Favorites':
                    butterCallback(callback, false, {
                        'sorters': App.Config.sorters_fav
                    });
                    break;
                default:
                    butterCallback(callback, false, {
                        'sorters': []
                    });
                    break;
                }
            });

            server.expose('gettypes', function (args, opt, callback) {
                switch (App.currentview) {
                case 'anime':
                    butterCallback(callback, false, {
                        'types': App.Config.types_anime
                    });
                    break;
                case 'Favorites':
                    butterCallback(callback, false, {
                        'types': App.Config.types_fav
                    });
                    break;
                default:
                    butterCallback(callback, false, {
                        'types': []
                    });
                    break;
                }
            });

            server.expose('filtergenre', function (args, opt, callback) {
                args = Object.values(args);
                if (args.length <= 0) {
                    butterCallback(callback, 'Arguments missing');
                    return;
                }

                $('.genres .dropdown-menu a').filter(function () {
                    return $(this).attr('data-value').toLowerCase() === args[0].toLowerCase();
                }).click();

                butterCallback(callback);
            });

            server.expose('filtersorter', function (args, opt, callback) {
                args = Object.values(args);
                if (args.length <= 0) {
                    butterCallback(callback, 'Arguments missing');
                    return;
                }

                $('.sorters .dropdown-menu a').filter(function () {
                    return $(this).attr('data-value').toLowerCase() === args[0].toLowerCase();
                }).click();

                butterCallback(callback);
            });

            server.expose('filtertype', function (args, opt, callback) {
                args = Object.values(args);
                if (args.length <= 0) {
                    butterCallback(callback, 'Arguments missing');
                    return;
                }

                $('.types .dropdown-menu a').filter(function () {
                    return $(this).attr('data-value').toLowerCase() === args[0].toLowerCase();
                }).click();

                butterCallback(callback);
            });

            server.expose('filterrating', function (args, opt, callback) {
                args = Object.values(args);
                if (args.length <= 0) {
                    butterCallback(callback, 'Arguments missing');
                    return;
                }

                $('.ratings .dropdown-menu a').filter(function () {
                    return $(this).attr('data-value').toLowerCase() === args[0].toLowerCase();
                }).click();

                butterCallback(callback);
            });

            server.expose('filtersearch', function (args, opt, callback) {
                args = Object.values(args);
                if (args.length <= 0) {
                    butterCallback(callback, 'Arguments missing');
                    return;
                }

                $('#searchbox').val(args[0]);
                $('.search form').submit();
                butterCallback(callback);
            });

            server.expose('clearsearch', function (args, opt, callback) {
                $('.search .clear').click();
                butterCallback(callback);
            });

            server.expose('watchtrailer', function (args, opt, callback) {
                if (App.ViewStack[App.ViewStack.length - 1] !== 'movie-detail') {
                    butterCallback(callback, 'View not open');
                    return;
                }

                $('#watch-trailer').click();
            });

            ////////////////////
            ////// LOADING /////
            ////////////////////
            server.expose('getloading', function (args, opt, callback) {
                var view = App.LoadingView;
                var loading = false;
                if (view !== undefined && !view.isDestroyed()) {
                    var streamInfo = view.model.get('streamInfo');

                    var result = {
                        activePeers: streamInfo.get('active_peers'),
                        downloadSpeed: streamInfo.get('downloadSpeed'),
                        uploadSpeed: streamInfo.get('uploadSpeed'),
                        bufferPercent: streamInfo.get('buffer_percent'),
                        title: streamInfo.get('title'),
                        loading: true
                    };

                    butterCallback(callback, false, result);
                } else {
                    butterCallback(callback, false, {
                        'loading': false
                    });
                }
            });

            ////////////////////
            ////// PLAYER //////
            ////////////////////
            server.expose('volume', function (args, opt, callback) {
                var volume = 1;
                var view = App.PlayerView;
                if (view !== undefined && view.player !== undefined) {
                    args = Object.values(args);
                    if (args.length > 0) {
                        volume = parseFloat(args[0]);
                        if (volume > 0) {
                            if (view.player.muted()) {
                                view.player.muted(false);
                            }
                            view.player.volume(volume);
                        } else {
                            view.player.muted(true);
                        }
                    }
                    butterCallback(callback, false, {
                        volume: App.PlayerView.player.volume()
                    });
                    return;
                }
                butterCallback(callback, 'Can\'t change volume, player is not open.');
            });

            server.expose('toggleplaying', function (args, opt, callback) {
                if (!App.ViewStack.includes('app-overlay')) {
                    Mousetrap.trigger('space'); // binding on movie/show_detail view
                } else if (App.ViewStack.includes('app-overlay')) {
                    Mousetrap.trigger('space', 'keydown'); // binding on player view
                }
                butterCallback(callback);
            });

            server.expose('togglemute', function (args, opt, callback) {
                if (App.ViewStack.includes('app-overlay')) {
                    Mousetrap.trigger('m', 'keydown');
                    butterCallback(callback);
                }
            });

            server.expose('togglecroptofit', function (args, opt, callback) {
                Mousetrap.trigger('c');
                butterCallback(callback);
            });

            server.expose('togglesubtitles', function (args, opt, callback) {
                Mousetrap.trigger('v');
                butterCallback(callback);
            });

            server.expose('togglefullscreen', function (args, opt, callback) {
                if (App.ViewStack.includes('app-overlay')) {
                    Mousetrap.trigger('f', 'keydown');
                    butterCallback(callback, false, {
                        'fullscreen': win.isFullscreen
                    });
                }
            });

            server.expose('seek', function (args, opt, callback) {
                args = Object.values(args);
                if (args.length <= 0) {
                    butterCallback(callback, 'Arguments missing');
                    return;
                }

                var view = App.PlayerView;
                args = parseFloat(args[0]);
                if (view !== undefined && view.player !== undefined && args !== undefined) {
                    App.PlayerView.seek(args);
                }
                butterCallback(callback);
            });

            server.expose('subtitleoffset', function (args, opt, callback) {
                args = Object.values(args);
                if (args.length <= 0) {
                    butterCallback(callback, 'Arguments missing');
                    return;
                }
                App.PlayerView.adjustSubtitleOffset(parseFloat(args[0]));
                butterCallback(callback);
            });

            server.expose('getstreamurl', function (args, opt, callback) {
                var video = $('#video_player video');
                if (App.PlayerView !== undefined && !App.PlayerView.isDestroyed()) {
                    butterCallback(callback, false, {
                        streamUrl: video === undefined ? '' : video.attr('src')
                    });
                    return;
                }
                butterCallback(callback, 'Cannot get stream URL: no video playing.');
            });

            server.expose('getplaying', function (args, opt, callback) {
                var video = $('#video_player video');
                var view = App.PlayerView;
                var playing = false;
                if (view !== undefined && !view.isDestroyed()) {
                    var result = {
                        playing: !view.player.paused(),
                        title: view.model.get('title'),
                        movie: view.isMovie(),
                        quality: view.model.get('quality'),
                        downloadSpeed: view.model.get('downloadSpeed'),
                        uploadSpeed: view.model.get('uploadSpeed'),
                        activePeers: view.model.get('activePeers'),
                        volume: view.player.volume(),
                        currentTime: App.PlayerView.player.currentTime(),
                        duration: App.PlayerView.player.duration(),
                        streamUrl: video === undefined ? '' : video.attr('src'),
                        selectedSubtitle: '',
                        isFullscreen: win.isFullscreen
                    };

                    if (result.movie && result.movie !== undefined) {
                        result.imdb_id = view.model.get('imdb_id');
                    } else if (result.movie === undefined) {
                        result.imdb_id = false;
                    } else {
                        result.tvdb_id = view.model.get('tvdb_id');
                        result.season = view.model.get('season');
                        result.episode = view.model.get('episode');
                    }

                    if (App.PlayerView.player.textTrackDisplay.children().length > 0) {
                        result.selectedSubtitle = App.PlayerView.player.textTrackDisplay.children()[0].language();
                    }

                    butterCallback(callback, false, result);
                } else {
                    butterCallback(callback, false, {
                        'playing': false
                    });
                }
            });

            ////////////////////
            //////// END ///////
            ////////////////////
            return resolve();
        });
    };

    var sockets = [];

    function startListening() {
        httpServer = server.listen(Settings.httpApiPort);

        httpServer.on('connection', function (socket) {
            sockets.push(socket);
            socket.setTimeout(4000);
            socket.on('close', function () {
                sockets.splice(sockets.indexOf(socket), 1);
            });
        });
    }

    function closeServer(cb) {
        httpServer.close(function () {
            cb();
        });
        for (var i = 0; i < sockets.length; i++) {
            win.info('HTTP API: socket #' + i + ' destroyed');
            sockets[i].destroy();
        }
    }

    App.vent.on('initHttpApi', function () {
        if (!Settings.httpApiEnabled) {
            if (httpServer) {
                closeServer(() => {});
            }
            return;
        }
        win.info('Initializing HTTP API server');
        initServer().then(function () {
            server.enableAuth(Settings.httpApiUsername, Settings.httpApiPassword);
            if (httpServer) {
                closeServer(startListening);
            } else {
                startListening();
            }
        });
    });

})(window.App);
