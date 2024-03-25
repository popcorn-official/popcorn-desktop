(function (App) {
    'use strict';

    var that,
        magnetName,
        importedTorrent,
        backdrop,
        formatMagnet;

    var FileSelector = Marionette.View.extend({
        template: '#file-selector-tpl',
        className: 'file-selector',

        events: {
            'click .close-icon': 'closeSelector',
            'click .file-item *': 'startStreaming',
            'click .store-torrent': 'storeTorrent',
            'click .playerchoicemenu li a': 'selectPlayer',
            'click .playerchoicehelp': 'showPlayerList',
            'click .playerchoicerefresh': 'refreshPlayerList'
        },

        initialize: function () {
            that = this;
            magnetName = Settings.droppedMagnetName;
            delete(Settings.droppedMagnetName);
            importedTorrent = Settings.importedTorrent;
            delete(Settings.importedTorrent);
            !that.model.get('localFile') ? that.model.set('localFile', false) : null;

            formatMagnet = function (link) {
                // format magnet with Display Name
                var index = Settings.droppedMagnet.indexOf('\&dn=') !== -1 ? link.indexOf('\&dn=') + 4 : link.indexOf('btih:') + 5,
                    _link = link.substring(index); // remove everything before dn
                _link = _link.split('\&'); // array of strings starting with &
                _link = _link[0]; // keep only the first (i.e: display name)
                _link = _link.replace(/\+/g, '.'); // replace + by .
                _link = _link.replace(/%5B/g, '[').replace(/%5D/g, ']');
                _link = _link.replace(/%28/g, '(').replace(/%29/g, ')');
                link = _link.replace(/\W$/, ''); // remove trailing non-word char
                return link;
            };
        },

        onAttach: function () {
            this.isTorrentStored();

            Mousetrap.bind(['esc', 'backspace'], function (e) {
                that.closeSelector(e);
            });

            App.Device.Collection.setDevice(Settings.chosenPlayer);
            App.Device.ChooserView('#player-chooser2').render();
            this.$('#watch-now').text('');

            if (!$.trim($('.file-selector-container .file-list').html()).length) {
                $('.file-selector-container .file-list').html('<li style="margin-top: 30px">' + i18n.__('No results found') + '</li>');
            }
            backdrop = !importedTorrent && $('.shb-img')[0] && $('.shb-img')[0].style ? $('.shb-img')[0].style.backgroundImage : null;
            $('.file-selector-backdrop').css('background-image', backdrop);
            this.$('.tooltipped').tooltip({
                html: true,
                delay: {
                    'show': 800,
                    'hide': 100
                }
            });
        },

        startStreaming: function (e) {
            $('.tooltipped').tooltip('hide');
            if (that.model.get('localFile')) {
                App.vent.trigger('stream:start', that.model, 'local');
                return App.vent.trigger('system:closeFileSelector');
            }
            var torrent = that.model.get('torrent');
            var file = $(e.currentTarget).parent().attr('data-file');

            var torrentStart = new Backbone.Model({
                torrent: torrent.magnetURI,
                backdrop: backdrop ? backdrop.replace('url("', '').replace('")', '') : null,
                torrent_read: true,
                file_name: file,
                device: App.Device.Collection.selected
            });
            App.vent.trigger('stream:start', torrentStart, !$(e.currentTarget).hasClass('item-download') ? '' : 'downloadOnly' );
            App.vent.trigger('system:closeFileSelector');
            if ($(e.currentTarget).hasClass('item-download')) {
                if (Settings.showSeedboxOnDlInit) {
                    if (App.currentview !== 'Torrent-collection') {
                        App.previousview = App.currentview;
                        App.currentview = 'Seedbox';
                    }
                    App.vent.trigger('seedbox:show');
                    $('.filter-bar').find('.active').removeClass('active');
                    $('#filterbar-seedbox').addClass('active');
                    $('#nav-filters, .right .search').hide();
                } else {
                    $('.notification_alert').stop().text(i18n.__('Download added')).fadeIn('fast').delay(1500).fadeOut('fast');
                }
            }
        },

        isTorrentStored: function () {
            var target = App.settings['databaseLocation'] + '/TorrentCollection/';

            // bypass errors
            if (!Settings.droppedTorrent && !Settings.droppedMagnet) {
                $('.store-torrent').hide();
                return false;
            }
            var file, _file;
            if (Settings.droppedTorrent) {
                file = Settings.droppedTorrent;
            } else if (Settings.droppedMagnet && !Settings.droppedStoredMagnet) {
                _file = Settings.droppedMagnet,
                    file = magnetName || formatMagnet(_file);
            } else if (Settings.droppedMagnet && Settings.droppedStoredMagnet) {
                file = Settings.droppedStoredMagnet;
            }

            // check if torrent stored
            if (!fs.existsSync(target + file)) {
                $('.store-torrent').text(i18n.__('Store this torrent'));
                return false;
            } else {
                $('.store-torrent').text(i18n.__('Remove this torrent'));
                return true;
            }
        },

        storeTorrent: function () {
            var source = App.settings.tmpLocation + '/',
                target = App.settings['databaseLocation'] + '/TorrentCollection/',
                file,
                _file;

            if (Settings.droppedTorrent) {
                file = Settings.droppedTorrent;

                if (this.isTorrentStored()) {
                    fs.unlinkSync(target + file); // remove the torrent
                    win.info('Torrent Collection: deleted', file);
                } else {
                    if (!fs.existsSync(target)) {
                        fs.mkdir(target); // create directory if needed
                    }
                    fs.writeFileSync(target + file, fs.readFileSync(source + file)); // save torrent
                    win.info('Torrent Collection: added', file);
                }
            } else if (Settings.droppedMagnet) {
                _file = Settings.droppedMagnet,
                    file = magnetName || formatMagnet(_file);

                if (this.isTorrentStored()) {
                    if (Settings.droppedStoredMagnet) {
                        file = Settings.droppedStoredMagnet;
                    }
                    fs.unlinkSync(target + file); // remove the magnet
                    win.info('Torrent Collection: deleted', file);
                } else {
                    if (!fs.existsSync(target)) {
                        fs.mkdir(target); // create directory if needed
                    }
                    fs.writeFileSync(target + file, _file); // save magnet link inside readable file
                    win.info('Torrent Collection: added', file);
                }
            }
            this.isTorrentStored(); // trigger button change

            if (App.currentview === 'Torrent Collection' || App.currentview === 'Torrent-collection') {
                App.vent.trigger('torrentCollection:show'); // refresh collection
            }
        },

        selectPlayer: function (e) {
            var player = $(e.currentTarget).parent('li').attr('id').replace('player-', '');
            that.model.set('device', player);
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
            $('.file-selector .playerchoicerefresh').addClass('fa-spin fa-spinner spin').tooltip('hide');
            Promise.all(App.Device.loadDeviceSupport()).then(function(data) {
                App.Device.rescan();
            }).then(function() {
                setTimeout(() => {
                    App.Device.ChooserView('#player-chooser2').render();
                    $('.file-selector #watch-now').text('');
                    $('.playerchoicerefresh, .playerchoicehelp').tooltip({html: true, delay: {'show': 800,'hide': 100}});
                    $('.file-selector .playerchoice').click();
                }, 3000);
            });
        },

        closeSelector: function (e) {
            $('.filter-bar').show();
            $('#header').removeClass('header-shadow');
            App.vent.trigger('system:closeFileSelector');
        },

        onBeforeDestroy: function () {
            Settings.droppedTorrent = false;
            Settings.droppedMagnet = false;
            Settings.droppedStoredMagnet = false;

            //Clean TorrentCache
            App.Providers.TorrentCache().clearTmpDir();
            App.Providers.TorrentCache()._checkTmpDir();
        },

    });

    App.View.FileSelector = FileSelector;
})(window.App);
