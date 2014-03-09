App.View.MovieList = Backbone.View.extend({
    tagName: 'ul',

    className: 'movie-list',

    constructor: function (options) {
        this.configure(options || {});
        Backbone.View.prototype.constructor.apply(this, arguments);
    },

    configure: function (options) {
        if (this.options) {
            options = _.extend({}, _.result(this, 'options'), options);
        }
        this.options = options;
    },

    initialize: function (options) {
        // Delete old items
        this.$el.children().detach();

        this.collection = App.getTorrentsCollection(options);

        this.collection.fetch();

        this.listenTo(this.collection, 'sync', this.render);
        this.listenTo(this.collection, 'rottenloaded', this.render);
    },

    empty: function () {
        this.$el.append('<div class="no-results">' + i18n.__('noResults') + '</div>');
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
        var $scrollElement = movieList.$el.parent();
        if (!this.options.paginationDisabled){
            $scrollElement.scroll(function(){
                if (!movieList.constructor.busy){
                    var totalSize       = $scrollElement.prop('scrollHeight');
                    var currentPosition = $scrollElement.scrollTop();
                    var scrollBuffer    = (15 / 100) * totalSize;
                    if (currentPosition > 0){
                        currentPosition += $scrollElement.height();
                    }
                    if (currentPosition >= (totalSize - scrollBuffer)){
                        movieList.constructor.busy = true;
                        page++;
                        if (movieList.options.genre){
                            App.Router.navigate('filter/' + movieList.options.genre + '/' + page, { trigger: true });
                        }
                        else {
                            // uncomment this line when the API start accepting the page param to paginate ;)
                            //App.Router.navigate('search/' + movieList.options.keywords + '/' + page, { trigger: true });
                        }
                    }
                }
            });
        }
    }
},{
  busy: false
});
