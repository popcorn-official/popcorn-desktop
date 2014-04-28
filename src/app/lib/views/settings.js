(function(App) {
    "use strict";

    var Settings = Backbone.Marionette.ItemView.extend({
        template: '#settings-container-tpl',
        className: 'settings-container-contain',

        ui: {
            success_alert: '.success_alert'
        },

        events: {
            'click .settings-container-close': 'closeSettings',
            'change select,input': 'saveSetting',
        },

        onBeforeRender: function() {
            var that = this;
            
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
        },


        saveSetting: function(e){
            var that = this;
            var value = false;
            var data = {};

            // get active field
            var field = $(e.currentTarget);
            
            // get right value
            if(field.is('input')) 
                value = field.val();
            else 
                value = $("option:selected", field).val();

            // update active model
            data[field.attr('name')] = value;
            this.model.set(data);

            //save to db
            App.db.writeSetting({key: field.attr('name'), value: value}, function() {
                that.ui.success_alert.show();
            });
        }


    });

    App.View.Settings = Settings;
})(window.App);

