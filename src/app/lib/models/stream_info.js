(function(App) {
    "use strict";

    var StreamInfo = Backbone.Model.extend({
        updateStats: function() {
			var active = function(wire) {return !wire.peerChoking;};
			var swarm = this.get('engine').swarm;
			var BUFFERING_SIZE = 10 * 1024 * 1024;
			//algorithm for translate the speed
			var speed_upload = swarm.uploadSpeed(); //upload speed
			speed_upload = (isNaN(speed_upload) || speed_upload === undefined) ? 0 : speed_upload;
			var converted_upload_speed = Math.floor( Math.log(speed_upload) / Math.log(1024) );
			var final_upload_speed = ( speed_upload / Math.pow(1024, converted_upload_speed) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][converted_upload_speed];
			
			var speed = swarm.downloadSpeed(); // download speed
			speed = (isNaN(speed) || speed === undefined) ? 0 : speed;
			var converted_speed = Math.floor( Math.log(speed) / Math.log(1024) );
			var final_speed = ( speed / Math.pow(1024, converted_speed) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][converted_speed];
			    
			this.set('downloaded', swarm.downloaded);
			this.set('active_peers', swarm.wires.filter(active).length);
			this.set('total_peers', swarm.wires.length);

			this.set('uploadSpeed', final_upload_speed); // variable for Upload Speed
			this.set('downloadSpeed', final_speed); // variable for Download Speed

			swarm.downloaded = (swarm.downloaded) ? swarm.downloaded : 0;
			this.set('percent', (swarm.downloaded / (BUFFERING_SIZE / 100)));
        }
    });

    App.Model.StreamInfo = StreamInfo;
})(window.App);
