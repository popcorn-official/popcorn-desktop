(function(App) {
    "use strict";

    var StreamInfo = Backbone.Model.extend({
        updateStats: function() {
			var active = function(wire) {return !wire.peerChoking;};
            var swarm = this.get('engine').swarm;
            this.set('downloaded', swarm.downloaded);
            this.set('active_peers', swarm.wires.filter(active).length);
            this.set('total_peers', swarm.wires.length);
        }
    });

    App.Model.StreamInfo = StreamInfo;
})(window.App);