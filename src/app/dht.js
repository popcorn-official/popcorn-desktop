'use strict';

var DHT = require('bittorrent-dht');
var ed = require('noble-ed25519'); // better use ed25519-supercop but need rebuild ed25519 for windows

class DhtReader {
    constructor(options) {
        this.options = _.defaults(options || {}, {});
    }

    update(e) {
        const self = this;
        if (!Settings.dht) {
            $('.update-dht').removeClass('fa-spin fa-spinner').addClass('invalid-cross');
            setTimeout(function() { $('.update-dht').removeClass('invalid-cross').addClass('fa-redo');}, 6000);
            App.vent.trigger('notification:close');
            if (e) {
                self.alertMessage('error');
            }
            return;
        }
        const dht = new DHT({verify: ed.verify});
        const hash = Buffer(Settings.dht, 'hex');
        dht.once('ready', function () {
            dht.get(hash, function (err, node) {
                App.vent.trigger('notification:close');
                if (err || !node || !node.v) {
                    console.error(err || 'DHT hash not found');
                    $('.update-dht').removeClass('fa-spin fa-spinner').addClass('invalid-cross');
                    setTimeout(function() { $('.update-dht').removeClass('invalid-cross').addClass('fa-redo');}, 6000);
                    if (e) {
                        self.alertMessage('error');
                    }
                    return;
                }
                let newData = node.v.toString();
                let data = AdvSettings.get('dhtData');
                $('.update-dht').removeClass('fa-spin fa-spinner').addClass('valid-tick');
                setTimeout(function() { $('.update-dht').removeClass('valid-tick').addClass('fa-redo');}, 6000);
                if (data !== newData && (Settings.customMoviesServer || Settings.customSeriesServer || Settings.customAnimeServer)) {
                    self.alertMessage('change');
                } else if (data !== newData || e === 'enable') {
                    self.alertMessage('restart');
                } else if (e === 'manual') {
                    self.alertMessage();
                }
                AdvSettings.set('dhtData', newData);
                AdvSettings.set('dhtDataUpdated', Date.now());
            });
        });
    }

    updateOld() {
        if (!Settings.dht) {
            return;
        }
        let data = AdvSettings.get('dhtData');
        let last = AdvSettings.get('dhtDataUpdated');
        const time = 1000 * 60 * 60 * 24 * 7;
        if (!data) {
            this.alertMessage('wait');
            this.update('enable');
        } else if (Date.now() - last > time) {
            this.update();
        }
    }

    alertMessage(alertType) {
        var changeServer = function () {
            let newServer = AdvSettings.get('dhtData') && !AdvSettings.get('dhtEnable') ? AdvSettings.get('dhtData').split('server":"')[1].split('","git":"')[0] : '';
            AdvSettings.set('customMoviesServer', newServer);
            AdvSettings.set('customSeriesServer', newServer);
            AdvSettings.set('customAnimeServer', newServer);
            this.alertMessage('restart');
        }.bind(this);
        var notificationModel = new App.Model.Notification({
            title: i18n.__('Success'),
            type: 'success',
        });
        switch (alertType) {
            case 'wait':
                notificationModel.set('title', i18n.__('Please wait') + '...');
                notificationModel.set('body', i18n.__('Updating the API Server URLs'));
                notificationModel.set('type', 'danger');
                notificationModel.set('autoclose', true);
                break;
            case 'error':
                notificationModel.set('title', i18n.__('Error'));
                notificationModel.set('body', i18n.__('API Server URLs could not be updated'));
                notificationModel.set('type', 'error');
                break;
            case 'change':
                notificationModel.set('body', i18n.__('Change API Server(s) to the new URLs?'));
                notificationModel.set('buttons', [{ title: '<label class="change-server">' + i18n.__('Yes') + '</label>', action: changeServer }, { title: '<label class="dont-change-server">' + i18n.__('No') + '</label>', action: function () {this.alertMessage('restart');}.bind(this)}]);
                break;
            case 'restart':
                notificationModel.set('body', i18n.__('Please restart your application'));
                notificationModel.set('showRestart', true);
                break;
            default:
                notificationModel.set('body', i18n.__('API Server URLs already updated'));
                notificationModel.set('autoclose', true);
        }
        App.vent.trigger('notification:show', notificationModel);
    }
}

App.DhtReader = new DhtReader();
