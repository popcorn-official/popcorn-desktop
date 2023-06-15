'use strict';

var DHT = require('bittorrent-dht');
var ed = require('@noble/ed25519'); // better use ed25519-supercop but need rebuild ed25519 for windows

class DhtReader {
    constructor(options) {
        this.options = _.defaults(options || {}, {});
    }

    update(e) {
        const self = this;
        if (!Settings.dht) {
            if (e && e !== 'urls') {
                self.alertIcon('error');
                self.alertMessage('error');
            }
            return;
        } else if (e && e !== 'urls') {
            self.alertIcon();
            self.alertMessage('wait');
        }
        const dht = new DHT({verify: ed.verify});
        const hash = Buffer(Settings.dht, 'hex');
        dht.once('ready', function () {
            dht.get(hash, function (err, node) {
                if (err || !node || !node.v) {
                    if (e && e !== 'urls') {
                        self.alertIcon('error');
                        self.alertMessage('error');
                    }
                    return;
                }
                let data = AdvSettings.get('dhtData');
                let newData = node.v.toString();
                let info = AdvSettings.get('dhtInfo');
                let newInfo = typeof newData === 'string' ? JSON.parse(newData) : null;
                AdvSettings.set('dhtData', newData);
                AdvSettings.set('dhtDataUpdated', Date.now());
                if (e !== 'urls'){
                    if (e) {
                        self.alertIcon('success');
                    }
                    AdvSettings.set('dhtInfo', newInfo);
                }
                if (data !== newData && e !== 'urls') {
                    self.updateSettings();
                    if (!Settings.dhtEnable || (Settings.customMoviesServer || Settings.customSeriesServer || Settings.customAnimeServer)) {
                        self.alertMessage('change');
                    } else {
                        self.alertMessage('restart');
                    }
                } else if (e === 'enable') {
                    self.alertMessage('restart');
                } else if (e === 'manual') {
                    if (info.toString() !== newInfo.toString()) {
                        self.alertMessage('restart');
                    } else {
                        self.alertMessage('alrdupdated');
                    }
                }
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
            if (Settings.dhtEnable) {
                this.update('enable');
            } else {
                this.update('urls');
            }
        } else if (Date.now() - last > time) {
            this.update();
        }
    }

    updateSettings() {
        setTimeout(function() {
            if (App.ViewStack.includes('settings-container-contain')) {
                let scrollPos = $('.settings-container-contain').scrollTop();
                $('.nav-hor.left li:first').click();
                App.vent.trigger('settings:show');
                $('.update-dht').removeClass('fa-spin fa-spinner').addClass('valid-tick');
                $('.settings-container-contain').scrollTop(scrollPos);
            }
        }, 200);
    }

    alertIcon(e) {
        if (e) {
            let tmpclass = e === 'success' ? 'valid-tick' : 'invalid-cross';
            $('.update-dht').removeClass('fa-spin fa-spinner').addClass(tmpclass);
            setTimeout(function() { $('.update-dht').removeClass(tmpclass).addClass('fa-rotate');}, 6000);
        } else {
            $('.update-dht').removeClass('fa-rotate valid-tick invalid-cross').addClass('fa-spin fa-spinner');
        }
    }

    alertMessage(alertType) {
        var changeServer = function () {
            let newServer = AdvSettings.get('dhtData') && !AdvSettings.get('dhtEnable') ? Settings.dhtInfo.server : '';
            AdvSettings.set('customMoviesServer', newServer);
            AdvSettings.set('customSeriesServer', newServer);
            AdvSettings.set('customAnimeServer', newServer);
            this.alertMessage('restart');
        }.bind(this);
        var notificationModel = new App.Model.Notification({
            title: i18n.__('Success'),
            showClose: false,
            type: 'success',
        });
        switch (alertType) {
            case 'wait':
                notificationModel.set('title', i18n.__('Please wait') + '...');
                notificationModel.set('body', i18n.__('Updating the API Server URLs'));
                notificationModel.set('type', 'danger');
                break;
            case 'error':
                notificationModel.set('title', i18n.__('Error'));
                notificationModel.set('body', i18n.__('API Server URLs could not be updated'));
                notificationModel.set('type', 'error');
                notificationModel.set('autoclose', true);
                break;
            case 'change':
                notificationModel.set('body', i18n.__('Change API Server(s) to the new URLs?'));
                notificationModel.set('buttons', [{ title: '<label class="change-server">' + i18n.__('Yes') + '</label>', action: changeServer }, { title: '<label class="dont-change-server">' + i18n.__('No') + '</label>', action: function () {this.alertMessage('updated');}.bind(this)}]);
                break;
            case 'restart':
                notificationModel.set('body', i18n.__('Please restart your application'));
                notificationModel.set('showRestart', true);
                notificationModel.set('showClose', true);
                break;
            case 'updated':
                notificationModel.set('body', i18n.__('API Server URLs updated'));
                notificationModel.set('autoclose', true);
                break;
            case 'alrdupdated':
                notificationModel.set('body', i18n.__('API Server URLs already updated'));
                notificationModel.set('autoclose', true);
        }
        App.vent.trigger('notification:show', notificationModel);
    }
}

App.DhtReader = new DhtReader();
