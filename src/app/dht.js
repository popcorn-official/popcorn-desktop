'use strict';

var DHT = require('bittorrent-dht');
var ed = require('noble-ed25519'); // better use ed25519-supercop but need rebuild ed25519 for windows

class DhtReader
{
    constructor(options) {
        this.options = _.defaults(options || {}, {
        });
    }

    update()
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
                if (data !== newData) {
                    self.alertMessageSuccess(true, i18n.__('Сonfig updated successfully'));
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
            this.alertMessageSuccess(false, i18n.__('Updating config from internet'));
        }
        if (!data || (Date.now() - last > time)) {
            this.update();
        }
    }

    alertMessageSuccess(btnRestart, successDesc) {
        var notificationModel = new App.Model.Notification({
            title: i18n.__('Endpoints'),
            body: successDesc,
            type: 'success',
        });

        if (btnRestart) {
            notificationModel.set('showRestart', true);
        } else {
            notificationModel.attributes.autoclose = 4000;
        }

        // Open the notification
        App.vent.trigger('notification:show', notificationModel);
    }
}

App.DhtReader = new DhtReader();
