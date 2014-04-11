(function(App) {
    "use strict";

    var Loading = Backbone.Marionette.ItemView.extend({
        template: '#loading-tpl',
        className: 'loading',

        ui: {
            stateText: '.text',
            progressText: '.value'
        },

        initialize: function() {
            console.log('Loading torrent');
            this.listenTo(this.model, 'change:state', this.onStateUpdate);
        },

        onStateUpdate: function() {
            var state = this.model.get('state');
            console.log('Loading torrent:', state);

            this.ui.stateText.text(i18n.__(state));

            if(state === 'downloading') {
                this.listenTo(this.model.get('streamInfo'), 'change:downloaded', this.onProgressUpdate);
            }
        },

        onProgressUpdate: function() {
            var streamInfo = this.model.get('streamInfo');
            var downloaded = streamInfo.get('downloaded')/(1024 * 1024);
            this.ui.progressText.text(downloaded.toFixed(2) + ' Mo');
        }
    });

    App.View.Loading = Loading;
})(window.App);