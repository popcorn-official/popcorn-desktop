(function(App) {
    "use strict";

    var StreamInfo = Backbone.Model.extend({
        updateStats: function() {
            var swarm = this.get('engine').swarm;
            this.set('downloaded', swarm.downloaded);
        }
    });

    App.Model.StreamInfo = StreamInfo;
})(window.App);