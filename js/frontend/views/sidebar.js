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
        if( videoPeerflix != null ){ return; } 

        var file = this.model.get('torrent'),
            subs = this.model.get('subtitles'),
            selectedSub = this.model.get('selectedSubtitle'),
            subsFiles = [],
            subsFile,
            subtitle;

        function getSubtitle ( subUrl, subOutputFile ) {
            var request = require('request');
            var fs = require('fs');
            var AdmZip = require('adm-zip');
            var http = require('http');
            var url = require('url');
            var charsetDetect = require('jschardet');
            var targetCharset = 'utf-8';
            var targetEncodingCharset = 'utf8';

            var options = {
                host: url.parse(subUrl).host,
                port: 80,
                path: url.parse(subUrl).pathname
            };

            http.get(options, function(res) {
                var data = [], dataLen = 0;
                res.on('data', function(chunk) {
                    data.push(chunk);
                    dataLen += chunk.length;
                }).on('end', function() {
                        var buf = new Buffer(dataLen);

                        for (var i=0, len = data.length, pos = 0; i < len; i++) {
                            data[i].copy(buf, pos);
                            pos += data[i].length;
                        }
                        var zip = new AdmZip(buf);
                        var zipEntries = zip.getEntries();
                        zipEntries.forEach(function(zipEntry, key) {
                            if (zipEntry.entryName.indexOf('.srt') != -1) {
                                var decompressedData = zip.readFile(zipEntry); // decompressed buffer of the entry
                                var charset = charsetDetect.detect(decompressedData);
                                if (charset.encoding == targetEncodingCharset || charset.encoding == targetCharset) {
                                    fs.writeFile( subOutputFile, decompressedData);
                                }
                                else {
                                    var iconv = require('iconv-lite');
                                    // Windows-1251/2/IBM855 works fine when read from a file (like it's UTF-8), but if you try to convert it you'll ruin the encoding.
                                    // Just save it again, and it'll be stored as UTF-8. At least on Windows.

                                    if( charset.encoding == 'IBM855' ) {
                                        // If you're wondering "What the fuck is this shit?", there's a bug with the charset detector when using portuguese or romanian. It's actually ISO-8859-1.
                                        decompressedData = iconv.encode( iconv.decode(decompressedData, 'iso-8859-1'), targetEncodingCharset );
                                    } 
                                    else if( charset.encoding == 'windows-1251' || charset.encoding == 'windows-1252' || charset.encoding == 'windows-1255' ) {
                                        // It's the charset detector fucking up again, now with Spanish, Portuguese, French (1255) and Romanian
                                        if( subOutputFile.indexOf('romanian.srt') > 0 ) {
                                            // And if it's romanian, it's iso-8859-2
                                            decompressedData = iconv.encode( iconv.decode(decompressedData, 'iso-8859-2'), targetEncodingCharset );
                                        } 
                                        else {
                                            decompressedData = iconv.encode( iconv.decode(decompressedData, 'iso-8859-1'), targetEncodingCharset );
                                        }
                                    }
                                    else {
                                        decompressedData = iconv.encode( iconv.decode(decompressedData, charset.encoding), targetEncodingCharset );
                                    }
                                    
                                    fs.writeFile( subOutputFile, decompressedData);
                                }
                            }
                        });
                    });
            });
        }

        if (subs) {
            // Download all the subs so they are available during the video playback
            for( lang in subs ) {
                subsFiles[lang] = 'tmp/' + this.model.get('title').replace(/([^a-zA-Z0-9-_])/g, '_') + '-' + this.model.get('quality') + '-' + lang + '.srt';
                getSubtitle(subs[lang], subsFiles[lang]);
            }
        }


        $('.popcorn-load').addClass('withProgressBar').addClass('cancellable').find('.progress').css('width', 0.0+'%');
        $('.popcorn-load .progressinfo').text( i18n.__('connecting') );

        App.loader(true, i18n.__('loadingVideo'));
        $('body').removeClass().addClass('loading');
        
        
        // Used to keep track of loading status changes
        var previousStatus = '';
        var movieModel = this.model;

        playTorrent(file, subsFiles, movieModel,
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
                if( videoPeerflix.peers.length > 0 ) {
                    bufferStatus = 'startingDownload';
                    if( videoPeerflix.downloaded > 0 ) {
                        bufferStatus = 'downloading';
                    }
                }
                
                if( bufferStatus != previousStatus ) {
                    userTracking.event('Video Preloading', bufferStatus, movieModel.get('title')).send();
                    previousStatus = bufferStatus;
                }
                
                $('.popcorn-load .progressinfo').text( i18n.__(bufferStatus) );
            }
        );
        
        userTracking.event('Movie Quality', 'Watch on '+this.model.get('quality')+' - '+this.model.get('health').capitalize(), this.model.get('title') ).send();
    },

    initialize: function () {
        this.setElement($('sidebar'));
        $('body').keydown(this.keyHide);
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
      // A user was going to watch a movie, but he cancelled, maybe because no sub in user locale
      // Maybe we can move this to a better place
      if($('.movie.active').size() > 0){
        var userLocale = window.navigator.language.substr(0,2);
        var avaliableSubs = this.model.get('subtitles');
        var languageLookup = {
          "brazilian": "pt",
          "dutch": "nl",
          "english": "en",
          "french": "fr",
          "portuguese": "pt",
          "romanian": "ro",
          "spanish": "es",
          "turkish": "tr"
        }
        var noSubForUser = true;
        for (as in avaliableSubs) {
          var subLocale = languageLookup[as];
          if (subLocale == userLocale) {
            noSubForUser = false;
          }
        }
        if (noSubForUser) {
          userTracking.event('Movie Sidebar', 'Watch Canceled', this.model.get('slug')+'-noSubForLocale' ).send();
        } else {
          userTracking.event('Movie Sidebar', 'Watch Canceled', this.model.get('slug')+'-hasSubForLocale' ).send();
        }
      }
      $('.movie.active').removeClass('active');
      this.$el.addClass('hidden');
    },

    show: function () {
        $('body').removeClass().addClass('sidebar-open');
        this.$el.removeClass('hidden');

        userTracking.pageview('/movies/view/'+this.model.get('slug'), this.model.get('title') +' ('+this.model.get('year')+')' ).send();
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
