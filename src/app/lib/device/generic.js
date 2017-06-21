(function (App) {
    'use strict';

    var self;
    var dns = require('dns'),
        os = require('os');

    var IP_FAMILY_ENUM = {
        ALL: '.*',
        IPV4: 'IPv4',
        IPV6: 'IPv6'
    };

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
            ipFamily: IP_FAMILY_ENUM.ALL,
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
                ipFamily = this.get('ipFamily') || Device.prototype.defaults.ipFamily;
            /* build a list of all local machine IPs
             * that belong to the desired family
             */
            for (var dev in ifaces) {
                ifaces[dev].forEach(details => {
                    if (!details.internal && details.family.match(ipFamily)) {
                        ips.push(details.address);
                    }
                });
            }

            /* resolve the IPv4 or IPv6 of the target device and then
             * choose the best-matching local machine IP for our streaming URL,
             * so that the device can connect to us via the same network.
             */
            return new Promise(function (resolve, reject) {
                // XXX(xaiki): we'd need a better way to check what we want
                var options =
                    ipFamily === IP_FAMILY_ENUM.IPV4 ? {family: 4} :
                    ipFamily === IP_FAMILY_ENUM.IPV6 ? {family: 6} :
                    {};

                dns.lookup(this.get('address'), options,
                           function (err, deviceIp, family) {
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
                }.bind(this));
            }.bind(this));
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

            ['play', 'pause', 'unpause', 'stop',
             'forward', 'backward',
             'seek', 'seekTo', 'seekPercentage',
             'updateStatus'].forEach(cmd => {
                this[cmd] = function () {
                    self.selected[cmd].apply(self.selected, arguments);
                };
            });
        },
        list: function () {
            _.each(self.models, function (device) {
                App.vent.trigger('device:add', device);
            });
        },
        startDevice: function (streamModel) {
            if (!this.selected) {
                this.selected = this.models[0];
            }

            this.selected.setIP(streamModel)
                .then(this.play.bind(this));
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
        ChooserView: createChooserView,
        IP_FAMILY: IP_FAMILY_ENUM
    };
})(window.App);
