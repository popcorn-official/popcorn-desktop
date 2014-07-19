(function(App) {
    'use strict';

    var _this;
    var FileSelector = Backbone.Marionette.ItemView.extend({
        template: '#file-selector-tpl',
        className: 'file-selector',

        events: {
            'click .close-icon': 'closeSelector',
            'click .file-item': 'startStreaming'
        },

        initialize: function() {
            _this = this;
            Mousetrap.bind('esc', function(e) {
                _this.closeSelector(e);
            });
        },

        onShow: function() {

        },


        startStreaming: function(e) {
            var torrent = _this.model.get('torrent');
            var file = parseInt($(e.currentTarget).attr('data-file'));
            var actualIndex = parseInt($(e.currentTarget).attr('data-index'));
            torrent.name = torrent.files[file].name;

            var torrentStart = new Backbone.Model({torrent: torrent, torrent_read: true, file_index: actualIndex});
            App.vent.trigger('stream:start', torrentStart);
            _this.closeSelector(e);
        },

        closeSelector: function(e) {
            e.preventDefault();
            App.vent.trigger('system:closeFileSelector');
        },

    });

    App.View.FileSelector = FileSelector;
})(window.App);
    
