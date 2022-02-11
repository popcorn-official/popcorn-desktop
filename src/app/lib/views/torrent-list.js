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
                    .then((icon) => torrent.icon = icon || '/src/app/images/icon.png'));
            }
            Promise.all(loadIcons).then((data) => {
                this.model.set('torrents', torrents);
                this.render();
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
            if (download) {
                $('.notification_alert').stop().text(i18n.__('Download added')).fadeIn('fast').delay(1500).fadeOut('fast');
            }
            App.vent.trigger('stream:start', torrentStart, download ? 'downloadOnly' : '' );
        },
    });
})(window.App);
