(function(App) {
    "use strict";

    var Settings = Backbone.Marionette.ItemView.extend({
        template: '#settings-container-tpl',
        className: 'settings-container-contain',

        events: {
            'click .settings-container-close': 'closeSettings'
        },

        onShow: function() {
            console.log('Show settings', this.model);
            $("#nav-filters").hide();
            $("#movie-detail").hide();
            
        },

        onClose: function() {
            $("#nav-filters").show();
            $("#movie-detail").show();
        },
        showCover: function() {},

        closeSettings: function() {
            App.vent.trigger('settings:close'); 	
        }

    });

    App.View.Settings = Settings;
})(window.App);