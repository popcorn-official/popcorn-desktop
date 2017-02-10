(function (App) {

    var Seeder = function () {
        this.worker = null;
    };

    Seeder.prototype = {
        start: function() {
            this.getWorkerInstance().send({action: 'start'});
        },

        stop: function() {
            this.getWorkerInstance().send({action: 'stop'});
            this.worker.kill();
            this.worker = null;
        },

        append: function(torrent) {
            this.getWorkerInstance().send({action: 'append', payload: torrent.name});
        },

        save: function(torrent) {
            var targetFile = path.join(App.settings.tmpLocation, 'TorrentCache', Common.md5(torrent.name) + '.torrent');
            var wstream = fs.createWriteStream(targetFile);

            wstream.write(torrent.torrentFile);
            wstream.end();
        },

        getWorkerInstance: function () {
            if (this.worker === null) {
                var taskFile = 'src/app/lib/workers/seederTask.js';
                // TODO: AdvSettings here should be trigger creation of worker instance
                var args = JSON.stringify({
                    connectionLimit: Settings.connectionLimit,
                    trackerAnnouncement: Settings.trackers.forced,
                    tmpLocation: App.settings.tmpLocation,
                    seedLimit: Settings.seedLimit
                });

                this.worker = child.fork(taskFile, [args], {silent: true, execPath:'node'});

                this.worker.on('disconnect', function(msg) {
                    win.info('Seeder worker: disconnect');
                });

                this.worker.on('exit', function(msg) {
                    win.info('Seeder worker: exit');
                });

                this.worker.on('message', function(msg) {
                    win.info(msg);
                });
            }

            return this.worker;
        }
    };

    var seeder = new Seeder();

    App.vent.on('seed:start', seeder.start.bind(seeder));
    App.vent.on('seed:stop', seeder.stop.bind(seeder));
    App.vent.on('seed:save', seeder.save.bind(seeder));
    App.vent.on('seed:append', seeder.append.bind(seeder));

})(window.App);
