(function (App) {
    'use strict';
    var fixer;
    var InitModal = Marionette.View.extend({
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
            win.info('Loaded DB');
        },

        onAttach: function () {
            this.model.on('change', this.updateModal.bind(this));
            this.updateModal();
        },

        updateModal: function () {
            var self = this;

            this.ui.initbar.animate({
                width: this.model.get('done') * 100 + '%'
            }, 1000, 'swing');
            this.ui.initstatus.text(i18n.__('Status: %s ...', this.model.get('status')));

            if (fixer) {
                clearTimeout(fixer);
            }

            fixer = setTimeout(function () {
                self.ui.waitingblock.show();
            }, 7000);
        },

        onBeforeDestroy: function () {
            clearTimeout(fixer);
        },

        fixApp: function (e) {

            e.preventDefault();

            Database.deleteDatabases().then(function () {
                App.vent.trigger('restartButter');
            });
        },

    });

    App.View.InitModal = InitModal;
})(window.App);
