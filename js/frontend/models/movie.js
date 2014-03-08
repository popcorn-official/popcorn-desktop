App.Model.Movie = Backbone.Model.extend({

    buildBasicView: function () {
    
      var model = this;
    
      model.set('infoLoaded', true);
      model.set('subtitlesLoaded', true);
      model.set('image',    model.get('coverImage'));
      model.set('bigImage', model.get('coverImage'));
      model.set('backdrop', model.get('backdropImage'));
      model.set('title',    model.get('title'));
      model.set('synopsis', model.get('synopsis'));
      model.set('voteAverage', model.get('voteAverage'));
      model.set('runtime', model.get('runtime'));
      model.set('subtitles', model.get('subtitles'));

      // This is mostly used for reporting
      model.set('slug',       model.get('title').toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-') +'-'+ model.get('imdb').slice(2) );
      model.set('niceTitle',  model.get('title') +' ('+model.get('year')+')' );

      model.view = new App.View.MovieListItem({
          model: model
      });
      
      model.trigger('rottenloaded');
    },

    // DEPRECATED
    setRottenInfo: function () {
        var model = this;

        App.findMovieInfo(model.get('imdb'), function (data) {
            
            model.set('infoLoaded', true);
            model.set('image',    data.image);
            model.set('bigImage', data.image);
            model.set('backdrop', data.backdrop);
            model.set('title',    data.title);
            model.set('synopsis', data.overview);
            model.set('voteAverage', data.voteAverage);
            model.set('runtime', data.runtime);

            model.view = new App.View.MovieListItem({
                model: model
            });

            model.trigger('rottenloaded');
        });
    },

    // DEPRECATED
    setSubtitles: function () {
        var model = this;

        App.findSubtitle({
            imdb: model.get('imdb'),
            title: model.get('title')
        }, function (info) {
            model.set('subbtitlesLoaded', true);
            model.set('subtitles', info);

            model.trigger('rottenloaded');
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

        this.buildBasicView();
        //this.setRottenInfo();
        //this.setSubtitles();
    }
});