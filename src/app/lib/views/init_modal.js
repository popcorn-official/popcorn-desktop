(function (App) {
    'use strict';
    var fixer;
    var InitModal = Backbone.Marionette.ItemView.extend({
        template: '#initializing-tpl',
        className: 'init-container',

        ui: {
            initstatus: '.init-status',
            initbar: '#initbar-contents',
            waitingblock: '#waiting-block'
        },

        events: {
            'click .fixApp': 'fixApp',
        },

        initialize: function () {
            win.info('Loading DB');
        },

        onShow: function () {
            var self = this;

            this.ui.initbar.animate({
                width: '25%'
            }, 1000, 'swing');
            this.ui.initstatus.text(i18n.__('Status: Checking Database...'));

            fixer = setTimeout(function () {
                self.ui.waitingblock.show();
            }, 7000);
        },

        onDestroy: function () {
            clearTimeout(fixer);
        },

        fixApp: function (e) {

            e.preventDefault();

            var cache = new App.Cache('subtitle');
            cache.flushTable()
                .then(Database.deleteDatabases)
                .then(function () {
                    App.vent.trigger('restartPopcornTime');
                });

        },

    });

    App.View.InitModal = InitModal;
})(window.App);
