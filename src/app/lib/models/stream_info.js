(function(App) {
    "use strict";

    var StreamInfo = Backbone.Model.extend({

        initialize: function(attributes, options) {
            var engine = options.engine;
            this.set('src', 'http://127.0.0.1:' + engine.server.address().port + '/');
        }

    });

    App.Model.StreamInfo = StreamInfo;
})(window.App);