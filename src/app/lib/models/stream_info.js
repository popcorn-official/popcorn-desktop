(function(App) {
    "use strict";

    var StreamInfo = Backbone.Model.extend({
        updateStats: function() {
			var active = function(wire) {return !wire.peerChoking;};
			var swarm = this.get('engine').swarm;
			var BUFFERING_SIZE = 10 * 1024 * 1024;
			//algorithm for translate the speed
			var speed = swarm.downloadSpeed();
				var converted_speed = Math.floor( Math.log(speed) / Math.log(1024) );
    					var final_speed = ( speed / Math.pow(1024, converted_speed) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][converted_speed];
    					
			this.set('downloaded', swarm.downloaded);
			this.set('active_peers', swarm.wires.filter(active).length);
			this.set('total_peers', swarm.wires.length);
			
			this.set('downloadSpeed', final_speed);
			
			swarm.downloaded = (swarm.downloaded) ? swarm.downloaded : 0;
			this.set('percent', (swarm.downloaded / (BUFFERING_SIZE / 100)));
            
        }
    });

    App.Model.StreamInfo = StreamInfo;
})(window.App);
