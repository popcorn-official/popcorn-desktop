(function(App) { 
    "use strict";

    var InitModal = Backbone.Marionette.ItemView.extend({
        template: '#initializing-tpl',
        className: 'init-container',

        ui: {
            initstatus: '.init-status',
            initbar: '#initbar-contents'
        },

        initialize: function() {
            win.info('Loading DB');
        },

        onShow: function() {
            this.ui.initbar.animate({ width: "25%" }, 1000, 'swing');
            this.ui.initstatus.text(i18n.__('Status: Checking Database...'));
        }

    });

    App.View.InitModal = InitModal;
})(window.App);
