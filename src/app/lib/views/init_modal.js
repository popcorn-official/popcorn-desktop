(function(App) {
    "use strict";

    var InitModal = Backbone.Marionette.ItemView.extend({
        template: '#initializing-tpl',
        className: 'loading',

        initialize: function() {
            console.log('Loading DB');
        },

        onShow: function() {}

    });

    App.View.InitModal = InitModal;
})(window.App);
