(function (App){
    'use strict';

    App.View.LangDropdown = Marionette.View.extend({
        template: '#lang-dropdown-tpl',
        ui: {
            selected: '.selected-lang',
        },
        events: {
            'click .flag-icon': 'closeDropdown',
        },

        initialize: function () {
            var self = this;

            this.type = this.model.get('type');
            this.selected = this.model.get('selected');
            this.values = this.model.get('values');
            this.hasNull = this.model.get('hasNull');

            if (this.hasNull) {
                this.values = Object.assign({}, {none: undefined}, this.values);
                this.model.set('values', this.values);
            } else if (!this.selected && this.values) {
                var values = Object.keys(this.values);
                if (values.length) {
                    this.selected = values.pop();
                }
            }
        },

        onAttach: function () {
            if (this.selected && this.selected !== 'none') {
                this.setLang(this.selected);
            }
        },

        updateLangs: function (newLangs) {
            if (this.hasNull) {
                newLangs = Object.assign({}, {none: undefined}, newLangs);
            }
            this.model.set('values', newLangs);
            this.values = newLangs;
            this.render();
        },

        setLang: function (value) {
            console.log(value);
            this.model.set('selected', value);
            this.ui.selected.removeClass().addClass('flag toggle selected-lang').addClass(value);
            App.vent.trigger(this.type + ':lang', value);
        },

        closeDropdown: function (e) {
            var value = $(e.currentTarget).attr('data-lang');

            if (value) {
                this.setLang(value);
            }
        },
    });
})(window.App);
