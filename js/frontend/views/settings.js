var SettingsTemplate = $('#settings-tpl').html();

App.View.Settings = Backbone.View.extend({
    el: $('#settings'),
    template: _.template(SettingsTemplate),

    events: {
        'click .closer':           'hide',
        'click .save':             'save'
    },

    save: function (evt) {
        evt.preventDefault();
    },

    initialize: function() {
        this.model = {test: 'asd'};
        this.render();
    },

    render: function () {
        this.$el.html(this.template(this.model));
        this.show();
    },

    isVisible: function () {
        return !this.$el.is('.hidden');
    },

    hide: function () {
        $('body').removeClass('sidebar-open');
        this.$el.addClass('hidden');
    },

    show: function () {
        $('body').removeClass().addClass('sidebar-open');
        this.$el.removeClass('hidden');
    }
});
