var SettingsTemplate = $('#settings-tpl').html();

var checkboxToBool = function (val) {
    return val === 'on'?true:false;
};

App.View.Settings = Backbone.View.extend({
    el: '#settings',
    template: _.template(SettingsTemplate),

    events: {
        'click .closer':           'hide',
        'click .save':             'save',
        'click #settings-cacheLocation-browse': 'browseLocation',
        'click #settings-cacheLocation-value': 'browseLocation',
        'change #settings-cacheLocation-input': 'locationChanged',
        'change input':             'makeDirty'
    },

    getSettingsValue: function () {
        var data = {};

        var checked = this.$el.find('input[type=checkbox]').each(function(i, input){
            input = $(input);
            data[input.attr('name')] = input.is(':checked');
        });

        this.$el.find('input').not(checked).each(function(i, input) {
            input = $(input);
            data[input.attr('name')] = input.val();
        });

        this.$el.find('input[not_empty]').each(function(i, input) {
            input = $(input);
            if(_.isEmpty(input.val())) {
                delete data[input.attr('name')];
            }
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
        $('#settings-cacheLocation-input').click();
    },

    locationChanged: function (evt) {
        var newLoc = $('#settings-cacheLocation-input').val();
        if(newLoc) {
            $('#settings-cacheLocation-value').text(newLoc);
        }
    }
});
