App.Model.Movie = Backbone.Model.extend({
    buildBasicView: function () {
      var model = this;

      // This is mostly used for reporting
      model.set('slug',       model.get('title').toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'_') +'.'+ model.get('imdb').slice(2) );
      model.set('niceTitle',  model.get('title') +' ('+model.get('year')+')' );

      model.view = new App.View.MovieListItem({
          model: model
      });

    },

    getShortTitle: function() {
      if (this.get('title').length > 19) {
        return this.get('title').substring(0, 13) + "...";
      }

      return this.get('title');
    },

    fetchMissingData: function() {
        if ( !this.get('hasMetadata') ) {
            App.Providers.metadata.fetch(this);
        }
        if ( !this.get('hasSubtitle') ) {
            App.Providers.subtitle.fetch(this);
        }
    },

    initialize: function () {
        this.buildBasicView();
        this.calculateTorrentHealth();
    },

    calculateTorrentHealth: function () {
      // Calculates the "health" of the torrent (how easy it is to stream)
      var seeders = this.get('seeders');
      var leechers = this.get('leechers');
      var ratio = leechers > 0 ? (seeders / leechers) : seeders;

      if (seeders < 100) {
        this.set('health', 'bad');
      }
      else if (seeders >= 100 && seeders < 200) {
        if( ratio > 5 ) {
          this.set('health', 'good');
        } else if( ratio > 3 ) {
          this.set('health', 'medium');
        } else {
          this.set('health', 'bad');
        }
      }
      else if (seeders >= 200) {
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
    }

});