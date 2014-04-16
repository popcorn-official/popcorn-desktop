(function(App) {
    "use strict";

    var Settings = Backbone.Marionette.ItemView.extend({
        template: '#settings-container-tpl',
        className: 'settings-container',

        events: {
            'click .close_button': 'closeSettings'
        },

        onShow: function() {
            console.log('Show settings', this.model);
        },

        onClose: function() {},
        showCover: function() {},

        closeSettings: function() {
            App.vent.trigger('settings:close'); 	
        }

    });

    App.View.Settings = Settings;
})(window.App);