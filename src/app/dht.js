'use strict';

var DHT = require('bittorrent-dht');
var ed = require('ed25519-supercop');

class DhtReader
{
    constructor(options) {
        this.options = _.defaults(options || {}, {
        });
    }

    _update()
    {
        var dht = new DHT({ verify: ed.verify });
        var hash = Buffer(Settings.dht, 'hex');
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
                AdvSettings.set('dhtData', node.v.toString());
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
        if (!data || (Date.now() - last > time)) {
            this._update();
        }
    }

}

App.DhtReader = new DhtReader();
