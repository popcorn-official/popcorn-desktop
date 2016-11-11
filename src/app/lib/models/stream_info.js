(function (App) {
    'use strict';

    var StreamInfo = Backbone.Model.extend({
        initialize: function () {},

        updateStats: function () {
            var torrentModel = this.get('torrentModel'),
                torrent = torrentModel.get('torrent');

            var converted_speed = 0;
            var converted_downloaded = 0;

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
            //TODO: once https://github.com/feross/webtorrent/pull/974 is merged, rather use below code:
            //var downloaded = torrent.files[torrentModel.get('video_file').index].downloaded || 0; // downloaded


            var final_downloaded = Common.fileSize(0);
            var final_downloaded_percent = 0;
            if (downloaded !== 0) {
                final_downloaded = Common.fileSize(downloaded);
                final_downloaded_percent = 100 / this.get('size') * downloaded;
            }

            if (final_downloaded_percent >= 100) {
                final_downloaded_percent = 100;
            }

            var downloadTimeLeft = Math.round((this.get('size') - downloaded) / torrent.downloadSpeed); // time to wait before download complete
            if (isNaN(downloadTimeLeft) || downloadTimeLeft < 0) {
                downloadTimeLeft = 0;
            } else if (!isFinite(downloadTimeLeft)) { // infinite
                downloadTimeLeft = undefined;
            }

            this.set({
                pieces: 0,
                downloaded: downloaded,
                active_peers: torrent.numPeers,
                total_peers: torrent.numPeers,
                uploadSpeed: final_upload_speed,
                downloadSpeed: final_download_speed,
                downloadedFormatted: final_downloaded,
                downloadedPercent: final_downloaded_percent,
                time_left: downloadTimeLeft,
            });
        }
    });

    App.Model.StreamInfo = StreamInfo;
})(window.App);
