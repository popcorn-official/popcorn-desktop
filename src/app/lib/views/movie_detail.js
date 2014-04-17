(function(App) {
    "use strict";

    var MovieDetail = Backbone.Marionette.ItemView.extend({
        template: '#movie-detail-tpl',
        className: 'movie-detail',

        events: {
            'click .movie-btn-watch': 'startStreaming',
            'click .movie-detail-close': 'closeDetails'
        },

        onShow: function() {
            console.log('Show movie detail', this.model);
        },

        onClose: function() {},
        showCover: function() {},

        startStreaming: function() {
            var torrents = this.model.get('torrents');
            var torrentUrl = torrents['720p'].url;

            var torrentStart = new Backbone.Model({torrent: torrentUrl, backdrop: this.model.get('backdrop')});

            App.vent.trigger('stream:start', torrentStart);
        },

        closeDetails: function() {
			App.vent.trigger('movie:closeDetail'); 	
        }

    });

    App.View.MovieDetail = MovieDetail;
})(window.App);