(function(App) {
    "use strict";
     
    var ShowItem = Backbone.Marionette.ItemView.extend({
        template: '#show-item-tpl',

        tagName: 'li',
        className: 'movie-item',

        ui: {
            coverIamge: '.cover-image',
            cover: '.cover'
        },

        events: {
            'click .cover': 'showDetail'
        },

        onShow: function() {
            this.ui.coverIamge.on('load', _.bind(this.showCover, this));
        },

        onClose: function() {
            this.ui.coverIamge.off('load');
        },

        showCover: function() {
            this.ui.cover.css('background-image', 'url(' + this.model.get('images').poster + ')');
            this.ui.coverIamge.remove();
        },

        // triggered on click only
        showDetail: function() {

            App.db.getTVShow({show_id: this.model.get("_id")}, function(err, data) {
                // we send our DB data to our view
                App.vent.trigger('show:showDetail', new Backbone.Model(data[0]));
                console.log(data[0]);
            });
            
        }

    });

    App.View.ShowItem = ShowItem;
})(window.App);