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

        var file = this.model.get('torrent'),
            subs = this.model.get('subtitles'),
            selectedSub = this.model.get('selectedSubtitle'),
            subsFiles = [],
            subsFile,
            subtitle;

        if (subs) {
            // Download all the subs so they are available during the video playback
            for( lang in subs ) {

                subsFiles[lang] = 'tmp/' + this.model.get('title').replace(/([^a-zA-Z0-9-_])/g, '_') + ' ' + this.model.get('quality') + ' ' + lang + '.srt';

                // This downloads the subs in binary format and then converts them to UTF-8. App.unzip() doesn't support callbacks or much configuration.
                // This fixes an encoding issue with accented characters
                var request = require('request');
                var fs = require('fs');

                var subOutput = fs.createWriteStream(subsFiles[lang]);

                subOutput.on('finish', function() {
                    var subText = fs.readFileSync(this.path, 'binary');
                    fs.writeFile( this.path, subText.toString('utf-8') );
                });

                request({
                    url: subs[lang],
                    headers: { 'Accept-Encoding': 'gzip' }
                }).pipe(zlib.createGunzip()).pipe(subOutput);
            }
        }

        playTorrent(file, subsFiles, 
            function(){}, 
            function(percent){
                // Loading Progress Handler. Percent is 5% + Actual progress, to keep the progressbar moving even when it's at the min-width
                var $progress = $('.popcorn-load').find('.progress');
                var minWidth = parseFloat($progress.css('min-width'));
                percent = minWidth + percent * ((100.0-minWidth)/100.0);
                percent = percent > 100.0 ? 100.0 : percent;
                $('.popcorn-load').find('.progress').css('width', percent+'%');
            }
        );
        $('.popcorn-load').addClass('withProgressBar').addClass('cancellable').find('.progress').css('width', 0.0+'%');
        
        App.loader(true, Language.loadingVideo);
    },

    initialize: function () {
        this.setElement($('sidebar'));
    },

    load: function (model) {
        // TODO: QUEUE PLAY BUTTON
        this.listenTo(model, 'change:subtitles', this.render);

        this.model = model;
        this.render();
    },

    render: function () {
        this.$el.html(this.template(this.model.attributes));
        this.show();
    },

    isVisible: function () {
        return !this.$el.is('.hidden');
    },

    hide: function () {
        $('body').removeClass('sidebar-open');
        $('.movie.active').removeClass('active');
        this.$el.addClass('hidden');
    },

    show: function () {
        $('body').addClass('sidebar-open');
        this.$el.removeClass('hidden');
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
});