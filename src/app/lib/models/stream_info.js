(function(App) {
    "use strict";

    var StreamInfo = Backbone.Model.extend({
        updateStats: function() {
			var active = function(wire) {return !wire.peerChoking;};
            var swarm = this.get('engine').swarm;
            var BUFFERING_SIZE = 10 * 1024 * 1024;

            this.set('downloaded', swarm.downloaded);
            this.set('active_peers', swarm.wires.filter(active).length);
            this.set('total_peers', swarm.wires.length);
            
            swarm.download = (swarm.download) ? swarm.download : 0;
            this.set('percent', (swarm.downloaded / (BUFFERING_SIZE / 100)));
        }
    });

    App.Model.StreamInfo = StreamInfo;
})(window.App);