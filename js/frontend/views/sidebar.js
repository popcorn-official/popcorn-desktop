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
        if( videoPeerflix != null ){ return; } 

        var file = this.model.get('torrent'),
            subs = this.model.get('subtitles'),
            selectedSub = this.model.get('selectedSubtitle'),
            subsFiles = [],
            subsFile,
            subtitle;

        function getSubtitle ( subUrl, subOutputFile ) {

            var fs = require('fs');
            var wget = require('wget');
            var zlib = require('zlib');
            
            var charsetDetect = require('jschardet');
            var targetCharset = 'UTF-8';
            var targetEncodingCharset = 'utf8';

            // Download the file (it's gzipped)
            // Todo: This is a bug in the making. If files come in a slightly different format, this script will fail miserably.
            var downloadSub = wget.download(subUrl, subOutputFile +'.gz' );
            downloadSub.on('end', function(outputPath) {
                
                // Unzip with Zlib. adm-zip and gizp-js fuck up under Windows
                var inp2 = fs.createReadStream(subOutputFile +'.gz');
                var out2 = fs.createWriteStream(subOutputFile);
                inp2.pipe(zlib.createGunzip()).pipe(out2);
                
                // Finished unzipping, process the final file
                out2.on('finish', function(){
                    var decompressedData = fs.readFileSync(subOutputFile, 'binary');
                    var charset = charsetDetect.detect(decompressedData);
                    
                    if( charset.encoding == 'ascii' ){ return; } // ASCII is pretty much UTF-8

                    var iconv = require('iconv-lite');
                    
                    if( charset.encoding != targetCharset && charset.encoding != targetEncodingCharset && iconv.encodingExists(charset.encoding) ) {
                        // Windows-1251/2 works fine when read from a file (like it's UTF-8), but if you try to convert it you'll ruin the encoding.
                        // Just save it again, and it'll be stored as UTF-8. At least on Windows.
                        if( charset.encoding != 'windows-1251' && charset.encoding != 'windows-1252' ) {
                            subText = iconv.encode( iconv.decode(decompressedData, charset.encoding), targetCharset );
                        }
                        fs.writeFile( subOutputFile, decompressedData);
                    }                
                });
                
            });
        }

        if (subs) {
            // Download all the subs so they are available during the video playback
            for( lang in subs ) {
                // Subtitles go in the local TMP folder, as VideoJS has some trouble loading subtitles due to CORS, and even disabling security on chromium doesn't help.
                // This affects the build process as well, as zipping everything into a package not only doesn't work, it's very slow as well.
                subsFiles[lang] = 'tmp/' + this.model.get('title').replace(/([^a-zA-Z0-9-_])/g, '_') + '-' + this.model.get('quality') + '-' + lang + '.srt';
                getSubtitle(subs[lang], subsFiles[lang]);
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

                // Update the loader status
                var bufferStatus = Language['connecting'];
                if( videoPeerflix.peers.length > 0 ) {
                    bufferStatus = Language['startingDownload'];
                    if( videoPeerflix.downloaded > 0 ) {
                        bufferStatus = Language['downloading'];
                    }
                }
                $('.popcorn-load .progressinfo').text(bufferStatus);
            }
        );
        $('.popcorn-load').addClass('withProgressBar').addClass('cancellable').find('.progress').css('width', 0.0+'%');
        $('.popcorn-load .progressinfo').text( Language['connecting'] );
        
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
    }
});
