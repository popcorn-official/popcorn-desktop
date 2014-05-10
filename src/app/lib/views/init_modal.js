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
            console.log('Loading DB');

            
        },

        onShow: function() {
            this.ui.initbar.css('width', '1%');
            this.ui.initstatus.text('Status: Checking DB');
        }

    });

    App.View.InitModal = InitModal;
})(window.App);
