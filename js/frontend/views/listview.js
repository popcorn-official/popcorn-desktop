App.View.MovieList = Backbone.View.extend({
    tagName: 'ul',

    className: 'movie-list',

    initialize: function (options) {
        // Delete old items
        this.$el.children().detach();

        this.collection = App.getTorrentsCollection(options);

        this.collection.fetch();

        this.listenTo(this.collection, 'sync', this.render);
        this.listenTo(this.collection, 'rottenloaded', this.render);
    },

    empty: function () {
        alert(Language.noResults);
        App.Page.Home.show();
        return false;
    },

    render: function () {

        if( window.initialLoading ) {
            App.loader(false);
        }

        if (this.collection.length === 0) {
            return this.empty();
        }

        var that = this;

        $.each(this.collection.models, function () {
            // Check for IMDB id and also image loaded (required for view)
            if (this.get('image') && this.get('imdb')) {
                var $el = this.view.$el;

                // Only append not yet appended elements
                if (!that.$el.find($el).length) {
                    that.$el.append($el);
                    setTimeout(function () {
                        $el.addClass('loaded');
                    }, 50);
                }
            }
        });
    }
});