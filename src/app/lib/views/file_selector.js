(function (App) {
    'use strict';

    var that,
        formatMagnet;

    var FileSelector = Marionette.View.extend({
        template: '#file-selector-tpl',
        className: 'file-selector',

        events: {
            'click .close-icon': 'closeSelector',
            'click .file-item': 'startStreaming',
            'click .store-torrent': 'storeTorrent',
            'click .playerchoicemenu li a': 'selectPlayer'
        },

        initialize: function () {
            that = this;

            formatMagnet = function (link) {
                // format magnet with Display Name
                var index = link.indexOf('\&dn=') + 4, // keep display name
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

        onBeforeRender: function () {
            this.bitsnoopRequest(this.model.get('torrent').infoHash);
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
        },

        bitsnoopRequest: function (hash) {
            var endpoint = 'http://bitsnoop.com/api/fakeskan.php?hash=';

            request({
                method: 'GET',
                url: endpoint + hash,
                headers: {
                    'User-Agent': 'request'
                }
            }, function (error, response, body) {
                if (!error && response.statusCode <= 400) {
                    if (body === 'FAKE') {
                        $('.fakeskan').text(i18n.__('%s reported this torrent as fake', 'FakeSkan')).show();
                    }
                }
            });
        },

        startStreaming: function (e) {
            var torrent = that.model.get('torrent');
            var file = parseInt($(e.currentTarget).attr('data-file'));
            var actualIndex = parseInt($(e.currentTarget).attr('data-index'));

            var torrentStart = new Backbone.Model({
                torrent: torrent.magnetURI,
                torrent_read: true,
                file_index: actualIndex,
                device: App.Device.Collection.selected
            });
            App.vent.trigger('stream:start', torrentStart);
            App.vent.trigger('system:closeFileSelector');
        },

        isTorrentStored: function () {
            var target = data_path + '/TorrentCollection/';

            // bypass errors
            if (!Settings.droppedTorrent && !Settings.droppedMagnet) {
                $('.store-torrent').hide();
                return false;
            } else if (Settings.droppedMagnet && Settings.droppedMagnet.indexOf('\&dn=') === -1) {
                var storeTorrent = $('.store-torrent');
                storeTorrent.text(i18n.__('Cannot be stored'));
                storeTorrent.addClass('disabled').prop('disabled', true);
                win.warn('Magnet lacks Display Name, unable to store it');
                return false;
            }
            var file, _file;
            if (Settings.droppedTorrent) {
                file = Settings.droppedTorrent;
            } else if (Settings.droppedMagnet && !Settings.droppedStoredMagnet) {
                _file = Settings.droppedMagnet,
                    file = formatMagnet(_file);
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
                target = data_path + '/TorrentCollection/',
                file,
                _file;

            if (Settings.droppedTorrent) {
                file = Settings.droppedTorrent;

                if (this.isTorrentStored()) {
                    fs.unlinkSync(target + file); // remove the torrent
                    win.debug('Torrent Collection: deleted', file);
                } else {
                    if (!fs.existsSync(target)) {
                        fs.mkdir(target); // create directory if needed
                    }
                    fs.writeFileSync(target + file, fs.readFileSync(source + file)); // save torrent
                    win.debug('Torrent Collection: added', file);
                }
            } else if (Settings.droppedMagnet) {
                _file = Settings.droppedMagnet,
                    file = formatMagnet(_file);

                if (this.isTorrentStored()) {
                    if (Settings.droppedStoredMagnet) {
                        file = Settings.droppedStoredMagnet;
                    }
                    fs.unlinkSync(target + file); // remove the magnet
                    win.debug('Torrent Collection: deleted', file);
                } else {
                    if (!fs.existsSync(target)) {
                        fs.mkdir(target); // create directory if needed
                    }
                    fs.writeFileSync(target + file, _file); // save magnet link inside readable file
                    win.debug('Torrent Collection: added', file);
                }
            }
            this.isTorrentStored(); // trigger button change

            if (App.currentview === 'Torrent Collection') {
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
