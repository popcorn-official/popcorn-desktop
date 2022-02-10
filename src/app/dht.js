'use strict';

var DHT = require('bittorrent-dht');
var ed = require('noble-ed25519'); // better use ed25519-supercop but need rebuild ed25519 for windows

class DhtReader
{
    constructor(options) {
        this.options = _.defaults(options || {}, {
        });
    }

    update(e)
    {
        if (!Settings.dht) {
            return;
        }
        const dht = new DHT({verify: ed.verify});
        const hash = Buffer(Settings.dht, 'hex');
        const self=this;
        dht.once('ready', function () {
            dht.get(hash, function (err, node) {
                if (err) {
                    console.error(err);
                    return;
                }
                if (!node || !node.v) {
                    console.error('DHT hash not found');
                    return;
                }
                let newData = node.v.toString();
                let data = AdvSettings.get('dhtData');
                App.vent.trigger('notification:close');
                if (data !== newData && (Settings.customMoviesServer || Settings.customSeriesServer || Settings.customAnimeServer)) {
                    self.alertMessageApply();
                } else if (data !== newData || e === 'enable') {
                    self.alertMessageSuccess(true);
                } else if (e === 'manual') {
                    self.alertMessageSuccess();
                }
                AdvSettings.set('dhtData', newData);
                AdvSettings.set('dhtDataUpdated', Date.now());
                console.log('Updated from DHT');
            });
        });
    }

    updateOld()
    {
        if (!Settings.dht) {
            return;
        }
        let data = AdvSettings.get('dhtData');
        let last = AdvSettings.get('dhtDataUpdated');
        const time = 1000 * 60 * 60 * 24 * 7;
        if (!data) {
            App.vent.trigger('notification:show', new App.Model.Notification({
                title: i18n.__('Please wait') + '...',
                body: i18n.__('Updating the API Server URLs'),
                type: 'danger',
                autoclose: 4000
            }));
        }
        if (!data || (Date.now() - last > time)) {
            this.update();
        }
    }

    alertMessageSuccess(btnRestart, btn, btnText, successDesc) {
        var notificationModel = new App.Model.Notification({
            title: i18n.__('Success'),
            body: successDesc,
            type: 'success',
        });

        if (btnRestart) {
            notificationModel.set('showRestart', true);
            notificationModel.set('body', i18n.__('Please restart your application'));
        } else {
            notificationModel.attributes.autoclose = 4000;
            notificationModel.set('body', i18n.__('API Server URLs already updated'));
        }

        // Open the notification
        App.vent.trigger('notification:show', notificationModel);
    }

    alertMessageApply() {
        var self = this;
        var changeapis = function () {
            AdvSettings.set('customMoviesServer', '');
            AdvSettings.set('customSeriesServer', '');
            AdvSettings.set('customAnimeServer', '');
            self.alertMessageSuccess(true);
        };
        var dontchangeapis = function () {
            self.alertMessageSuccess(true);
        };
        var notificationModel = new App.Model.Notification({
            title: i18n.__('Success'),
            body: i18n.__('Change API Server(s) to the new URLs?'),
            type: 'success',
            showRestart: false,
            buttons: [{ title: '<label class="change-apis" for="changeapis">' + i18n.__('Yes') + '</label>', action: changeapis }, { title: '<label class="dont-change-apis" for="changeapis">' + i18n.__('No') + '</label>', action: dontchangeapis }]
        });

        // Open the notification
        App.vent.trigger('notification:show', notificationModel);
    }
}

App.DhtReader = new DhtReader();
