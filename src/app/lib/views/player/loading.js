(function(App) {
    "use strict";

    var Loading = Backbone.Marionette.ItemView.extend({
        template: '#loading-tpl',
        className: 'loading',

        ui: {
            stateText: '.state'
        },

        initialize: function() {
            console.log('Loading torrent');
            this.listenTo(this.model, 'state:change', this.onStateUpdate);
        },

        onStateUpdate: function() {
            var state = this.model.get('state');
            console.log('Loading torrent:', state);
            this.ui.stateText.text(i18n.__(state));
        }
    });

    App.View.Loading = Loading;
})(window.App);