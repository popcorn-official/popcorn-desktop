(function (App) {
    'use strict';

    var self;
    var dns = require('dns'),
        os = require('os');

    // Supports both IPv4 and IPv6 comparison
    var _sequentialPartsInCommon = function (ip1, ip2) {
        var separator = (ip1.indexOf('.') > -1) ? '.' : ':';
        var ip2Parts = ip2.split(separator),
            partsCount = 0;
        ip1.split(separator).every(function (ip1Part, idx) {
            var isEqual = (ip1Part === ip2Parts[idx]);
            if (isEqual) {
                ++partsCount;
                return isEqual;
            }
        });
        return partsCount;
    };

    var _getClosestIP = function (ips, targetIp) {
        return _.max(ips, function (ip) {
            return _sequentialPartsInCommon(ip, targetIp);
        });
    };

    var Device = Backbone.Model.extend({
        defaults: {
            id: 'local',
            type: 'local',
            typeFamily: 'internal',
            ipFamily: '.*', // a regex to match the ip.family
            name: Settings.projectName
        },
        play: function (streamModel) {
            App.vent.trigger('stream:local', streamModel);
        },
        getID: function () {
            return this.id;
        },
        setIP: function (streamModel) {
            /* ddaf:
             * If the device is external we correct src IP to the
             * best matching IP among all network adapters.
             * Supports IPv4 and IPv6.
             */
            if (this.get('typeFamily') !== 'external') {
                return Promise.resolve(streamModel);
            }

            //console.warn('External Device ', this.selected);
            var ips = [],
                ifaces = os.networkInterfaces(),
                ipFamily = this.get('ipFamily');
            for (var dev in ifaces) {
                ifaces[dev].forEach(details => {
                    if (!details.internal && details.family.match(ipFamily)) {
                        ips.push(details.address);
                    }
                });
            }

            return new Promise((resolve, reject) => {
                // XXX(xaiki): we'd need a better way to check what we want
                var options = ipFamily.mach('4') ? {family: 4} :
                    ipFamily.mach('6') ? {family: 6} :
                    {};

                dns.lookup(this.selected.get('address'), options,
                           (err, deviceIp, family) => {
                    if (err) {
                        return reject(err);
                    }

                    console.log('Device IP: ' + deviceIp);
                    console.log('Available IPs: ' + JSON.stringify(ips));
                    var srcIp = _getClosestIP(ips, deviceIp);
                    console.log('%s picked for external playback', srcIp);
                    var smIp = streamModel.get('src');
                    streamModel.set('src', smIp.replace('127.0.0.1', srcIp));
                    return resolve(streamModel);
                });
            });
        }
    });

    var DeviceCollection = Backbone.Collection.extend({
        selected: 'local',
        initialize: function () {
            App.vent.on('device:list', this.list);
            App.vent.on('device:pause', this.pause);
            App.vent.on('device:unpause', this.unpause);
            App.vent.on('device:stop', this.stop);
            App.vent.on('device:forward', this.forward);
            App.vent.on('device:backward', this.backward);
            App.vent.on('device:seek', this.seek);
            App.vent.on('device:seekTo', this.seekTo);
            App.vent.on('device:seekPercentage', this.seekPercentage);
            App.vent.on('device:status:update', this.updateStatus);
            self = this;
        },
        list: function () {
            _.each(self.models, function (device) {
                App.vent.trigger('device:add', device);
            });
        },
        pause: function () {
            self.selected.pause();
        },
        unpause: function () {
            self.selected.unpause();
        },
        stop: function () {
            self.selected.stop();
        },
        forward: function () {
            self.selected.forward();
        },
        backward: function () {
            self.selected.backward();
        },
        seek: function (seconds) {
            self.selected.seekBy(seconds);
        },
        seekTo: function (newCurrentTime) {
            self.selected.seekTo(newCurrentTime);
        },
        seekPercentage: function (percentage) {
            self.selected.seekPercentage(percentage);
        },
        updateStatus: function () {
            self.selected.updateStatus();
        },
        startDevice: function (streamModel) {
            if (!this.selected) {
                this.selected = this.models[0];
            }

            this.selected.setIP(streamModel)
                .then(this.selected.play.bind(this));
        },

        setDevice: function (deviceID) {
            this.selected = this.findWhere({
                id: deviceID
            });
        }
    });

    var collection = new DeviceCollection(new Device());
    collection.setDevice('local');

    var ChooserView = Backbone.Marionette.ItemView.extend({
        template: '#player-chooser-tpl',
        events: {
            'click .playerchoicemenu li a': 'selectPlayer'
        },
        onRender: function () {
            var id = this.collection.selected.get('id').replace('\'', '\\\'');
            var el = $('.playerchoicemenu li#player-' + id + ' a');
            this._selectPlayer(el);
        },
        selectPlayer: function (e) {
            this._selectPlayer($(e.currentTarget));
        },
        _selectPlayer: function (el) {
            var player = el.parent('li').attr('id').replace('player-', '');
            collection.setDevice(player);
            $('.playerchoicemenu li a.active').removeClass('active');
            el.addClass('active');
            $('.imgplayerchoice').attr('src', el.children('img').attr('src'));
        }
    });

    var createChooserView = function (el) {
        return new ChooserView({
            collection: collection,
            el: el
        });
    };

    App.Device = {
        Generic: Device,
        Collection: collection,
        ChooserView: createChooserView
    };
})(window.App);
