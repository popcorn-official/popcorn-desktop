(function (App) {
    'use strict';

    var StreamInfo = Backbone.Model.extend({
      updateInfos: function () {
          var torrentModel = this.get('torrentModel');

          this.set({
              title: torrentModel.get('title'),
              filename: torrentModel.get('video_file').name,
              device: torrentModel.get('device'),
              quality: torrentModel.get('quality'),
              defaultSubtitle: torrentModel.get('defaultSubtitle'),
              subtitle: torrentModel.get('subtitle'),
              videoFile: torrentModel.get('video_file').path,
              size: torrentModel.get('video_file').size,
              poster: torrentModel.get('poster'),
              backdrop: torrentModel.get('backdrop'),
              tvdb_id: torrentModel.get('tvdb_id'),
              imdb_id: torrentModel.get('imdb_id'),
              episode_id: torrentModel.get('episode_id'),
              episode: torrentModel.get('episode'),
              season: torrentModel.get('season')
          });
      },
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

    var downloaded = torrent.files[torrentModel.get('video_file').index].downloaded || 0; // downloaded


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
        downloadedPercent: (final_downloaded_percent || 0),
        time_left: downloadTimeLeft,
    });
}

    });

    App.Model.StreamInfo = StreamInfo;
})(window.App);
