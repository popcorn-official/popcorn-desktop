(function(App) {
    "use strict";
        

    var ShowDetail = Backbone.Marionette.ItemView.extend({
        template: '#show-detail-tpl',
        className: 'shows-container-contain',

        events: {
            'click .startStreaming': 'startStreaming',
            'click .tv-container-close': 'closeDetails'
        },

        onShow: function() {
            console.log('Show serie detail', this.model);

            var torrents = this.model.get('torrents');
        },

        onClose: function() {},
        showCover: function() {},

        startStreaming: function(e) {

            var torrentStart = new Backbone.Model({torrent: $(e.currentTarget).attr('data-torrent'), backdrop: this.model.get('backdrop')});
            App.vent.trigger('stream:start', torrentStart);
        },

        closeDetails: function() {
			App.vent.trigger('show:closeDetail'); 	
        },



    });

    App.View.ShowDetail = ShowDetail;
})(window.App);