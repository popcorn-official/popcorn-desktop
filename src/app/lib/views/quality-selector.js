(function (App){
    'use strict';

    App.View.QualitySelector = Marionette.View.extend({
        template: '#quality-selector-tpl',
        ui: {
            list: '.sdow-quality',
        },
        events: {
            'click .qselect': 'selectItem',
        },
        collator: new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'}),
        initialize: function () {
            var self = this;

            var required = this.model.get('required');
            var torrents = this.model.get('torrents');

            let keys = Object.keys(torrents).sort(this.collator.compare);
            let sortedTorrents = {};
            for (let key of required) {
                sortedTorrents[key] = false;
            }
            for (let key of keys) {
                // TODO: it exist in episodes - need know why
                if (key === '0') {
                    continue;
                }
                sortedTorrents[key] = torrents[key];
            }

            this.model.set('sortedTorrents', sortedTorrents);
        },

        onAttach: function () {
            var selectedKey = null;
            for (let [key, torrent] of Object.entries(this.model.get('sortedTorrents'))) {
                if (!torrent) {
                    continue;
                }
                if (!selectedKey || this.collator.compare(key, Settings[this.model.get('defaultQualityKey')]) <= 0) {
                    selectedKey = key;
                }
            }
            this.selectQuality(selectedKey);
        },

        selectNext: function () {
            var lastKey = $(this.ui.list).find('div.active').text();
            var nextKey = null;
            for (let [key, torrent] of Object.entries(this.model.get('sortedTorrents'))) {
                if (nextKey === true) {
                    if (!torrent) {
                        continue;
                    }
                    nextKey = key;
                    break;
                }
                if (lastKey === key) {
                    nextKey = true;
                }
            }
            if (nextKey === true) {
                nextKey = Object.keys(this.model.get('sortedTorrents'))[0];
            }
            this.selectQuality(nextKey);
            AdvSettings.set(this.model.get('defaultQualityKey'), nextKey);
        },

        selectItem: function (e) {
            var key = $(e.currentTarget).text();
            this.selectQuality(key);
            AdvSettings.set(this.model.get('defaultQualityKey'), key);
        },

        selectQuality: function (key) {
            $(this.ui.list).find('div').removeClass('active');
            $(this.ui.list).find('div:contains("'+key+'")').addClass('active');
            console.log('Select quality: ', key);
            var torrents = this.model.get('torrents');
            var callback = this.model.get('selectCallback');
            callback(torrents[key], key);
        },
    });
})(window.App);
