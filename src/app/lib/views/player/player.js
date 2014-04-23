(function(App) {
    "use strict";

    var Player = Backbone.Marionette.ItemView.extend({
        template: '#player-tpl',
        className: 'player',

        ui: {
            downloadSpeed: '.download_speed_player',
            uploadSpeed: '.upload_speed_player'
        },

        events: {
            'click .close-info-player': 'closePlayer'
        },        

        initialize: function() {
            console.log('Show player');
            this.listenTo(this.model, 'change:downloadSpeed', this.updateDownloadSpeed);
            this.listenTo(this.model, 'change:uploadSpeed', this.updateUploadSpeed);
        },

        updateDownloadSpeed: function() {
            this.ui.downloadSpeed.text(this.model.get('downloadSpeed') + '/ s');
        },

        updateUploadSpeed: function() {
            this.ui.uploadSpeed.text(this.model.get('uploadSpeed') + '/ s');
        },

        closePlayer: function() {
            console.log('Close player');
            App.vent.trigger('player:close');  
        },

        onShow: function() {
        },

        onClose: function() {
            App.vent.trigger('stream:stop');            
        }
    });

    App.View.Player = Player;
})(window.App);