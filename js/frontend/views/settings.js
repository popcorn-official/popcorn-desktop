var SettingsTemplate = $('#settings-tpl').html();

App.View.Settings = Backbone.View.extend({
    el: '#settings',
    template: _.template(SettingsTemplate),

    events: {
        'click .closer':           'hide',
        'click .save':             'save',
        'click #settings-download-location-browse': 'browseLocation',
        'click #settings-download-location-value': 'browseLocation',
        'change #settings-download-location-input': 'locationChanged',
        'change input':             'makeDirty'
    },

    getSettingsValue: function () {
        var data = {};
        this.$el.find('input').each(function(i, input) {
            input = $(input);
            data[input.attr('name')] = input.val();
        });
        return data;
    },

    save: function (evt) {
        evt.preventDefault();
        var data = this.getSettingsValue();
        _.extend(App.settings, data);
        App.settings.save();
        this.resetDirty();
    },

    render: function () {
        this.$el.html(this.template(App.settings));
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
        this.render();
        this.resetDirty();
    },

    makeDirty: function () {
        this.$el.find('.save').removeAttr('disabled');
    },

    resetDirty: function () {
        this.$el.find('.save').attr('disabled','disabled');
    },

    browseLocation: function (evt) {
        evt.preventDefault();
        $('#settings-download-location-input').click();
    },

    locationChanged: function (evt) {
        var newLoc = $('#settings-download-location-input').val();
        if(newLoc) {
            $('#settings-download-location-value').text(newLoc);
        }
    }
});
