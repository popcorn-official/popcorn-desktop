(function (App){
    'use strict';

    App.View.TorrentList = Marionette.View.extend({
        template: '#torrent-list-tpl',
        ui: {
        },
        events: {
            'click .item-play': 'addItem',
            'click .item-download': 'addItem',
            'mousedown .provider img': 'openSource',
            'contextmenu .item-row td:not(.provider)': 'copyMagnet',
        },
        initialize: function() {
            this.model.set('torrents', []);
            this.icons = App.Providers.get('Icons');
        },
        onAttach: function () {
            this.model.set('torrents', []);
            this.model.get('promise').then((data) => this.updateTorrents(data));
        },

        updateTorrents: function (torrents) {
            const provider = this.model.get('provider');
            let loadIcons = [];
            for(let torrent of torrents) {
                loadIcons.push(this.icons.getLink(provider, torrent.provider)
                    .then((icon) => torrent.icon = icon || '/src/app/images/icons/' + torrent.provider + '.png')
                    .catch((error) => { !torrent.icon ? torrent.icon = '/src/app/images/icons/' + torrent.provider + '.png' : null; }));
            }
            Promise.all(loadIcons).then((data) => {
                this.model.set('torrents', torrents);
                this.render();
                this.$('.tooltipped').tooltip({
                    delay: {
                        'show': 1200,
                        'hide': 100
                    }
                });
                if ($('.loading .maximize-icon').is(':visible') || $('.player .maximize-icon').is(':visible')) {
                    $('#torrent-list .item-row, #torrent-show-list .item-row, #torrent-list .item-play, #torrent-show-list .item-play').addClass('disabled').prop('disabled', true);
                }
            });
        },

        getTorrent: function(node) {
            const key = $(node).parents('tr').data('key');
            return this.model.get('torrents')[key];
        },

        openSource: function(e) {
            const torrent = this.getTorrent(e.target);
            Common.openOrClipboardLink(e, torrent.source, i18n.__('source link'));
        },

        copyMagnet: function(e) {
            const torrent = this.getTorrent(e.target);
            const magnetLink = torrent.url.split('&tr=')[0] + _.union(decodeURIComponent(torrent.url).replace(/\/announce/g, '').split('&tr=').slice(1), Settings.trackers.forced.toString().replace(/\/announce/g, '').split(',')).map(t => `&tr=${t}/announce`).join('');
            Common.openOrClipboardLink(e, magnetLink, i18n.__('magnet link'));
        },

        addItem: function (e) {
            e.stopPropagation();
            const torrent = this.getTorrent(e.target);
            const download = !$(e.target).hasClass('item-play');
            var torrentStart = new Backbone.Model({
                torrent: torrent.url,
                title: this.model.get('select') && !download ? null : torrent.title,
                defaultSubtitle: Settings.subtitle_language,
                device: App.Device.Collection.selected,
                // file_name: e.target.parentNode.firstChild.innerHTML
            });
            App.vent.trigger('stream:start', torrentStart, download ? 'downloadOnly' : '' );
            if (download) {
                if (Settings.showSeedboxOnDlInit) {
                    App.previousview = App.currentview;
                    App.currentview = 'Seedbox';
                    App.vent.trigger('seedbox:show');
                    $('.filter-bar').find('.active').removeClass('active');
                    $('#filterbar-seedbox').addClass('active');
                    $('#nav-filters').hide();
                } else {
                    $('.notification_alert').stop().text(i18n.__('Download added')).fadeIn('fast').delay(1500).fadeOut('fast');
                }
            }
        },
    });
})(window.App);
