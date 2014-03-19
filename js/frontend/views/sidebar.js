var SidebarTemplate = $('#sidebar-tpl').html();

App.View.Sidebar = Backbone.View.extend({
    template: _.template(SidebarTemplate),

    events: {
        'click .closer':           'hide',
        'click .play-button':      'play',
        'click .subtitles button': 'selectSubtitle',
        'click .dropdown-toggle':  'toggleDropdown',
        'click #switch-on':        'enableHD',
        'click #switch-off':       'disableHD'
    },

    keyHide: function (e) {
        if (e.which === 27 && $('body').is('.sidebar-open')) {
            /*alert("escape pressed from sidebar");*/
            $('body').removeClass('sidebar-open');
            $('.movie.active').removeClass('active');
            $('sidebar').addClass('hidden');
        }
    },

    toggleDropdown: function (evt) {
        $(evt.currentTarget).parent().toggleClass('active');
    },

    selectSubtitle: function (evt) {
        var $button = $(evt.currentTarget),
            lang = $button.val();

        $button
            .closest('.dropdown').removeClass('active')
            .find('.lang-placeholder').attr('src', $button.find('img').attr('src'));
        this.model.set('selectedSubtitle', lang);
    },

    play: function (evt) {
        evt.preventDefault();
        if( videoStreamer !== null ){ return; }

        var file = this.model.get('torrent'),
            subs = this.model.get('subtitles');

        $('.popcorn-load').addClass('withProgressBar').addClass('cancellable').find('.progress').css('width', 0.0+'%');
        $('.popcorn-load .progressinfo').text( i18n.__('connecting') );

        App.loader(true, i18n.__('loadingVideo'));
        $('body').removeClass().addClass('loading');


        // Used to keep track of loading status changes
        var previousStatus = '';
        var movieModel = this.model;

        playTorrent(file, subs, movieModel,
            function(){},
            function(percent){

                // Loading Progress Handler. Percent is 5% + Actual progress, to keep the progressbar moving even when it's at the min-width
                var $progress = $('.popcorn-load').find('.progress');
                var minWidth = parseFloat($progress.css('min-width'));
                percent = minWidth + percent * ((100.0-minWidth)/100.0);
                percent = percent > 100.0 ? 100.0 : percent;
                $('.popcorn-load').find('.progress').css('width', percent+'%');

                // Update the loader status
                var bufferStatus = 'connecting';
                if( videoStreamer.peers.length > 0 ) {
                    bufferStatus = 'startingDownload';
                    if( videoStreamer.downloaded > 0 ) {
                        bufferStatus = 'downloading';
                    }
                }

                if( bufferStatus != previousStatus ) {
                    previousStatus = bufferStatus;
                }

                $('.popcorn-load .progressinfo').text( i18n.__(bufferStatus) );
            }
        );

    },

    initialize: function () {
        this.setElement($('sidebar'));
        $('body').keydown(this.keyHide);
    },

    load: function (model) {
        // TODO: QUEUE PLAY BUTTON
        this.listenTo(model, 'change', this.update);
        this.model = model;
        model.fetchMissingData();
        this.render();
    },

    update: function() {
        if(this.isVisible()) {
            this.render();
        }
    },

    render: function () {
        this.$el.html(this.template(this.model.attributes));
        if ( this.isReadyToPlay() ) {
            this.$el.find('.play-button').removeAttr('disabled');
        }
        this.show();
    },

    isVisible: function () {
        return !this.$el.is('.hidden');
    },

    hide: function () {
      $('body').removeClass('sidebar-open');

      // A user was going to watch a movie, but he cancelled, maybe because no sub in user locale
      // Maybe we can move this to a better place
      if( $('.movie.active').size() > 0 ) {
        var userLocale = window.navigator.language.substr(0,2);
        var availableSubs = this.model.get('subtitles');
        var languageLookup = {
          "brazilian": "pt",
          "dutch": "nl",
          "english": "en",
          "french": "fr",
          "portuguese": "pt",
          "romanian": "ro",
          "spanish": "es",
          "turkish": "tr",
          "german": "de",
          "hungarian": "hu",
          "finnish": "fi",
          "bulgarian": "bg"        }

        var noSubForUser = true;
        for (var as in availableSubs) {
          var subLocale = languageLookup[as];
          if (subLocale == userLocale) {
            noSubForUser = false;
          }
        }

      }

      $('.movie.active').removeClass('active');
      this.$el.addClass('hidden');
      if( typeof this.backdropCache != 'undefined' ) {
        this.backdropCache.src = null;
      }
    },

    show: function () {
        $('body').removeClass().addClass('sidebar-open');
        this.$el.removeClass('hidden');

        this.backdropCache = new Image();
        this.backdropCache.src = this.model.get('backdrop');
        this.backdropCache.onload = function () {
            $(".backdrop-image").addClass("loaded")
        };
    },

    enableHD: function (evt) {

        var torrents = this.model.get('torrents');
        console.log('HD Enabled');

        if(torrents['1080p'] !== undefined) {
            this.model.set('torrent', torrents['1080p']);
            this.model.set('quality', '1080p');
        }
    },

    disableHD: function (evt) {

        var torrents = this.model.get('torrents');
        console.log('HD Disabled');

        if(torrents['720p'] !== undefined) {
            this.model.set('torrent', torrents['720p']);
            this.model.set('quality', '720p');
        }
    },

    isReadyToPlay: function() {
        return this.model.get('hasSubtitle');
    }
});
