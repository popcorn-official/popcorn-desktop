App.Model.Movie = Backbone.Model.extend({
    setRottenInfo: function () {
        var model = this;

        App.findMovieInfo(model.get('imdb'), function (data) {
            // console.log('Query title: ' + query.title + ' - Result title: ' + data.title);
            model.set('image',    data.image);
            model.set('bigImage', data.image);
            model.set('title',    data.title);
            model.set('synopsis', data.overview);

            model.view = new App.View.MovieListItem({
                model: model
            });

            model.trigger('rottenloaded');
        });
    },

    setSubtitles: function () {
        var model = this;

        App.findSubtitle({
            imdb: model.get('imdb'),
            title: model.get('title')
        }, function (info) {
            model.set('subtitles', info);
        });
    },

    initialize: function () {
        // Movie Health
        var seeds = this.get('seeders');

        if (seeds < 100) {
            this.set('health', 'bad');
        } else if (seeds > 100 && seeds < 200) {
            this.set('health', 'medium');
        } else if (seeds > 200) {
            this.set('health', 'good');
        }

        this.setRottenInfo();
        this.setSubtitles();
    }
});