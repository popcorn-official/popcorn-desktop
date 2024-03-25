(function (App) {
    'use strict';

    let healthButton;

    var _this, bookmarked;
    var ShowDetail = Marionette.View.extend({
        template: '#show-detail-tpl',
        className: 'shows-container-contain',

        ui: {
            showTorrents: '.show-all-torrents',
            startStreaming: '#watch-now',
            bookmarkIcon: '.sha-bookmark',
            seasonTab: '.sd-seasons'
        },

        events: {
            'click .sha-bookmark': 'toggleFavorite',
            'click .sha-watched': 'markShowAsWatched',
            'click .watched': 'toggleWatched',
            'click #watch-now': 'startStreaming',
            'click #download-torrent': 'downloadTorrent',
            'click #show-all-torrents': 'showAllTorrents',
            'click .close-icon': 'closeDetails',
            'click .tab-season': 'clickSeason',
            'click .tab-episode': 'clickEpisode',
            'mousedown .shmi-year': 'openRelInfo',
            'mousedown .shmi-imdb': 'openIMDb',
            'mousedown .shmi-tmdb-link': 'openTmdb',
            'mousedown .magnet-icon': 'openMagnet',
            'mousedown .source-icon': 'openSource',
            'dblclick .tab-episode': 'dblclickEpisode',
            'click .playerchoicemenu li a': 'selectPlayer',
            'click .shmi-rating': 'switchRating',
            'click .health-icon': 'refreshTorrentHealth',
            'mousedown .shp-img': 'clickPoster',
            'mousedown .show-detail-container': 'exitZoom', 
            'mousedown .shm-title, .sdoi-title, .episodeData div': 'copytoclip',
            'click .playerchoicehelp': 'showPlayerList',
            'click .playerchoicerefresh': 'refreshPlayerList'
        },

        regions: {
            torrentList: '#torrent-list',
            torrentShowList: '#torrent-show-list',
            subDropdown: '#subs-dropdown',
            audioDropdown: '#audio-dropdown',
            qualitySelector: '#quality-selector',
        },

        toggleFavorite: function (e) {
            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }
            $('li[data-imdb-id="' + this.model.get('imdb_id') + '"] .actions-favorites').click();
            var that = this;
            if (bookmarked !== true) {
                bookmarked = true;
                that.model.set('bookmarked', true);
                that.ui.bookmarkIcon.addClass('selected').text(i18n.__('Remove from bookmarks'));
            } else {
                bookmarked = false;
                that.model.set('bookmarked', false);
                that.ui.bookmarkIcon.removeClass('selected').text(i18n.__('Add to bookmarks'));
            }
        },


        initialize: function () {
            _this = this;
            this.views = {};

            const providers = this.model.get('providers');
            healthButton = new Common.HealthButton('.health-icon', this.retrieveTorrentHealth.bind(this));
            this.model.set('showTorrentsMore', providers.torrent.feature('torrents'));
            this.icons = App.Providers.get('Icons');

            //Handle keyboard shortcuts when other views are appended or removed
            // init fields in model
            this.model.set('displayTitle', '');
            this.model.set('displaySynopsis', '');
            this.model.set('localizeEpisode', this.localizeEpisode);
            this.localizeTexts();

            //If a child was removed from above this view
            App.vent.on('viewstack:pop', function () {
                if (_.last(App.ViewStack) === _this.className) {
                    _this.initKeyboardShortcuts();
                }
            });

            //If a child was added above this view
            App.vent.on('viewstack:push', function () {
                if (_.last(App.ViewStack) !== _this.className && _.last(App.ViewStack) !== 'notificationWrapper') {
                    _this.unbindKeyboardShortcuts();
                }
            });
            App.vent.on('show:watched:' + this.model.id,
                _.bind(this.onWatched, this));
            App.vent.on('show:unwatched:' + this.model.id,
                _.bind(this.onUnWatched, this));

            App.vent.on('shortcuts:shows', function () {
                _this.initKeyboardShortcuts();
            });

            App.vent.on('update:torrents', _this.onUpdateTorrentsList.bind(_this));
            App.vent.on('audio:lang', this.switchAudio.bind(this));
            this.initTorrents(this.model.get('episodes'));
        },

        initTorrents: function (episodes) {
            for (let i = 0; i < episodes.length; i++) {
                if (!episodes[i].title) {
                    episodes[i].title = 'Untitled';
                }
                if (!episodes[i].overview) {
                    episodes[i].overview = 'No overview available.';
                }
                if (!episodes[i].first_aired) {
                    episodes[i].first_aired = 'Unknown';
                }
            }
            let torrents = {};
            _.each(episodes, function (value, currentEpisode) {
                if (!torrents[value.season]) {
                    torrents[value.season] = {};
                }
                torrents[value.season][value.episode] = value;
            });
            this.model.set('torrents', torrents);
            this.model.set('seasonCount', Object.keys(torrents).length);
        },

        initKeyboardShortcuts: function () {
            Mousetrap.bind('q', _this.toggleQuality);
            Mousetrap.bind('down', _this.nextEpisode);
            Mousetrap.bind('up', _this.previousEpisode);
            Mousetrap.bind('w', _this.toggleEpisodeWatched);
            Mousetrap.bind(['enter', 'space'], _this.playEpisode);
            Mousetrap.bind(['esc', 'backspace'], _this.closeDetails);
            Mousetrap.bind(['ctrl+up', 'command+up'], _this.previousSeason);
            Mousetrap.bind(['ctrl+down', 'command+down'], _this.nextSeason);
            Mousetrap.bind('f', function () {
                $('.sha-bookmark').click();
            });
        },

        unbindKeyboardShortcuts: function () {
            Mousetrap.unbind('q');
            Mousetrap.unbind('down');
            Mousetrap.unbind('up');
            Mousetrap.unbind('w');
            Mousetrap.unbind(['enter', 'space']);
            Mousetrap.unbind(['esc', 'backspace']);
            Mousetrap.unbind(['ctrl+up', 'command+up']);
            Mousetrap.unbind(['ctrl+down', 'command+down']);
            Mousetrap.unbind('f');
        },

        onUpdateTorrentsList: function(info) {
            if (!info) {
                this.getRegion('torrentList').empty();
                this.getRegion('torrentShowList').empty();
                return;
            }
            const showProvider = App.Config.getProviderForType('tvshow')[0];
            if (!info.episodeOnly) {
                this.getRegion('torrentShowList').empty();
                const torrentShowList = new App.View.TorrentList({
                    model: new Backbone.Model({
                        provider: showProvider,
                        promise: showProvider.torrents(this.model.get('imdb_id'), info.locale),
                        select: true,
                    }),
                });
                this.getRegion('torrentShowList').show(torrentShowList);
            }
            const episode = this.model.get('selectedEpisode');
            this.getRegion('torrentList').empty();
            const torrentList = new App.View.TorrentList({
                model: new Backbone.Model({
                    provider: showProvider,
                    promise: showProvider.episodeTorrents(this.model.get('imdb_id'), info.locale, episode.season, episode.episode),
                }),
            });
            this.getRegion('torrentList').show(torrentList);
        },

        onAttach: function () {
            win.info('Show series details (' + this.model.get('imdb_id') + ')');

            bookmarked = App.userBookmarks.indexOf(this.model.get('imdb_id')) !== -1;

            if (bookmarked) {
                this.ui.bookmarkIcon.addClass('selected').text(i18n.__('Remove from bookmarks'));
            } else {
                this.ui.bookmarkIcon.removeClass('selected');
            }
            this.model.set('showTorrents', false);

            this.loadAudioDropdown();
            this.getRegion('qualitySelector').empty();
            $('.star-container-tv,.shmi-year,.shmi-imdb,.shmi-tmdb-link,.magnet-icon,.source-icon').tooltip();
            var noimg = 'images/posterholder.png';
            var nobg = 'images/bg-header.jpg';
            var images = this.model.get('images');
            var backdrop = this.model.get('backdrop');
            var poster = this.model.get('poster');
            if (!poster && images && images.poster){
                poster = this.model.get('images').poster;
            }
            else {
                poster = this.model.get('poster') || noimg;
            }
            if (!backdrop) {
              backdrop = images.banner || nobg;
            }

            if (Settings.translatePosters) {
                var locale = this.model.get('locale');
                if (locale) {
                    poster = locale.poster ? locale.poster : poster;
                    backdrop = locale.backdrop ? locale.backdrop : backdrop;
                }
            }

            Common.loadImage(poster).then((img) => {
                $('.shp-img')
                    .css('background-image', 'url(' + (img || noimg) + ')')
                    .addClass('fadein');
            });
            Common.loadImage(backdrop).then((img) => {
                $('.shb-img')
                    .css('background-image', 'url(' + (img || nobg) + ')')
                    .addClass('fadein');
            });

            this.selectNextEpisode();

            _this.initKeyboardShortcuts();

            if (AdvSettings.get('ratingStars') === false) {
                $('.star-container-tv').addClass('hidden');
                $('.number-container-tv').removeClass('hidden');
            }

            if (this.model.get('seasonCount') < 2) {
                this.ui.seasonTab.hide();
            }

            this.isShowWatched();

            App.Device.Collection.setDevice(Settings.chosenPlayer);
            App.Device.ChooserView('#player-chooser').render();
            $('.spinner').hide();

            $('.playerchoicerefresh, .playerchoicehelp').tooltip({html: true, delay: {'show': 800,'hide': 100}});

            if ($('.loading .maximize-icon').is(':visible') || $('.player .maximize-icon').is(':visible')) {
                $('.sdo-watch, .sdow-watchnow, #download-torrent').addClass('disabled');
                $('#watch-now').prop('disabled', true);
            }
        },
        localizeTexts: function () {
            const locale = this.model.get('locale');
            let title = this.model.get('title');
            if (Settings.translateTitle === 'translated-origin' || Settings.translateTitle === 'translated') {
                if (locale && locale.title) {
                    title = locale.title;
                }
            }
            let synopsis = this.model.get('synopsis');
            if (Settings.translateSynopsis) {
                if (locale && locale.synopsis) {
                    synopsis = locale.synopsis;
                }
            }
            this.model.set('displayTitle', title);
            this.model.set('displaySynopsis', synopsis);
        },
        localizeEpisode: function (episode) {
            let title = episode.title;
            let listTitle = episode.title;
            let overview = episode.overview;
            if (Settings.translateEpisodes && episode.locale) {
                if (Settings.translateSynopsis && episode.locale.overview) {
                    overview = episode.locale.overview;
                }
                if (episode.locale.title) {
                    if (Settings.translateTitle === 'translated-origin') {
                        title = episode.locale.title;
                        listTitle = episode.locale.title + ' (' + episode.title + ')';
                    }
                    if (Settings.translateTitle === 'origin-translated') {
                        listTitle = episode.title + ' (' + episode.locale.title + ')';
                    }
                    if (Settings.translateTitle === 'translated') {
                        title = episode.locale.title;
                        listTitle = episode.locale.title;
                    }
                }
            }
            return {
                title,
                listTitle,
                overview,
            };
        },
        selectNextEpisode: function () {

            var episodesSeen = [];
            Database.getEpisodesWatched(this.model.get('tvdb_id'))
                .then(function (data) {
                    _.each(data, function (value, state) {
                        // we'll mark episode already watched
                        _this.markWatched(value, true);
                        // store all watched episode
                        if (value) {
                            episodesSeen.push(parseInt(value.season) * 100 +
                                parseInt(value.episode));
                        }
                    });
                    var season = 1;
                    var episode = 1;
                    if (episodesSeen.length > 0) {
                        //get all episode
                        var episodes = [];
                        _.each(_this.model.get('episodes'),
                            function (value, currentepisode) {
                                episodes.push(parseInt(value.season) * 100 +
                                    parseInt(value.episode));
                            }
                        );
                        episodesSeen.sort(function (a, b) {
                            return a - b;
                        });
                        episodes.sort(function (a, b) {
                            return a - b;
                        });
                        var first = episodes[0];
                        var last = episodes[episodes.length - 1];
                        var unseen = episodes.filter(function (item) {
                            return episodesSeen.indexOf(item) === -1;
                        });
                        if (AdvSettings.get('tv_detail_jump_to') !== 'firstUnwatched') {
                            var lastSeen = episodesSeen[episodesSeen.length - 1];

                            if (lastSeen !== episodes[episodes.length - 1]) {
                                var idx;
                                _.find(episodes, function (data, dataIdx) {
                                    if (data === lastSeen) {
                                        idx = dataIdx;
                                        return true;
                                    }
                                });

                                if (!idx) {
                                    // switch back to firstUnwatched method if idx not found
                                    unseen.push(first);
                                    episode = unseen[0] % 100;
                                    season = (unseen[0] - episode) / 100;
                                } else {
                                    var next_episode = episodes[idx + 1];
                                    episode = next_episode % 100;
                                    season = (next_episode - episode) / 100;
                                }
                            } else {
                                episode = lastSeen % 100;
                                season = (lastSeen - episode) / 100;
                            }
                        } else {
                            //if all episode seend back to first
                            //it will be the only one
                            unseen.push(first);
                            episode = unseen[0] % 100;
                            season = (unseen[0] - episode) / 100;
                        }


                    }
                    if (season === 1 && episode === 1) {
                        // Workaround in case S01E01 doesn't exist in PT
                        // Select the first possible season
                        _this.selectSeason($('.tab-season:first'));
                    } else {
                        _this.selectSeason($('li[data-tab="season-' + season + '"]'));
                        var $episode = $('#watched-' + season + '-' + episode).parent();
                        _this.selectEpisode($episode);
                        if (!_this.isElementVisible($episode[0])) {
                            $episode[0].scrollIntoView(false);
                        }
                    }
                });
        },

        openRelInfo: function (e) {
            Common.openOrClipboardLink(e, 'https://www.imdb.com/title/' + this.model.get('imdb_id') + '/releaseinfo', i18n.__('release info link'));
        },

        openIMDb: function (e) {
            Common.openOrClipboardLink(e, 'https://www.imdb.com/title/' + this.model.get('imdb_id'), i18n.__('IMDb page link'));
        },

        openMagnet: function (e) {
            var torrentUrl = $('.startStreaming').attr('data-torrent').replace(/\&amp;/g, '&');
            torrentUrl = torrentUrl.split('&tr=')[0] + _.union(decodeURIComponent(torrentUrl).replace(/\/announce/g, '').split('&tr=').slice(1), Settings.trackers.forced.toString().replace(/\/announce/g, '').split(',')).map(t => `&tr=${t}/announce`).join('');
            Common.openOrClipboardLink(e, torrentUrl, i18n.__('magnet link'));
        },

        openSource: function (e) {
            var torrentUrl = $('.startStreaming').attr('data-source');
            if (torrentUrl) {
                Common.openOrClipboardLink(e, torrentUrl, i18n.__('source link'));
            }
        },

        openTmdb: function(e) {
            let imdb = this.model.get('imdb_id'),
            tmdb = this.model.get('tmdb_id'),
            api_key = Settings.tmdb.api_key;

            if (!tmdb) {
                let show = (function () {
                    let tmp = null;
                    $.ajax({
                        url: 'http://api.themoviedb.org/3/find/' + imdb + '?api_key=' + api_key + '&external_source=imdb_id',
                        type: 'get',
                        dataType: 'json',
                        timeout: 5000,
                        async: false,
                        global: false,
                        success: function (data) {
                            tmp = data;
                        }
                    });
                    return tmp;
                }());
                show && show.tv_results && show.tv_results[0] && show.tv_results[0].id ? this.model.set('tmdb_id', show.tv_results[0].id) : null;
                tmdb = this.model.get('tmdb_id');
            }

            if (tmdb) {
                let tmdbLink = 'https://www.themoviedb.org/tv/' + tmdb + '/edit?language=' + Settings.language;
                Common.openOrClipboardLink(e, tmdbLink, i18n.__('submit metadata & translations link'));
            } else {
                $('.shmi-tmdb-link').addClass('disabled').prop('disabled', true).attr('title', i18n.__('Not available')).tooltip('hide').tooltip('fixTitle');
            }
        },

        switchRating: function () {
            $('.number-container-tv').toggleClass('hidden');
            $('.star-container-tv').toggleClass('hidden');
            AdvSettings.set('ratingStars', $('.number-container-tv').hasClass('hidden'));
        },

        switchAudio: async function(lang) {
            if (lang === this.model.get('contextLocale')) {
                return;
            }
            $('.spinner').show();
            const showProvider = App.Config.getProviderForType('tvshow')[0];
            const data = await showProvider.contentOnLang(this.model.get('imdb_id'), lang);
            this.model.set('contextLocale', data.contextLocale);
            this.model.set('episodes', data.episodes);
            this.initTorrents(data.episodes);
            this.render();
            this.onAttach();
            App.vent.trigger('update:torrents', this.model.get('showTorrents') ? {
                locale: this.model.get('contextLocale'),
            } : null);
        },

        loadDropdown: function(type, attrs) {
            this.views[type] && this.views[type].destroy();
            this.views[type] = new App.View.LangDropdown({
                model: new App.Model.Lang(Object.assign({ type: type }, attrs))
            });
            var types = type + 'Dropdown';
            this.getRegion(types).show(this.views[type]);
        },

        loadAudioDropdown: function() {
            return this.loadDropdown('audio', {
                title: i18n.__('Audio Language'),
                selected: this.model.get('contextLocale'),
                values: _.object(_.map(this.model.get('exist_translations'), (item) => [item, 'data'])),
            });
        },

        // TODO: for subtitles
        // loadSubDropdown: function() {
        //     return this.loadDropdown('sub', {
        //         title: i18n.__('Subtitle'),
        //         selected: this.model.get('defaultSubtitle'),
        //         hasNull: true,
        //         values: this.model.get('subtitle')
        //     });
        // },

        toggleWatched: function (e) {
            var edata = e.currentTarget.id.split('-');
            setTimeout(function () {
                var value = {
                    tvdb_id: _this.model.get('tvdb_id'),
                    imdb_id: _this.model.get('imdb_id'),
                    episode_id: $('#watch-now').attr('data-episodeid'),
                    season: edata[1],
                    episode: edata[2],
                    from_browser: true
                };
                Database.checkEpisodeWatched(value)
                    .then(function (watched) {
                        if (watched) {
                            App.vent.trigger('show:unwatched', value, 'seen');
                            _this.markWatched(value, false);
                        } else {
                            App.vent.trigger('show:watched', value, 'seen');
                            _this.markWatched(value, true);
                        }
                    });
            }, 100);
        },

        isShowWatched: function () {
            var tvdb_id = _this.model.get('tvdb_id');
            var imdb_id = _this.model.get('imdb_id');

            var episodes = this.model.get('episodes');
            episodes.forEach(function (episode, index, array) {
                var value = {
                    tvdb_id: tvdb_id,
                    imdb_id: imdb_id,
                    season: episode.season,
                    episode: episode.episode,
                    from_browser: true
                };
                Database.checkEpisodeWatched(value)
                    .then(function (watched) {
                        if (!watched) {
                            $('.sha-watched').show();
                        }
                    });
            });
        },

        markShowAsWatched: function () {
            $('.sha-watched').addClass('selected');

            var tvdb_id = _this.model.get('tvdb_id');
            var imdb_id = _this.model.get('imdb_id');

            var episodes = _this.model.get('episodes');
            episodes.forEach(function (episode, index, array) {
                var value = {
                    tvdb_id: tvdb_id,
                    imdb_id: imdb_id,
                    episode_id: episode.tvdb_id,
                    season: episode.season,
                    episode: episode.episode,
                    from_browser: true
                };
                Database.checkEpisodeWatched(value)
                    .then(function (watched) {
                        if (!watched) {
                            App.vent.trigger('show:watched', value, 'seen');
                            $('.sha-watched').hide();
                        }
                    });
            });
        },

        onWatched: function (value, channel) {
            this.markWatched(value, true);
            this.nextEpisode();
        },

        onUnWatched: function (value, channel) {
            this.markWatched(value, false);
        },

        markWatched: function (value, state) {
            state = (state === undefined) ? true : state;
            // we should never get any shows that aren't us, but you know, just in case.
            if (value.tvdb_id === _this.model.get('tvdb_id')) {
                $('#watched-' + value.season + '-' + value.episode).toggleClass('true', state);
            }
        },

        startStreaming: function (e, state) {
            if (e.type) {
                e.preventDefault();
            }
            var that = this;
            var title = that.model.get('title');
            var file_name = $(e.currentTarget).attr('data-file');
            var episode = $(e.currentTarget).attr('data-episode');
            var season = $(e.currentTarget).attr('data-season');
            var name = $(e.currentTarget).attr('data-title');
            var episode_id = $(e.currentTarget).attr('data-episodeid');
            var imdbid = that.model.get('imdb_id').indexOf('mal') === -1 ? that.model.get('imdb_id') : null; //fix for anime

            title += ' - ' + i18n.__('Season %s', season) + ', ' + i18n.__('Episode %s', episode) + ' - ' + name;
            var epInfo = {
                type: 'show',
                imdbid: imdbid,
                tvdbid: that.model.get('tvdb_id'),
                episode_id: episode_id,
                season: season,
                episode: episode
            };

            var episodes = [];
            var episodes_data = [];
            //var selected_quality = $(e.currentTarget).attr('data-quality');
            var auto_play = false;
            var images = this.model.get('images');
            if (state !== 'downloadOnly' && AdvSettings.get('playNextEpisodeAuto') && this.model.get('imdb_id').indexOf('mal') === -1) {
                _.each(this.model.get('episodes'), function (value) {
                    var epaInfo = {
                        id: parseInt(value.season) * 100 + parseInt(value.episode),
                        defaultSubtitle: Settings.subtitle_language,
                        episode: value.episode,
                        season: value.season,
                        title: that.model.get('title') + ' - ' + i18n.__('Season %s', value.season) + ', ' + i18n.__('Episode %s', value.episode) + ' - ' + value.title,
                        torrents: value.torrents,
                        extract_subtitle: {
                            type: 'show',
                            imdbid: that.model.get('imdb_id'),
                            tvdbid: (value.tvdb_id || '').toString(),
                            season: value.season,
                            episode: value.episode
                        },
                        episode_id: value.tvdb_id,
                        tvdb_id: that.model.get('tvdb_id'),
                        imdb_id: that.model.get('imdb_id'),
                        device: App.Device.Collection.selected,
                        poster: that.model.get('poster'),
                        backdrop: that.model.get('backdrop') || images.banner,
                        status: that.model.get('status'),
                        type: 'episode'
                    };
                    episodes_data.push(epaInfo);
                    episodes.push(parseInt(value.season) * 100 + parseInt(value.episode));
                });
                episodes.sort(function (a, b) {
                    return a - b;
                });
                episodes_data = _.sortBy(episodes_data, 'id');

                if (parseInt(season) * 100 + parseInt(episode) !== episodes[episodes.length - 1]) {
                    auto_play = true;
                }

            } else {
                episodes_data = null;
            }
            var torrentStart = new Backbone.Model({
                torrent: $(e.currentTarget).attr('data-torrent'),
                poster: that.model.get('poster'),
                backdrop: that.model.get('backdrop') || images.banner,
                type: 'episode',
                tvdb_id: that.model.get('tvdb_id'),
                imdb_id: that.model.get('imdb_id'),
                episode_id: episode_id,
                episode: episode,
                season: season,
                title: title,
                status: that.model.get('status'),
                extract_subtitle: epInfo,
                quality: $(e.currentTarget).attr('data-quality'),
                defaultSubtitle: Settings.subtitle_language,
                device: App.Device.Collection.selected,
                episodes: episodes,
                file_name: file_name,
                auto_play: auto_play,
                auto_id: parseInt(season) * 100 + parseInt(episode),
                auto_play_data: episodes_data
            });
            _this.unbindKeyboardShortcuts();
            App.vent.trigger('stream:start', torrentStart, state);
        },

        downloadTorrent: function(e) {
            this.startStreaming(e, 'downloadOnly');
            if (Settings.showSeedboxOnDlInit) {
                App.previousview = App.currentview;
                App.currentview = 'Seedbox';
                App.vent.trigger('seedbox:show');
                $('.filter-bar').find('.active').removeClass('active');
                $('#filterbar-seedbox').addClass('active');
                $('#nav-filters, .right .search').hide();
            } else {
                $('.notification_alert').stop().text(i18n.__('Download added')).fadeIn('fast').delay(1500).fadeOut('fast');
            }
        },

        closeDetails: function (e) {
            App.vent.trigger('show:closeDetail');
        },

        clickSeason: function (e) {
            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }
            this.selectSeason($(e.currentTarget));
        },

        clickEpisode: function (e) {
            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }
            this.selectEpisode($(e.currentTarget));
        },

        dblclickEpisode: function (e) {
            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }
            this.selectEpisode($(e.currentTarget));
            $('.startStreaming').trigger('click');
        },
        // Helper Function
        selectSeason: function ($elem) {
            $('.tab-season.active').removeClass('active');
            $elem.addClass('active');
            $('.tab-episodes').hide();
            $('.tab-episodes.current').removeClass('current');
            $('.tab-episode.active').removeClass('active');
            $('.tab-episodes.' + $elem.attr('data-tab')).addClass('current').scrollTop(0).show(); //pull the scroll always to top to
            this.selectEpisode($('.tab-episodes.' + $elem.attr('data-tab') + ' li:first'));
        },

        selectEpisode: function ($elem) {
            if ($elem.length === 0) {
                return;
            }
            var tvdbid = $elem.attr('data-id');
            var season = $elem.attr('data-season');
            var episode = $elem.attr('data-episode');
            var episodesTorrents = _this.model.get('torrents');
            var selectedEpisode = episodesTorrents[season][episode];
            _this.model.set('selectedEpisode', selectedEpisode);
            var qualitySelector = new App.View.QualitySelector({
                model: new Backbone.Model({
                    torrents: selectedEpisode.torrents,
                    selectCallback: _this.selectTorrent,
                    required: ['480p', '720p', '1080p'],
                    defaultQualityKey: 'shows_default_quality',
                }),
            });
            _this.getRegion('qualitySelector').show(qualitySelector);

            var first_aired = selectedEpisode.first_aired ? dayjs.unix(selectedEpisode.first_aired).locale(Settings.language).format('LLLL') : '';
            var synopsis = $('.sdoi-synopsis');
            var startStreaming = $('.startStreaming');
            var localize = this.localizeEpisode(selectedEpisode);

            $('.tab-episode.active').removeClass('active');
            $elem.addClass('active');
            $('.sdoi-number').text(i18n.__('Season %s', selectedEpisode.season) + ', ' + i18n.__('Episode %s', selectedEpisode.episode));
            $('.sdoi-title').text(localize.title);
            $('.sdoi-date').text(i18n.__('Aired Date') + ': ' + first_aired);
            synopsis.text(localize.overview);

            //pull the scroll always to top
            synopsis.scrollTop(0);

            startStreaming.attr('data-episodeid', tvdbid);

            // set var for player
            startStreaming.attr('data-episode', selectedEpisode.episode);
            startStreaming.attr('data-season', selectedEpisode.season);
            startStreaming.attr('data-title', selectedEpisode.title);

            _this.ui.startStreaming.show();

            App.vent.trigger('update:torrents', this.model.get('showTorrents') ? {
                locale: this.model.get('contextLocale'),
                episodeOnly: true,
            } : null);
        },

        selectTorrent: function(torrent, key) {
            var startStreaming = $('.startStreaming');
            var downloadButton = $('#download-torrent');
            startStreaming.attr('data-file', torrent.file || '');
            startStreaming.attr('data-torrent', torrent.url);
            startStreaming.attr('data-source', torrent.source);
            startStreaming.attr('data-provider', torrent.provider);
            startStreaming.attr('data-quality', key);
            downloadButton.attr('data-torrent', torrent.url);
            downloadButton.attr('data-file', torrent.file || '');

            _this.resetTorrentHealth();
            _this.toggleSourceLink();
        },

        toggleQuality: function (e) {
            _this.getRegion('qualitySelector').currentView.selectNext();
        },

        nextEpisode: function (e) {
            var tabEpisode = $('.tab-episode:visible');
            var index = $('.tab-episode.active').index();
            if (index === tabEpisode.length - 1) {
                return;
            }
            var $nextEpisode = tabEpisode.eq(++index);
            _this.selectEpisode($nextEpisode);
            if (!_this.isElementVisible($nextEpisode[0])) {
                $nextEpisode[0].scrollIntoView(false);
            }

            if (e && e.type) {
                e.preventDefault();
                e.stopPropagation();
            }

        },

        previousEpisode: function (e) {
            var index = $('.tab-episode.active').index();
            if (index === 0) {
                return;
            }
            var $prevEpisode = $('.tab-episode:visible').eq(--index);
            _this.selectEpisode($prevEpisode);
            if (!_this.isElementVisible($prevEpisode[0])) {
                $prevEpisode[0].scrollIntoView(true);
            }

            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }

        },

        nextSeason: function (e) {
            var tabSeason = $('.tab-season');
            var index = $('.tab-season.active').index();
            if (index === tabSeason.length - 1) {
                return;
            }
            var $nextSeason = tabSeason.eq(++index);
            _this.selectSeason($nextSeason);
            if (!_this.isElementVisible($nextSeason[0])) {
                $nextSeason[0].scrollIntoView(false);
            }

            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }
        },

        previousSeason: function (e) {
            var index = $('.tab-season.active').index();
            if (index === 0) {
                return;
            }
            var $prevSeason = $('.tab-season').eq(--index);
            _this.selectSeason($prevSeason);
            if (!_this.isElementVisible($prevSeason[0])) {
                $prevSeason[0].scrollIntoView(true);
            }

            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }

        },

        playEpisode: function (e) {
            $('.startStreaming').trigger('click');

            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }
        },

        toggleEpisodeWatched: function (e) {
            var data = {};
            data.currentTarget = $('.tab-episode.active .watched')[0];
            _this.toggleWatched(data);
        },


        isElementVisible: function (el) {
            var eap,
                rect = el.getBoundingClientRect(),
                docEl = document.documentElement,
                vWidth = window.innerWidth || docEl.clientWidth,
                vHeight = window.innerHeight || docEl.clientHeight,
                efp = function (x, y) {
                    return document.elementFromPoint(x, y);
                },
                contains = 'contains' in el ? 'contains' : 'compareDocumentPosition',
                has = contains === 'contains' ? 1 : 0x14;

            // Return false if it's not in the viewport
            if (rect.right < 0 || rect.bottom < 0 || rect.left > vWidth || rect.top > vHeight) {
                return false;
            }

            // Return true if any of its four corners are visible
            return (
                (eap = efp(rect.left, rect.top)) === el || el[contains](eap) === has || (eap = efp(rect.right, rect.top)) === el || el[contains](eap) === has || (eap = efp(rect.right, rect.bottom)) === el || el[contains](eap) === has || (eap = efp(rect.left, rect.bottom)) === el || el[contains](eap) === has
            );
        },

        clickPoster: function(e) {
            e.stopPropagation();
            if (e.button === 0) {
                $('.sh-poster').hasClass('active') ? this.exitZoom() : this.posterZoom();
            } else if (e.button === 2) {
                var clipboard = nw.Clipboard.get();
                clipboard.set($('.shp-img')[0].style.backgroundImage.slice(4, -1).replace(/"/g, ''), 'text');
                $('.notification_alert').text(i18n.__('The image url was copied to the clipboard')).fadeIn('fast').delay(2500).fadeOut('fast');
            }
        },

        posterZoom: function() {
            var zoom = $('.show-detail-container').height() / $('.shp-img').height() * (0.75 + Settings.bigPicture / 2000);
            var top = parseInt(($('.shp-img').height() * zoom - $('.shp-img').height()) / 2 + (3000 / Settings.bigPicture)) + 'px';
            var left = parseInt(($('.shp-img').width() * zoom - $('.shp-img').width()) / 2 + (2000 / Settings.bigPicture)) + 'px';
            $('.sh-poster, .show-details, .sh-metadata, .sh-actions').addClass('active');
            $('.sh-poster.active').css({transform: 'scale(' + zoom + ')', top: top, left: left});
        },

        exitZoom: function() {
            $('.sh-poster').hasClass('active') ? $('.sh-poster, .show-details, .sh-metadata, .sh-actions').removeClass('active').removeAttr('style') : null;
        },

        copytoclip: (e) => Common.openOrClipboardLink(e, $(e.target)[0].textContent, ($(e.target)[0].className ? i18n.__($(e.target)[0].className.replace('shm-', '').replace('sdoi-', 'episode ')) : i18n.__('episode title')), true),

        retrieveTorrentHealth: function(cb) {
            const torrentURL = $('.startStreaming').attr('data-torrent');
            return Common.retrieveTorrentHealth(torrentURL, cb);
        },

        resetTorrentHealth: function () {
            healthButton.reset();
            healthButton.render();
        },

        refreshTorrentHealth: function () {
            healthButton.reset();
            healthButton.render();
        },

        toggleSourceLink: function () {
            const sourceURL = $('.startStreaming').attr('data-source');
            const provider = $('.startStreaming').attr('data-provider');
            let providerIcon;
            const showProvider = App.Config.getProviderForType('tvshow')[0];
            this.icons.getLink(showProvider, provider)
                .then((icon) => providerIcon = icon || '/src/app/images/icons/' + provider + '.png')
                .catch((error) => { !providerIcon ? providerIcon = '/src/app/images/icons/' + provider + '.png' : null; })
                .then(() => $('.source-icon').html(`<img src="${providerIcon}" onerror="this.onerror=null; this.style.display='none'; this.parentElement.style.top='0'; this.parentElement.classList.add('fas', 'fa-link')" onload="this.onerror=null; this.onload=null;">`));
            if (sourceURL) {
                $('.source-icon').attr('data-original-title', sourceURL.split('//').pop().split('/')[0]).css('cursor', 'pointer');
            } else {
                $('.source-icon').attr('data-original-title', provider.toLowerCase()).css('cursor', 'default');
            }
        },

        selectPlayer: function (e) {
            var player = $(e.currentTarget).parent('li').attr('id').replace('player-', '');
            _this.model.set('device', player);
            if (!player.match(/[0-9]+.[0-9]+.[0-9]+.[0-9]/ig)) {
                AdvSettings.set('chosenPlayer', player);
            }
        },

        showPlayerList: function(e) {
            App.vent.trigger('notification:show', new App.Model.Notification({
                title: '',
                body: i18n.__('Popcorn Time currently supports') + '<div class="splayerlist">' + extPlayerlst + '.</div><br>' + i18n.__('There is also support for Chromecast, AirPlay & DLNA devices.'),
                type: 'success'
            }));
        },

        refreshPlayerList: function (e) {
            e.stopPropagation();
            $('.show-details .playerchoicerefresh').addClass('fa-spin fa-spinner spin').tooltip('hide');
            Promise.all(App.Device.loadDeviceSupport()).then(function(data) {
                App.Device.rescan();
            }).then(function() {
                setTimeout(() => {
                    App.Device.ChooserView('#player-chooser').render();
                    $('.playerchoicerefresh, .playerchoicehelp').tooltip({html: true, delay: {'show': 800,'hide': 100}});
                    $('.show-details .playerchoice').click();
                }, 3000);
            });
        },

        showAllTorrents: function() {
            const show = !this.model.get('showTorrents');
            this.model.set('showTorrents', show);
            if (show) {
                this.ui.showTorrents.addClass('active fas fa-spinner fa-spin').html('');
            } else {
                this.ui.showTorrents.removeClass('active fa-spinner fa-spin').html(i18n.__('more...'));
            }
            App.vent.trigger('update:torrents', show ? {
                locale: this.model.get('contextLocale'),
            } : null);
        },

        onBeforeDestroy: function () {
            this.unbindKeyboardShortcuts();
            App.vent.off('update:torrents');
            App.vent.off('audio:lang');
            App.vent.off('show:watched:' + this.model.id);
            App.vent.off('show:unwatched:' + this.model.id);
        }

    });

    App.View.ShowDetail = ShowDetail;
})(window.App);
