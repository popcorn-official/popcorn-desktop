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
        alert(i18n.__('noResults'));
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


        var movieList = this;

        $.each(this.collection.models, function () {

            // Only append not yet appended elements
            this.view.render();
            var $movie = this.view.$el;
            var $currentEl = movieList.$el.find('#movie-'+ this.get('imdb') );

            if ( ! $currentEl.length ) {
                $movie.appendTo(movieList.$el);
                $currentEl = $movie;

                setTimeout(function () {
                    $movie.addClass('loaded');
                }, 50);
            }

            // Check for IMDB id and also image loaded (required for view)
            // We can also check if the subtitles loaded with this.get('subtitlesLoaded')
            if (this.get('infoLoaded') && ! $movie.hasClass('fullyLoaded')) {

                $movie.addClass('fullyLoaded');

                var $newCover = $('<img src="' + this.get('image') + '" class="real hidden" alt="' + this.get('title') + '" />');
                $currentEl.find('.cover').append( $newCover );

                $newCover.load(function(){
                    $(this).removeClass('hidden');
                });
            }


        });

        var page           = 1;
        var genre          = $('#catalog-select ul li.active a').attr('data-genre');
        var $scrollElement = movieList.$el.parent();
        if (genre != 'all'){
            $scrollElement.scroll(function(){
                if (!movieList.constructor.busy){
                    var totalSize       = $scrollElement.prop('scrollHeight');
                    var currentPosition = $scrollElement.scrollTop() + $scrollElement.height();
                    var scrollBuffer    = (15 / 100) * totalSize;
                    if (currentPosition >= (totalSize - scrollBuffer)){
                        movieList.constructor.busy = true;
                        page++;
                        App.Router.navigate('filter/' + genre + '/' + page, { trigger: true });
                    }
                }
            });
        }
    }
},{
  busy: false
});
