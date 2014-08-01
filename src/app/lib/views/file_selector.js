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
        },

        onShow: function() {
			Mousetrap.bind(['esc','backspace'], function(e) {
                _this.closeSelector(e);
            });
        },


        startStreaming: function(e) {
            var torrent = _this.model.get('torrent');
            var file = parseInt($(e.currentTarget).attr('data-file'));
            var actualIndex = parseInt($(e.currentTarget).attr('data-index'));
            torrent.name = torrent.files[file].name;

            var torrentStart = new Backbone.Model({torrent: torrent, torrent_read: true, file_index: actualIndex});
            App.vent.trigger('stream:start', torrentStart);
            App.vent.trigger('system:closeFileSelector');
        },

        closeSelector: function(e) {
			Mousetrap.bind('backspace', function(e) {
				App.vent.trigger('show:closeDetail');
				App.vent.trigger('movie:closeDetail');
			});
			$('.filter-bar').show();
			$('#header').css('box-shadow', 'none');
			$('#movie-detail').show();
			App.vent.trigger('system:closeFileSelector');
        },
		
		onClose: function() {

		},
		
    });

    App.View.FileSelector = FileSelector;
})(window.App);