'use strict';

var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var WebTorrent = require('webtorrent');
var child = require('child_process');
var crypt = require('crypto');

var SeederTask = function (opt) {
    this.webtorrent = null;
    this.torrentFiles = null;
    this.tmpLocation = opt.tmpLocation;
    this.seedLimit = opt.seedLimit;
    this.connectionLimit = opt.connectionLimit;
    this.trackerAnnouncement = opt.trackerAnnouncement;
    this.torrentDir = path.join(this.tmpLocation, 'TorrentCache');
};

SeederTask.prototype = {
    start: function() {
        if (this.webtorrent) {
            this.stop();
        }

        process.send('Seeding started');

        var seedTorrentFiles = this.seedLimit ?
            _.sample(this.getTorrentFiles(), this.seedLimit) : this.getTorrentFiles();

        seedTorrentFiles.forEach(this.joinSwarm.bind(this));
    },

    stop: function() {
        if (this.webtorrent) {
            this.webtorrent.destroy();
        }

        this.webtorrent = null;
        this.torrentFiles = [];

        process.send('Seeding stopped');
        process.kill();
    },

    getTorrentFiles: function() {
        if (this.torrentFiles === null) {
            var regexp = /\.torrent$/i;
            var files = fs.readdirSync(this.torrentDir);

            this.torrentFiles = files.filter(function(val) {
              return regexp.test(val);
            }).map(function(filename) {
              return path.join(this.torrentDir, filename);
            }, this);
        }

        return this.torrentFiles;
    },

    joinSwarm: function (torrentId) {
        var client = this.getWebTorrentInstance();

        if (!client.get(torrentId)) {
            var torrent = client.add(torrentId, {
              path: this.tmpLocation
            });

            torrent.on('ready', function () {
              process.send(`Seeding ${torrent.name} --- ${torrentId}`);
            });
        }
    },

    append: function(name) {
        var targetFile = path.join(this.torrentDir, this._md5(name) + '.torrent');

        this.torrentFiles.push(targetFile);
        this.seedLimit += 1;
        this.joinSwarm(targetFile);
    },

    _md5: function (arg) {
        return crypt.createHash('md5').update(arg).digest('hex');
    },

    getWebTorrentInstance: function() {
        if (this.webtorrent === null) {
            this.webtorrent = new WebTorrent({
                maxConns: parseInt(this.connectionLimit, 10) || 55,
                tracker: {
                    wrtc: false,
                    announce: this.trackerAnnouncement
                }
            });

            this.webtorrent.on('error', function (error) {
                process.send('WebTorrent fatal error', error);
            });
        }

        return this.webtorrent;
    }
};

var args = JSON.parse(process.argv[2]);
var seederTask = new SeederTask(args);

process.on('message', function (params) {
    if (params.action && seederTask[params.action]) {
        seederTask[params.action].call(seederTask, params.payload);
    } else {
        process.send(`Invalid seederTask function`);
    }
});
