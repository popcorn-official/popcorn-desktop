var torrentHealth = require('torrent-health');
var health_checked = false;

(function(App) {
    'use strict';

    var resizeImage = App.Providers.Trakttv.resizeImage;

    var _this, bookmarked;
    var ShowDetail = Backbone.Marionette.ItemView.extend({
        template: '#show-detail-tpl',
        className: 'shows-container-contain',

        ui: {
            startStreaming: '#watch-now',
            qselector: '.quality-selector',
            qinfo: '.quality-info',
            bookmarkIcon: '.favourites-toggle'
        },

        events: {
            'click .favourites-toggle': 'toggleFavorite',
            'click .watched': 'toggleWatched',
            'click #watch-now': 'startStreaming',
            'click .close-icon': 'closeDetails',
            'click .tab-season': 'clickSeason',
            'click .tab-episode': 'clickEpisode',
            'click .show-imdb-link': 'openIMDb',
            'dblclick .tab-episode': 'dblclickEpisode',
            'click #switch-hd-on': 'enableHD',
            'click #switch-hd-off': 'disableHD',
            'click .health-icon': 'getTorrentHealth',
            'click .playerchoicemenu li a': 'selectPlayer',
            'click .rating-container-tv': 'switchRating'
        },

        toggleFavorite: function(e) {

            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }
            var that = this;

            if (bookmarked !== true) {
                bookmarked = true;

                var provider = this.model.get('provider'); //XXX(xaiki): provider hack
                var tvshow = App.Config.getProvider('tvshow')[provider];
                var data = tvshow.detail(this.model.get('imdb_id'), function(err, data) {
                    if (!err) {
                        data.provider = that.model.get('provider');
                        Database.addTVShow(data, function(err, idata) {
                            Database.addBookmark(that.model.get('imdb_id'), 'tvshow', function(err, data) {
                                win.info('Bookmark added (' + that.model.get('imdb_id') + ')');
                                that.model.set('bookmarked', true);
                                that.ui.bookmarkIcon.addClass('selected').text(i18n.__('Remove from bookmarks'));
                                App.userBookmarks.push(that.model.get('imdb_id'));
                            });
                        });

                    } else {
                        alert('Somethings wrong... try later');
                    }
                });

            } else {
                that.ui.bookmarkIcon.removeClass('selected').text(i18n.__('Add to bookmarks'));
                bookmarked = false;

                Database.deleteBookmark(this.model.get('imdb_id'), function(err, data) {
                    win.info('Bookmark deleted (' + that.model.get('imdb_id') + ')');
                    that.model.set('bookmarked', false);
                    App.userBookmarks.splice(App.userBookmarks.indexOf(that.model.get('imdb_id')), 1);

                    // we'll make sure we dont have a cached show
                    Database.deleteTVShow(that.model.get('imdb_id'), function(err, data) {});
                });



            }
        },


        initialize: function() {
            _this = this;

            //Handle keyboard shortcuts when other views are appended or removed

            //If a child was removed from above this view
            App.vent.on('viewstack:pop', function() {
                if (_.last(App.ViewStack) === _this.className) {
                    _this.initKeyboardShortcuts();
                }
            });

            //If a child was added above this view
            App.vent.on('viewstack:push', function() {
                if (_.last(App.ViewStack) !== _this.className) {
                    _this.unbindKeyboardShortcuts();
                }
            });
            App.vent.on('shows:watched', this.markWatched);

            var images = this.model.get('images');
            images.fanart = resizeImage(images.fanart, '940');
            //if ((ScreenResolution.SD || ScreenResolution.HD) && !ScreenResolution.Retina) {
            // Screen Resolution of 720p or less is fine to have 300x450px image
            images.poster = resizeImage(images.poster, '300');
            //}

            App.vent.on('shortcuts:show', function() {
                _this.initKeyboardShortcuts();
            });
        },

        initKeyboardShortcuts: function() {
            Mousetrap.bind(['esc', 'backspace'], _this.closeDetails);

            Mousetrap.bind('up', _this.previousEpisode);

            Mousetrap.bind('down', _this.nextEpisode);

            Mousetrap.bind(['ctrl+up', 'command+up'], _this.previousSeason);

            Mousetrap.bind(['ctrl+down', 'command+down'], _this.nextSeason);

            Mousetrap.bind(['enter', 'space'], _this.playEpisode);

            Mousetrap.bind('q', _this.toggleQuality);

            Mousetrap.bind('w', _this.toggleEpisodeWatched);
        },

        unbindKeyboardShortcuts: function() { // There should be a better way to do this
            Mousetrap.unbind(['esc', 'backspace']);

            Mousetrap.unbind('up');

            Mousetrap.unbind('down');

            Mousetrap.unbind(['ctrl+up', 'command+up']);

            Mousetrap.unbind(['ctrl+down', 'command+down']);

            Mousetrap.unbind(['enter', 'space']);

            Mousetrap.unbind('q');

            Mousetrap.unbind('w');
        },

        onShow: function() {
            App.Device.ChooserView('#player-chooser').render();
            bookmarked = App.userBookmarks.indexOf(this.model.get('imdb_id')) !== -1;

            if (bookmarked) {
                this.ui.bookmarkIcon.addClass('selected').text(i18n.__('Remove from bookmarks'));
            } else {
                this.ui.bookmarkIcon.removeClass('selected');
            }

            this.selectSeason($('.tab-season:first'));
            $('.star-container-tv,.show-imdb-link').tooltip();

            var cbackground = $('.tv-cover').attr('data-bgr');
            var coverCache = new Image();
            coverCache.src = cbackground;
            coverCache.onload = function() {
                $('.tv-cover')
                    .css('background-image', 'url(' + cbackground + ')')
                    .addClass('fadein');
                coverCache = null;
            };

            var background = $('.tv-poster-background').attr('data-bgr');
            var bgCache = new Image();
            bgCache.src = background;
            bgCache.onload = function() {
                $('.tv-poster-background')
                    .css('background-image', 'url(' + background + ')')
                    .addClass('fadein');
                bgCache = null;
            };


            // we'll mark episode already watched
            Database.getEpisodesWatched(this.model.get('tvdb_id'), function(err, data) {
                _.each(data, _this.markWatched);
            });

            _this.initKeyboardShortcuts();

            if (AdvSettings.get('ratingStars') === false) {
                $('.star-container-tv').addClass('hidden');
                $('.number-container-tv').removeClass('hidden');
            }

        },

        openIMDb: function() {
            gui.Shell.openExternal('http://www.imdb.com/title/' + this.model.get('imdb_id'));
        },

        switchRating: function() {
            if ($('.number-container-tv').hasClass('hidden')) {
                $('.number-container-tv').removeClass('hidden');
                $('.star-container-tv').addClass('hidden');
                AdvSettings.set('ratingStars', false);
            } else {
                $('.number-container-tv').addClass('hidden');
                $('.star-container-tv').removeClass('hidden');
                AdvSettings.set('ratingStars', true);
            }
        },

        toggleWatched: function(e) {
            var edata = e.currentTarget.id.split('-');
            var value = {
                show_id: _this.model.get('tvdb_id'),
                season: edata[1],
                episode: edata[2],
                from_browser: true
            };

            Database.checkEpisodeWatched(value, function(watched, data) {
                if (watched) {
                    App.vent.trigger('shows:unwatched', value, true);
                } else {
                    App.vent.trigger('shows:watched', value, true);
                }
                _this.markWatched(value, !watched);
            });
        },

        markWatched: function(value, state) {
            state = (state === undefined) ? true : state;
            // we should never get any shows that aren't us, but you know, just in case.
            if (value.show_id === _this.model.get('tvdb_id')) {
                $('#watched-' + value.season + '-' + value.episode).toggleClass('true', state);
            } else {
                console.error('something fishy happened with the watched signal', this.model, value);
            }
        },

        startStreaming: function(e) {

            if (e.type) {
                e.preventDefault();
            }
            var that = this;
            var title = that.model.get('title');
            var episode = $(e.currentTarget).attr('data-episode');
            var season = $(e.currentTarget).attr('data-season');
            var name = $(e.currentTarget).attr('data-title');

            title += ' - ' + i18n.__('Season') + ' ' + season + ', ' + i18n.__('Episode') + ' ' + episode + ' - ' + name;
            var epInfo = {
                type: 'tvshow',
                imdbid: that.model.get('imdb_id'),
                tvdbid: that.model.get('tvdb_id'),
                season: season,
                episode: episode
            };

            var torrentStart = new Backbone.Model({
                torrent: $(e.currentTarget).attr('data-torrent'),
                backdrop: that.model.get('images').fanart,
                type: 'episode',
                show_id: that.model.get('tvdb_id'),
                episode: episode,
                season: season,
                title: title,
                status: that.model.get('status'),
                extract_subtitle: epInfo,
                quality: $(e.currentTarget).attr('data-quality'),
                defaultSubtitle: Settings.subtitle_language,
                device: App.Device.Collection.selected
            });
            _this.unbindKeyboardShortcuts();
            App.vent.trigger('stream:start', torrentStart);
        },

        closeDetails: function(e) {
            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }
            _this.unbindKeyboardShortcuts();
            App.vent.trigger('show:closeDetail');
        },

        clickSeason: function(e) {
            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }
            this.selectSeason($(e.currentTarget));
        },

        clickEpisode: function(e) {
            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }
            this.selectEpisode($(e.currentTarget));
        },

        dblclickEpisode: function(e) {
            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }
            this.selectEpisode($(e.currentTarget));
            $('.startStreaming').trigger('click');
        },
        // Helper Function
        selectSeason: function($elem) {
            $('.tab-season.active').removeClass('active');
            $elem.addClass('active');
            $('.tab-episodes').hide();
            $('.tab-episodes.current').removeClass('current');
            $('.tab-episode.active').removeClass('active');
            $('.tab-episodes.' + $elem.attr('data-tab')).addClass('current').scrollTop(0).show(); //pull the scroll always to top to
            this.selectEpisode($('.tab-episodes.' + $elem.attr('data-tab') + ' li:first'));
        },

        selectEpisode: function($elem) {
            var tvdbid = $elem.attr('data-id');
            var torrents = {};
            torrents.q480 = $('.template-' + tvdbid + ' .q480').text();
            torrents.q720 = $('.template-' + tvdbid + ' .q720').text();
            torrents.quality = '480p';
            if (torrents.q720 !== '') {
                torrents.def = torrents.q720;
                torrents.quality = '720p';
            } else {
                torrents.def = torrents.q480;
            }
            if (torrents.q480 !== '' && torrents.q720 !== '') {
                if ($('#switch-hd-off').is(':checked')) {
                    torrents.def = torrents.q480;
                    torrents.quality = '480p';
                }
                this.ui.qselector.show();
                this.ui.qinfo.hide();
            } else if (torrents.q720 !== '') {
                this.ui.qselector.hide();
                this.ui.qinfo.text('720p');
                this.ui.qinfo.show();
            } else {
                this.ui.qselector.hide();
                this.ui.qinfo.text('480p');
                this.ui.qinfo.show();
            }

            _this.resetHealth();

            $('.tab-episode.active').removeClass('active');
            $elem.addClass('active');
            $('.episode-info-number').text(i18n.__('Season') + ' ' + $('.template-' + tvdbid + ' .season').html() + ', ' + i18n.__('Episode') + ' ' + $('.template-' + tvdbid + ' .episode').html());
            $('.episode-info-title').text($('.template-' + tvdbid + ' .title').text());
            $('.episode-info-date').text(i18n.__('Aired Date') + ': ' + $('.template-' + tvdbid + ' .date').html());
            $('.episode-info-description').text($('.template-' + tvdbid + ' .overview').text());

            //pull the scroll always to top
            $('.episode-info-description').scrollTop(0);

            $('.startStreaming').attr('data-torrent', torrents.def);
            $('.startStreaming').attr('data-quality', torrents.quality);
            $('.startStreaming').attr('data-episodeid', tvdbid);

            // set var for player
            $('.startStreaming').attr('data-episode', $('.template-' + tvdbid + ' .episode').html());
            $('.startStreaming').attr('data-season', $('.template-' + tvdbid + ' .season').html());
            $('.startStreaming').attr('data-title', $('.template-' + tvdbid + ' .title').html());

            this.ui.startStreaming.show();
        },

        enableHD: function() {
            win.info('HD Enabled');
            var tvdbid = $('.startStreaming').attr('data-episodeid'),
                torrent = $('.template-' + tvdbid + ' .q720').text();
            $('.startStreaming').attr('data-torrent', torrent);
            $('.startStreaming').attr('data-quality', '720p');
            _this.resetHealth();
            win.debug(torrent);
        },

        disableHD: function() {
            win.info('HD Disabled');
            var tvdbid = $('.startStreaming').attr('data-episodeid'),
                torrent = $('.template-' + tvdbid + ' .q480').text();
            $('.startStreaming').attr('data-torrent', torrent);
            $('.startStreaming').attr('data-quality', '480p');
            _this.resetHealth();
            win.debug(torrent);
        },

        nextEpisode: function(e) {
            var index = $('.tab-episode.active').index();
            if (index === $('.tab-episode:visible').length - 1) {
                return;
            }
            var $nextEpisode = $('.tab-episode:visible').eq(++index);
            _this.selectEpisode($nextEpisode);
            if (!_this.isElementVisible($nextEpisode[0])) {
                $nextEpisode[0].scrollIntoView(false);
            }

            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }

        },

        previousEpisode: function(e) {
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

        nextSeason: function(e) {
            var index = $('.tab-season.active').index();
            if (index === $('.tab-season').length - 1) {
                return;
            }
            var $nextSeason = $('.tab-season').eq(++index);
            _this.selectSeason($nextSeason);
            if (!_this.isElementVisible($nextSeason[0])) {
                $nextSeason[0].scrollIntoView(false);
            }

            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }
        },

        previousSeason: function(e) {
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

        playEpisode: function(e) {
            $('.startStreaming').trigger('click');

            if (e.type) {
                e.preventDefault();
                e.stopPropagation();
            }
        },

        toggleQuality: function(e) {

            if ($('.quality').is(':visible')) {
                if ($('#switch-hd-off').is(':checked')) {
                    $('#switch-hd-on').trigger('click');
                } else {
                    $('#switch-hd-off').trigger('click');
                }
                _this.resetHealth();
            }

        },

        toggleEpisodeWatched: function(e) {
            var data = {};
            data.currentTarget = $('.tab-episode.active .watched')[0];
            _this.toggleWatched(data);
        },


        isElementVisible: function(el) {
            var eap,
                rect = el.getBoundingClientRect(),
                docEl = document.documentElement,
                vWidth = window.innerWidth || docEl.clientWidth,
                vHeight = window.innerHeight || docEl.clientHeight,
                efp = function(x, y) {
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

        getTorrentHealth: function(e) {
            if (health_checked) {
                return;
            }
            var torrent = $('.startStreaming').attr('data-torrent');
            health_checked = true;
            $('.health-icon')
                .removeClass('fa-circle')
                .addClass('fa-spinner')
                .addClass('fa-spin');
            torrentHealth(torrent)
                .then(function(res) {
                    var h = Common.calcHealth({
                        seed: res.seeds,
                        peer: res.peers
                    });
                    var health = Common.healthMap[h].capitalize();
                    var ratio = res.peers > 0 ? res.seeds / res.peers : +res.seeds;

                    $('.health-icon').tooltip({
                        html: true
                    })
                        .removeClass('fa-spin')
                        .removeClass('fa-spinner')
                        .addClass('fa-circle')
                        .removeClass('Bad Medium Good Excellent')
                        .addClass(health)
                        .attr('data-original-title', i18n.__('Health ' + health) + ' - ' + i18n.__('Ratio:') + ' ' + ratio.toFixed(2) + ' <br> ' + i18n.__('Seeds:') + ' ' + res.seeds + ' - ' + i18n.__('Peers:') + ' ' + res.peers)
                        .tooltip('fixTitle');
                });
        },

        resetHealth: function() {
            $('.health-icon').tooltip({
                html: true
            })
                .removeClass('fa-spin')
                .removeClass('fa-spinner')
                .addClass('fa-circle')
                .removeClass('Bad Medium Good Excellent')
                .attr('data-original-title', i18n.__('Health Unknown'))
                .tooltip('fixTitle');
            health_checked = false;
        },

        selectPlayer: function(e) {
            var player = $(e.currentTarget).parent('li').attr('id').replace('player-', '');
            _this.model.set('device', player);
        },



    });

    App.View.ShowDetail = ShowDetail;
})(window.App);