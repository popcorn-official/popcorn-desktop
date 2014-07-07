(function(App) {
    'use strict';

    var StreamInfo = Backbone.Model.extend({
        updateStats: function() {
            var active = function(wire) {return !wire.peerChoking;};
            var engine = this.get('engine');
            var swarm = engine.swarm;
            var BUFFERING_SIZE = 10 * 1024 * 1024;
            var converted_speed = 0;
            var percent = 0;

            var upload_speed = swarm.uploadSpeed(); // upload speed
            var final_upload_speed = '0 B/s';
            if(!isNaN(upload_speed) && upload_speed !== 0){
                converted_speed = Math.floor( Math.log(upload_speed) / Math.log(1024) );
                final_upload_speed = ( upload_speed / Math.pow(1024, converted_speed) ).toFixed(2) + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][converted_speed]+'/s';
            }

            var download_speed = swarm.downloadSpeed(); // download speed
            var final_download_speed = '0 B/s';
            if(!isNaN(download_speed) && download_speed !== 0){
                converted_speed = Math.floor( Math.log(download_speed) / Math.log(1024) );
                final_download_speed = ( download_speed / Math.pow(1024, converted_speed) ).toFixed(2) + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][converted_speed]+'/s';
            }

            this.set('pieces', swarm.piecesGot);
            this.set('downloaded', swarm.downloaded);
            this.set('active_peers', swarm.wires.filter(active).length);
            this.set('total_peers', swarm.wires.length);

            this.set('uploadSpeed', final_upload_speed); // variable for Upload Speed
            this.set('downloadSpeed', final_download_speed); // variable for Download Speed

            swarm.downloaded = (swarm.downloaded) ? swarm.downloaded : 0;
            percent = swarm.downloaded / (BUFFERING_SIZE / 100);
            if(percent >= 100) {
                percent = 99; // wait for subtitles
            }
            this.set('percent', percent);
        }
    });

    App.Model.StreamInfo = StreamInfo;
})(window.App);
