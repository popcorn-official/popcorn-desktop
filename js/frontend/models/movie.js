App.Model.Movie = Backbone.Model.extend({
    setRottenInfo: function () {
        var model = this;

        App.findMovieInfo(model.get('imdb'), function (data) {

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
        var seeders = this.get('seeders');
        var leechers = this.get('leechers');
        var ratio = leechers > 0 ? (seeders / leechers) : seeders;

        if (seeders < 100) {
            this.set('health', 'bad');
        }
        else if (seeders > 100 && seeders < 200) {
            if( ratio > 5 ) {
                this.set('health', 'good');
            } else if( ratio > 3 ) {
                this.set('health', 'medium');
            } else {
                this.set('health', 'bad');
            }
        }
        else if (seeders > 200) {
            if( ratio > 5 ) {
                this.set('health', 'excellent');
            } else if( ratio > 3 ) {
                this.set('health', 'good');
            } else if( ratio > 2 ) {
                this.set('health', 'medium');
            } else {
                this.set('health', 'bad');
            }
        }

        this.setRottenInfo();
        this.setSubtitles();
    }
});