(function (App){
    'use strict';

    App.View.LangDropdown = Backbone.Marionette.ItemView.extend({
        template: '#lang-dropdown-tpl',
        ui: {
            selected: '.selected-lang',
        },
        events: {
            'click .dropdown': 'toggleDropdown',
            'click .flag-icon': 'closeDropdown',
        },

        initialize: function () {
            this.type = this.model.get('type');
            this.handler = this.model.get('handler');
            this.selected = this.model.get('selected') || 'none';
        },
        onShow: function () {
            if (this.selected !== 'none') {
                console.log ('got lang', this.selected)
                this.setLang(this.selected)
            }

        },
        setLang: function (value) {
            console.log ('setting to', value);
            this.model.set('selected', value);
            this.ui.selected.removeClass().addClass('flag toggle selected-lang').addClass(value);
            App.vent.trigger(this.type + ':lang', value);
            this.handler(value);
        },
        toggleDropdown: function (e) {
            console.log ('dropdown-container', this);
            var el = $(this.el);
            if (el.find('.dropdown-container').is('.open')) {
                this.closeDropdown(e);
            } else {
                el.find('.dropdown-container').addClass('open');
                el.find('.dropdown-arrow').addClass('down');
            }
        },

        closeDropdown: function (e) {
            e.preventDefault();
            var el = $(this.el);
            el.find('.dropdown-container').removeClass('open');
            el.find('.dropdown-arrow').removeClass('down');

            var value = $(e.currentTarget).attr('data-lang');

            if (value) {
                this.setLang(value)
            }
        },
    });
})(window.App);
