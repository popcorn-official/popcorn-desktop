(function (App) {
    'use strict';

    var StreamInfo = Backbone.Model.extend({
        initialize: function () {

            this.on('change:size', function () {
                this.set('sizeFormatted', Common.fileSize(this.get('size')));
            }.bind(this));

            this.set('size', 0);
        },

        selectFile: function () {

            var torrentModel = this.get('torrentModel'),
                torrent = torrentModel.get('torrent'),
                size = 0;

            if (torrentModel.get('file_index')) {
                size = torrent.files[torrentModel.get('file_index')].length;
            } else {
                torrent.files.forEach(function (file) {
                    size += file.length;
                });
            }

            var videoFile = _.max(torrent.files, function (file) {
                return file.length;
            });

            this.set('videoFile', path.join(torrent.path, videoFile.path));
            this.set('size', size);
        },

        updateStats: function () {

            var torrentModel = this.get('torrentModel'),
                torrent = torrentModel.get('torrent');

            var BUFFERING_SIZE = 10 * 1024 * 1024;
            var converted_speed = 0;
            var converted_downloaded = 0;
            var buffer_percent = 0;

            var upload_speed = torrent.uploadSpeed; // upload speed
            var final_upload_speed = Common.fileSize(0) + '/s';
            if (!isNaN(upload_speed) && upload_speed !== 0) {
                final_upload_speed = Common.fileSize(upload_speed) + '/s';
            }

            var download_speed = torrent.downloadSpeed; // download speed
            var final_download_speed = Common.fileSize(0) + '/s';
            if (!isNaN(download_speed) && download_speed !== 0) {
                final_download_speed = Common.fileSize(download_speed) + '/s';
            }

            var downloaded = torrent.downloaded || 0; // downloaded

            var final_downloaded = Common.fileSize(0);
            var final_downloaded_percent = 0;
            if (downloaded !== 0) {
                final_downloaded = Common.fileSize(downloaded);
                final_downloaded_percent = torrent.progress * 100; //100 / this.get('size') * downloaded;
            }

            if (final_downloaded_percent >= 100) {
                final_downloaded_percent = 100;
            }

            var downloadTimeLeft = parseInt(torrent.timeRemaining / 1000, 10); // time to wait before download complete
            if (isNaN(downloadTimeLeft) || downloadTimeLeft < 0) {
                downloadTimeLeft = 0;
            } else if (!isFinite(downloadTimeLeft)) { // infinite
                downloadTimeLeft = undefined;
            }

            this.set('pieces', 0);
            this.set('downloaded', downloaded);
            this.set('active_peers', torrent.numPeers);
            this.set('total_peers', torrent.numPeers);

            var title = torrentModel.get('title');
            if (title !== '') {
                this.set('title', title);
            }

            this.set('uploadSpeed', final_upload_speed); // variable for Upload Speed
            this.set('downloadSpeed', final_download_speed); // variable for Download Speed
            this.set('downloadedFormatted', final_downloaded); // variable for Downloaded
            this.set('downloadedPercent', final_downloaded_percent); // variable for Downloaded percentage
            this.set('time_left', downloadTimeLeft); // variable for time left before 100% downloaded

            buffer_percent = downloaded / (BUFFERING_SIZE / 100);
            if (buffer_percent >= 100) {
                buffer_percent = 99; // wait for subtitles
            }
            this.set('buffer_percent', buffer_percent);
        }
    });

    App.Model.StreamInfo = StreamInfo;
})(window.App);
