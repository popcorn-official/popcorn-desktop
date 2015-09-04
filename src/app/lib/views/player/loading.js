(function (App) {
    'use strict';

    var Loading = Backbone.Marionette.ItemView.extend({
        template: '#loading-tpl',
        className: 'app-overlay',
        extPlayerStatusUpdater: null,

        ui: {
            stateTextDownload: '.text_download',
            progressTextDownload: '.value_download',

            stateTextPeers: '.text_peers',
            progressTextPeers: '.value_peers',

            stateTextSeeds: '.text_seeds',
            progressTextSeeds: '.value_seeds',

            seedStatus: '.seed_status',
            bufferPercent: '.buffer_percent',

            downloadSpeed: '.download_speed',
            uploadSpeed: '.upload_speed',
            progressbar: '#loadingbar-contents',

            title: '.title',
            player: '.player-name',
            streaming: '.external-play',
            controls: '.player-controls',
            cancel_button: '.cancel-button',

            playingbarBox: '.playing-progressbar',
            playingbar: '#playingbar-contents'
        },

        events: {
            'click .cancel-button': 'cancelStreaming',
            'click .pause': 'pauseStreaming',
            'click .stop': 'stopStreaming',
            'click .play': 'resumeStreaming',
            'click .forward': 'forwardStreaming',
            'click .backward': 'backwardStreaming',
            'click .playing-progressbar': 'seekStreaming'
        },

        initialize: function () {
            var _this = this;

            App.vent.trigger('settings:close');
            App.vent.trigger('about:close');

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

            win.info('Loading torrent');

            this.listenTo(this.model, 'change:state', this.onStateUpdate);
        },

        initKeyboardShortcuts: function () {
            var _this = this;
            Mousetrap.bind(['esc', 'backspace'], function (e) {
                _this.cancelStreaming();
            });
        },

        unbindKeyboardShortcuts: function () {
            Mousetrap.unbind(['esc', 'backspace']);
        },

        onShow: function () {
            $('.filter-bar').hide();
            $('#header').addClass('header-shadow');

            App.LoadingView = this;

            this.initKeyboardShortcuts();
        },
        onStateUpdate: function () {
            var self = this;
            var state = this.model.get('state');
            var streamInfo = this.model.get('streamInfo');
            win.info('Loading torrent:', state);

            this.checkFreeSpace(this.model.get('streamInfo').get('size'));

            this.ui.stateTextDownload.text(i18n.__(state));

            if (state === 'downloading') {
                this.listenTo(this.model.get('streamInfo'), 'change:downloaded', this.onProgressUpdate);
            }

            if (state === 'playingExternally') {
                this.ui.stateTextDownload.hide();
                this.ui.progressbar.hide();
                if (streamInfo.get('player') && streamInfo.get('player').get('type') === 'chromecast') {
                    this.ui.controls.css('visibility', 'visible');
                    this.ui.playingbarBox.css('visibility', 'visible');
                    this.ui.playingbar.css('width', '0%');


                    // Update gui on status update.
                    // uses listenTo so event is unsubscribed automatically when loading view closes.
                    this.listenTo(App.vent, 'device:status', this.onDeviceStatus);
                }
                // The 'downloading' state is not always sent, eg when playing canceling and replaying
                // Start listening here instead when playing externally
                this.listenTo(this.model.get('streamInfo'), 'change:downloaded', this.onProgressUpdate);
                // The first progress update can take some time, so force updating the UI immediately
                this.onProgressUpdate();
            }
        },

        onProgressUpdate: function () {

            // TODO: Translate peers / seeds in the template
            this.ui.seedStatus.css('visibility', 'visible');
            var streamInfo = this.model.get('streamInfo');
            var downloaded = streamInfo.get('downloaded') / (1024 * 1024);
            this.ui.progressTextDownload.text(downloaded.toFixed(2) + ' Mb');

            this.ui.progressTextPeers.text(streamInfo.get('active_peers'));
            this.ui.progressTextSeeds.text(streamInfo.get('total_peers'));
            this.ui.bufferPercent.text(streamInfo.get('buffer_percent').toFixed() + '%');

            this.ui.downloadSpeed.text(streamInfo.get('downloadSpeed'));
            this.ui.uploadSpeed.text(streamInfo.get('uploadSpeed'));
            this.ui.progressbar.css('width', streamInfo.get('buffer_percent').toFixed() + '%');

            if (streamInfo.get('title') !== '') {
                this.ui.title.html(streamInfo.get('title'));
            }
            if (streamInfo.get('player') && streamInfo.get('player').get('type') !== 'local') {
                if (this.model.get('state') === 'playingExternally') {
                    this.ui.bufferPercent.text(streamInfo.get('downloadedPercent').toFixed() + '%');
                    this.ui.stateTextDownload.text(i18n.__('Downloaded')).show();
                }
                this.ui.player.text(streamInfo.get('player').get('name'));
                this.ui.streaming.css('visibility', 'visible');
            }
        },

        onDeviceStatus: function (status) {
            if (status.media !== undefined && status.media.duration !== undefined) {
                // Update playingbar width
                var playedPercent = status.currentTime / status.media.duration * 100;
                this.ui.playingbar.css('width', playedPercent.toFixed(1) + '%');
                win.debug('ExternalStream: %s: %ss / %ss (%s%)', status.playerState,
                    status.currentTime.toFixed(1), status.media.duration.toFixed(), playedPercent.toFixed(1));
            }
            if (!this.extPlayerStatusUpdater && status.playerState === 'PLAYING') {
                // First PLAYING state. Start requesting device status update every 5 sec
                this.extPlayerStatusUpdater = setInterval(function () {
                    App.vent.trigger('device:status:update');
                }, 5000);
            }
            if (this.extPlayerStatusUpdater && status.playerState === 'IDLE') {
                // Media started streaming and is now finished playing
                this.cancelStreaming();
            }
        },

        cancelStreaming: function () {

            // call stop if we play externally
            if (this.model.get('state') === 'playingExternally') {
                if (this.extPlayerStatusUpdater) {
                    clearInterval(this.extPlayerStatusUpdater);
                }
                win.info('Stopping external device');
                App.vent.trigger('device:stop');
            }

            win.info('Closing loading view');
            App.vent.trigger('stream:stop');
            App.vent.trigger('player:close');
            App.vent.trigger('torrentcache:stop');
        },

        pauseStreaming: function () {
            App.vent.trigger('device:pause');
            $('.pause').removeClass('fa-pause').removeClass('pause').addClass('fa-play').addClass('play');
        },

        resumeStreaming: function () {
            win.debug('Play triggered');
            App.vent.trigger('device:unpause');
            $('.play').removeClass('fa-play').removeClass('play').addClass('fa-pause').addClass('pause');
        },

        stopStreaming: function () {
            this.cancelStreaming();
        },

        forwardStreaming: function () {
            win.debug('Forward triggered');
            App.vent.trigger('device:forward');
        },

        backwardStreaming: function () {
            win.debug('Backward triggered');
            App.vent.trigger('device:backward');
        },

        seekStreaming: function (e) {
            var percentClicked = e.offsetX / e.currentTarget.clientWidth * 100;
            win.debug('Seek (%s%) triggered', percentClicked.toFixed(2));
            App.vent.trigger('device:seekPercentage', percentClicked);
        },

        checkFreeSpace: function (size) {
            if (!size) {
                return;
            }
            size = size / (1024 * 1024 * 1024);
            var reserved = size * 20 / 100;
            reserved = reserved > 0.25 ? 0.25 : reserved;
            var minspace = size + reserved;

            var exec = require('child_process').exec,
                cmd;

            if (process.platform === 'win32') {
                var drive = Settings.tmpLocation.substr(0, 2);

                cmd = 'dir /-C ' + drive;

                exec(cmd, function (error, stdout, stderr) {
                    if (error) {
                        return;
                    }
                    var stdoutParse = stdout.split('\n');
                    stdoutParse = stdoutParse[stdoutParse.length - 1] !== '' ? stdoutParse[stdoutParse.length - 1] : stdoutParse[stdoutParse.length - 2];
                    var regx = stdoutParse.match(/(\d+)/g);
                    if (regx !== null) {
                        var freespace = regx[regx.length - 1] / (1024 * 1024 * 1024);
                        if (freespace < minspace) {
                            $('#player .warning-nospace').css('display', 'block');
                        }
                    }
                });
            } else {
                var path = Settings.tmpLocation;

                cmd = 'df -Pk "' + path + '" | awk \'NR==2 {print $4}\'';

                exec(cmd, function (error, stdout, stderr) {
                    if (error) {
                        return;
                    }

                    var freespace = stdout.replace(/\D/g, '') / (1024 * 1024);
                    if (freespace < minspace) {
                        $('#player .warning-nospace').css('display', 'block');
                    }
                });
            }
        },

        onDestroy: function () {
            $('.filter-bar').show();
            $('#header').removeClass('header-shadow');
            Mousetrap.bind('esc', function (e) {
                App.vent.trigger('show:closeDetail');
                App.vent.trigger('movie:closeDetail');
            });
        }
    });

    App.View.Loading = Loading;
})(window.App);
