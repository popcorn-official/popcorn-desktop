var SidebarTemplate = $('#sidebar-tpl').html();

App.View.Sidebar = Backbone.View.extend({
    template: _.template(SidebarTemplate),

    events: {
        'click .closer':           'hide',
        'click .play-button':      'play',
        'click #switch-on':        'enableHD',
        'click #switch-off':       'disableHD'
    },

    initialize: function () {
        this.setElement($('sidebar'));
        $('body').keydown(this.keyHide);
    },

    load: function (model) {
        this.listenTo(model, 'change:subtitles', this.renderSubtitles);
        this.listenTo(model, 'change:resumetime', this.renderRuntime);
        this.listenTo(model, 'change:hasSubtitle', this.readyToPlay);
        this.model = model;

        this.render();
    },

    keyHide: function (e) {
        if (e.which === 27 && $('body').is('.sidebar-open')) {
            /*alert("escape pressed from sidebar");*/
            $('body').removeClass('sidebar-open');
            $('.movie.active').removeClass('active');
            $('sidebar').addClass('hidden');
        }
    },

    play: function (evt) {
        evt.preventDefault();
        if( videoStreamer !== null ){ return; }

        //Unfocus "Watch now" button
        this.$el.find('.play-button').blur();

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

    render: function () {
        this.$el.html(this.template(this.model.attributes));
        this.readyToPlay();
        this.show();
    },

    renderSubtitles: function() {
        var temp = $(this.template(this.model.attributes));
        this.$el.find('.subtitles-list').replaceWith(temp.find('.subtitles-list'));
    },

    renderRuntime: function() {
        if(this.model.has('resumetime')) {
            $('.duration', this.$el).text((this.model.get('runtime') - (this.model.get('resumetime')/60|0)) + 'm left');
        }
    },

    readyToPlay: function() {
        if(this.model.get('hasSubtitle')) {
            this.$el.find('.play-button').removeAttr('disabled');
        }
    },

    isVisible: function () {
        return !this.$el.is('.hidden');
    },

    hide: function () {
      $('body').removeClass('sidebar-open');

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
            $(".backdrop-image").addClass("loaded");
        };
    },

    enableHD: function (evt) {

        var torrents = this.model.get('torrents');
        console.logger.debug('HD Enabled');

        if(torrents['1080p'] !== undefined) {
            this.model.set('torrent', torrents['1080p']);
            this.model.set('quality', '1080p');
        }
    },

    disableHD: function (evt) {

        var torrents = this.model.get('torrents');
        console.logger.debug('HD Disabled');

        if(torrents['720p'] !== undefined) {
            this.model.set('torrent', torrents['720p']);
            this.model.set('quality', '720p');
        }
    }
});
