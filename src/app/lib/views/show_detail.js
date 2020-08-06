(function (App) {
    'use strict';

    var torrentHealth = require('webtorrent-health');
    var cancelTorrentHealth = function () {};
    var torrentHealthRestarted = null;
    let healthButton;

    var _this, bookmarked;
    var ShowDetail = Marionette.View.extend({
        template: '#show-detail-tpl',
        className: 'shows-container-contain',

        ui: {
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
            'click .close-icon': 'closeDetails',
            'click .tab-season': 'clickSeason',
            'click .tab-episode': 'clickEpisode',
            'click .shmi-imdb': 'openIMDb',
            'mousedown .magnet-icon': 'openMagnet',
            'dblclick .tab-episode': 'dblclickEpisode',
            'click .playerchoicemenu li a': 'selectPlayer',
            'click .shmi-rating': 'switchRating',
            'click .health-icon': 'resetTorrentHealth'
        },

        regions: {
            qualitySelector: '#quality-selector',
        },

        toggleFavorite: function (e) {
            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }
            var that = this;
            if (bookmarked !== true) {
                bookmarked = true;
                that.model.set('bookmarked', true);
                that.ui.bookmarkIcon.addClass('selected').text(i18n.__('Remove from bookmarks'));
            } else {
                bookmarked = false;
                that.ui.bookmarkIcon.removeClass('selected').text(i18n.__('Add to bookmarks'));
                that.model.set('bookmarked', false);
            }
            $('li[data-imdb-id="' + this.model.get('imdb_id') + '"] .actions-favorites').click();
        },


        initialize: function () {
            _this = this;
            this.renameUntitled();

            healthButton = new Common.HealthButton('.health-icon', this.retrieveTorrentHealth.bind(this));

            //Handle keyboard shortcuts when other views are appended or removed

            //If a child was removed from above this view
            App.vent.on('viewstack:pop', function () {
                if (_.last(App.ViewStack) === _this.className) {
                    _this.initKeyboardShortcuts();
                }
            });

            //If a child was added above this view
            App.vent.on('viewstack:push', function () {
                if (_.last(App.ViewStack) !== _this.className) {
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

            var torrents = {};
            _.each(this.model.get('episodes'), function (value, currentEpisode) {
                if (!torrents[value.season]) {
                    torrents[value.season] = {};
                }
                torrents[value.season][value.episode] = value;
            });
            this.model.set('torrents', torrents);
            this.model.set('seasonCount', Object.keys(torrents).length);
        },
        renameUntitled: function () {
            var episodes = this.model.get('episodes');
            for (var i = 0; i < episodes.length; i++) {
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

        unbindKeyboardShortcuts: Mousetrap.reset,

        onAttach: function () {
            bookmarked = App.userBookmarks.indexOf(this.model.get('imdb_id')) !== -1;

            if (bookmarked) {
                this.ui.bookmarkIcon.addClass('selected').text(i18n.__('Remove from bookmarks'));
            } else {
                this.ui.bookmarkIcon.removeClass('selected');
            }

            this.getRegion('qualitySelector').empty();
            $('.star-container-tv,.shmi-imdb,.magnet-icon').tooltip();
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
            var posterCache = new Image();
            posterCache.src = poster;
            posterCache.onload = function () {
                try {
                    $('.shp-img')
                        .css('background-image', 'url(' + poster + ')')
                        .addClass('fadein');
                } catch (e) {}
                posterCache = null;
            };
            posterCache.onerror = function () {
                try {
                    $('.shp-img')
                        .css('background-image', 'url("images/posterholder.png")')
                        .addClass('fadein');
                } catch (e) {}
                posterCache = null;
            };


            var bgCache = new Image();
            bgCache.src = backdrop;
            bgCache.onload = function () {
                try {
                    $('.shb-img')
                        .css('background-image', 'url(' + backdrop + ')')
                        .addClass('fadein');
                } catch (e) {}
                bgCache = null;
            };
            bgCache.onerror = function () {
                try {
                    $('.shb-img')
                        .css('background-image', 'url("images/bg-header.jpg")')
                        .addClass('fadein');
                } catch (e) {}
                bgCache = null;
            };

            this.selectNextEpisode();

            _this.initKeyboardShortcuts();

            if (AdvSettings.get('ratingStars') === false) {
                $('.star-container-tv').addClass('hidden');
                $('.number-container-tv').removeClass('hidden');
            }

            if (AdvSettings.get('hideSeasons') && this.model.get('seasonCount') < 2) {
                this.ui.seasonTab.hide();
            }

            this.isShowWatched();

            App.Device.Collection.setDevice(Settings.chosenPlayer);
            App.Device.ChooserView('#player-chooser').render();
            $('.spinner').hide();
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

        openIMDb: function () {
            nw.Shell.openExternal('https://www.imdb.com/title/' + this.model.get('imdb_id'));
        },

        openMagnet: function (e) {
            var torrentUrl = $('.startStreaming').attr('data-torrent').replace(/\&amp;/g, '&');
            if (e.button === 2) { //if right click on magnet link
                var clipboard = nw.Clipboard.get();
                clipboard.set(torrentUrl, 'text'); //copy link to clipboard
                $('.notification_alert').text(i18n.__('The magnet link was copied to the clipboard')).fadeIn('fast').delay(2500).fadeOut('fast');
            } else {
                nw.Shell.openExternal(torrentUrl);
            }
        },

        switchRating: function () {
            $('.number-container-tv').toggleClass('hidden');
            $('.star-container-tv').toggleClass('hidden');
            AdvSettings.set('ratingStars', $('.number-container-tv').hasClass('hidden'));
        },

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

            this.selectNextEpisode();
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

        startStreaming: function (e) {
            if (e.type) {
                e.preventDefault();
            }
            var that = this;
            var title = that.model.get('title');
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
            if (AdvSettings.get('playNextEpisodeAuto') && this.model.get('imdb_id').indexOf('mal') === -1) {
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
                auto_play: auto_play,
                auto_id: parseInt(season) * 100 + parseInt(episode),
                auto_play_data: episodes_data
            });
            console.log('Playing next episode automatically:', AdvSettings.get('playNextEpisodeAuto'));
            _this.unbindKeyboardShortcuts();
            App.vent.trigger('stream:start', torrentStart);
        },

        downloadTorrent: function(e) {
          const torrent = $(e.currentTarget).attr('data-torrent');
          App.vent.trigger('stream:download', torrent, this.model.get('title') /*mediaName*/);
          App.previousview = App.currentview;
          App.currentview = 'Seedbox';
          App.vent.trigger('seedbox:show');
          $('.filter-bar').find('.active').removeClass('active');
          $('#filterbar-seedbox').addClass('active');
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

            var first_aired = selectedEpisode.first_aired ? moment.unix(selectedEpisode.first_aired).locale(Settings.language).format('LLLL') : '';
            var synopsis = $('.sdoi-synopsis');
            var startStreaming = $('.startStreaming');

            $('.tab-episode.active').removeClass('active');
            $elem.addClass('active');
            $('.sdoi-number').text(i18n.__('Season %s', selectedEpisode.season) + ', ' + i18n.__('Episode %s', selectedEpisode.episode));
            $('.sdoi-title').text(selectedEpisode.title);
            $('.sdoi-date').text(i18n.__('Aired Date') + ': ' + first_aired);
            synopsis.text(selectedEpisode.overview);

            //pull the scroll always to top
            synopsis.scrollTop(0);

            startStreaming.attr('data-episodeid', tvdbid);

            // set var for player
            startStreaming.attr('data-episode', selectedEpisode.episode);
            startStreaming.attr('data-season', selectedEpisode.season);
            startStreaming.attr('data-title', selectedEpisode.title);

            _this.ui.startStreaming.show();
        },

        selectTorrent: function(torrent, key) {
            var startStreaming = $('.startStreaming');
            startStreaming.attr('data-torrent', torrent.url);
            startStreaming.attr('data-quality', key);
            $('#download-torrent').attr('data-torrent', torrent.url);

            _this.resetTorrentHealth();
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

            if (e.type) {
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

        retrieveTorrentHealth: function(cb) {
            const torrentURL = $('.startStreaming').attr('data-torrent');
            return Common.retrieveTorrentHealth(torrentURL, cb);
        },

        resetTorrentHealth: function () {
            healthButton.reset();
            healthButton.render();
        },

        selectPlayer: function (e) {
            var player = $(e.currentTarget).parent('li').attr('id').replace('player-', '');
            _this.model.set('device', player);
            if (!player.match(/[0-9]+.[0-9]+.[0-9]+.[0-9]/ig)) {
                AdvSettings.set('chosenPlayer', player);
            }
        },

        onBeforeDestroy: function () {
            this.unbindKeyboardShortcuts();
            App.vent.off('show:watched:' + this.model.id);
            App.vent.off('show:unwatched:' + this.model.id);
        }

    });

    App.View.ShowDetail = ShowDetail;
})(window.App);
