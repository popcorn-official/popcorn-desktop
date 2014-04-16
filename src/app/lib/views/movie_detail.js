(function(App) {
    "use strict";

    var MovieDetail = Backbone.Marionette.ItemView.extend({
        template: '#movie-detail-tpl',
        className: 'movie-detail',

        events: {
            'click .play_button': 'startStreaming',
            'click .close_button': 'closeDetails'
        },

        onShow: function() {
            console.log('Show movie detail', this.model);
        },

        onClose: function() {},
        showCover: function() {},

        startStreaming: function() {
            var torrents = this.model.get('torrents');
            var torrentUrl = torrents['720p'].url;
            App.vent.trigger('stream:start', torrentUrl);
        },

        closeDetails: function() {
			App.vent.trigger('movie:closeDetail'); 	
        }

    });

    App.View.MovieDetail = MovieDetail;
})(window.App);