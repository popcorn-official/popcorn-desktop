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
        
            // Only append not yet appended elements
            this.view.render();
            var $el = this.view.$el;
            var $currentEl = that.$el.find('#movie-'+ this.get('imdb') );
            if ( ! $currentEl.length ) {
                $el.find('img').addClass('hidden').load(function(){
                    $(this).removeClass('hidden');
                });
            
                that.$el.append($el);
                
                setTimeout(function () {
                    $el.addClass('loaded');
                }, 50);
            }
            
            // Check for IMDB id and also image loaded (required for view)
            if (this.get('loaded') && ! $el.hasClass('fullyLoaded')) {
            
                $el.addClass('fullyLoaded');
                
                var $newCover = $('<img src="' + this.get('image') + '" class="real hidden" alt="' + this.get('title') + '" />');
                
                $newCover.load(function(){
                  $currentEl.find('.cover img.placeholder').addClass('hidden');
                  $currentEl.find('.cover').append( $newCover );
                  
                  setTimeout(function(){
                    $newCover.removeClass('hidden');
                  }, 50);
                });
            }
            
        });
    }
});