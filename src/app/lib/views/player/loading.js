(function(App) {
    "use strict";

    var Loading = Backbone.Marionette.ItemView.extend({
        template: '#loading-tpl',
        className: 'loading',

        ui: {
            stateTextDownload: '.text_download',
            progressTextDownload: '.value_download',

            stateTextPeers: '.text_peers',
            progressTextPeers: '.value_peers',

            stateTextSeeds: '.text_seeds',
            progressTextSeeds: '.value_seeds',

            seedStatus: '.seed_status'
        },

        events: {
            'click .close_button': 'cancelStreaming'
        },        

        initialize: function() {
            console.log('Loading torrent');
            this.listenTo(this.model, 'change:state', this.onStateUpdate);
        },

        onStateUpdate: function() {
            var state = this.model.get('state');
            console.log('Loading torrent:', state);

            this.ui.stateTextDownload.text(i18n.__(state));

            if(state === 'downloading') {
                this.listenTo(this.model.get('streamInfo'), 'change:downloaded', this.onProgressUpdate);
            }
        },

        onProgressUpdate: function() {

            // TODO: Translate peers / seeds in the template
            this.ui.seedStatus.show();

            var streamInfo = this.model.get('streamInfo');
            var downloaded = streamInfo.get('downloaded')/(1024 * 1024);
            this.ui.progressTextDownload.text(downloaded.toFixed(2) + ' Mo');

            this.ui.progressTextPeers.text(streamInfo.get('active_peers'));
            this.ui.progressTextSeeds.text(streamInfo.get('total_peers'));
        },

        cancelStreaming: function() {
            App.vent.trigger('stream:stop');
            App.vent.trigger('player:close');  
        }        
    });

    App.View.Loading = Loading;
})(window.App);