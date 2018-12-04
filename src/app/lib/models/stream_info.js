(function (App) {
    'use strict';

    var StreamInfo = Backbone.Model.extend({
        updateInfos: function () {
            var torrentModel = this.get('torrentModel');

            this.set({
                title: torrentModel.get('title'),
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
                season: torrentModel.get('season'),
                pieces: 0,
                downloaded: torrentModel.get('downloaded'),
                active_peers: torrentModel.get('active_peers'),
                total_peers: torrentModel.get('total_peers'),
                uploadSpeed: torrentModel.get('uploadSpeed'),
                downloadSpeed: torrentModel.get('downloadSpeed'),
                downloadedFormatted: torrentModel.get('downloadedFormatted') || 0,
                downloadedPercent: torrentModel.get('downloadedPercent') || 0,
                time_left: torrentModel.get('time_left'),

            });
        }
    });

    App.Model.StreamInfo = StreamInfo;
})(window.App);
