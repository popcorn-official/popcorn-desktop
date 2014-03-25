App.View.MovieList = Backbone.View.extend({
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
        // Bind element on existing list
        $('.load-more').remove();
        this.$el = $('.movie-list').first();

        this.listenTo(this.model, 'loaded', this.render);
        this.listenTo(this.model, 'error', this.error);
    },

    error: function() {
        App.loader(false);
        // Todo: Translate `Error`
        this.$el.append('<div class="no-results">Error loading data from YTS, try again later</div>');
        return false;
    },

    empty: function () {
        this.$el.append('<div class="no-results">' + i18n.__('noResults') + '</div>');
        return false;
    },

    render: function () {

        App.loader(false);

        if (this.model.length === 0 && $('.movie-list').children().length === 0) {
            return this.empty();
        }


        var movieList = this;

        $.each(this.model.models, function (index) {

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
            if (! $movie.hasClass('fullyLoaded')) {

                $movie.addClass('fullyLoaded');

                var $newCover = $('<img src="' + this.get('image') + '" class="real hidden" alt="' + this.get('title') + '" />');
                $currentEl.find('.cover').append( $newCover );

                $newCover.load(function(){
                    $(this).removeClass('hidden');
                });
            }
        });

        var $scrollElement = movieList.$el.parent();

        var loadNextPage = function(){
            movieList.constructor.busy = true;
            var page    = parseInt($scrollElement.data('page'));
            var section = $scrollElement.data('section');
            page++;
            $scrollElement.data('page', page);

            if (section){
                App.Router.navigate('filter/' + section + '/' + page, { trigger: true });
            }
            else if (movieList.model.options.keywords) {
                section = 'search';
                // uncomment this line when the API start accepting the page param to paginate ;)
                //App.Router.navigate('search/' + encodeURIComponent(movieList.model.options.keywords) + '/' + page, { trigger: true });
            }
            else {
                section = 'index';
                App.Router.navigate(section + page + '.html', { trigger: true });
            }

            console.logger.info(section + ' page ' + page);
        };

        var isScrollable = $scrollElement[0].scrollHeight > $scrollElement[0].clientHeight;
        if(!movieList.model.options.keywords && !isScrollable && this.model.length) {
            if($('.load-more').length === 0) {
                var $getMoreEl = $('<a class="load-more">'+ i18n.__('Get more...') +'</a>');
                $getMoreEl.click(function(){
                    if (!movieList.constructor.busy){
                        loadNextPage();
                    }
                });
                $getMoreEl.appendTo($scrollElement);
            }
        }

        if (!$scrollElement.data('page') || $scrollElement.data('section') != movieList.model.options.genre){
            $scrollElement.data('page', 1);
            $scrollElement.data('section', movieList.model.options.genre);
        }

        $scrollElement.scroll(function(){
            if (!movieList.constructor.busy){
                var totalSize       = $scrollElement.prop('scrollHeight');
                var currentPosition = $scrollElement.scrollTop();
                var scrollBuffer    = (15 / 100) * totalSize;
                if (currentPosition > 0){
                    currentPosition += $scrollElement.height();
                }
                if (currentPosition >= (totalSize - scrollBuffer)){
                    loadNextPage();
                }
            }
        });
    }
},{
    busy: false
});
