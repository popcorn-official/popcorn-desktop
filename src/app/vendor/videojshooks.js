videojs.options['children'] = {
    'mediaLoader': {},
    'posterImage': {},
    'textTrackDisplay': {},
    'loadingSpinner': {},
    //'bigPlayButton': {},
    'controlBar': {},
    'errorDisplay': {}
};

// This is a custom way of loading subtitles, since we can't use src (CORS blocks it and we can't disable it)
// We fetch them when requested, process them and finally throw a parseCues their way
videojs.TextTrack.prototype.load = function () {
    // Only load if not loaded yet or is error
    if (this.readyState_ === 0 || this.readyState_ === 3) {
        var this_ = this;
        this.readyState_ = 1;

        var subsParams = function () {
            $('#video_player .vjs-text-track').css('display', 'inline-block').drags();
            $('#video_player .vjs-text-track-display').css('font-size', Settings.subtitle_size);
            if (win.isFullscreen) {
                $('.vjs-text-track').css('font-size', '140%');
            }
            $('.vjs-subtitles').css('color', Settings.subtitle_color);
            $('.vjs-subtitles').css('font-family', Settings.subtitle_font);
            if (Settings.subtitle_decoration === 'None') {
                $('.vjs-text-track').css('text-shadow', 'none');
            } else if (Settings.subtitle_decoration === 'Opaque Background') {
                $('.vjs-text-track').css('background', '#000');
            } else if (Settings.subtitle_decoration === 'See-through Background') {
                $('.vjs-text-track').css('background', 'rgba(0,0,0,.5)');
            }
            if (Settings.subtitles_bold) {
                $('.vjs-text-track').css('font-weight', 'bold');
            }
            $('.vjs-text-track').css('z-index', 'auto').css('position', 'relative').css('top', AdvSettings.get('playerSubPosition'));
        };

        // Fetches a raw subtitle, locally or remotely
        var get_subtitle = function (subtitle_url, callback, retry_cnt) {
            // Fetches Locally
            if (fs.existsSync(path.join(subtitle_url))) {
                fs.readFile(subtitle_url, function (error, data) {
                    if (!error) {
                        callback(data);
                    } else {
                        console.warn('Failed to read subtitle!', error);
                    }
                });
                // Fetches Remotely
            } else {
                request({
                    url: subtitle_url,
                    encoding: null
                }, function (error, response, data) {
                    if (!error && response.statusCode === 200) {
                        callback(data);
                    } else {
                        if (retry_cnt === undefined) {
                            retry_cnt=0;
                        }
                        retry_cnt++;
                        if (retry_cnt<5) {
                            console.log('subtitle url download failed. retry: ' + retry_cnt + ' out of 4');
                            get_subtitle(subtitle_url, callback, retry_cnt);
                        } else {
                            $('.notification_alert').text(i18n.__('Error downloading subtitle.')).fadeIn('fast').delay(2500).fadeOut('fast');
                            console.warn('Failed to download subtitle!', error, response);
                            // change readyState to 0 because 3 (error state) will not allow additional retry if user select the same language later
                            this_.readyState_ = 0;
                        }
                    }
                });
            }
        };

        //transcode .ass, .ssa, .txt to SRT
        var convert2srt = function (file, ext, callback) {
            var readline = require('readline'),
                counter = null,
                lastBeginTime,

                //input
                orig = /([^\\\/]+)$/.exec(file)[1],
                origPath = file.substr(0, file.indexOf(orig)),

                //output
                srt = orig.replace(ext, '.srt'),
                srtPath = Settings.tmpLocation,

                //elements
                dialog, begin_time, end_time;

            fs.writeFileSync(path.join(srtPath, srt), ''); //create or delete content;
            console.log('SUB format can be converted:', orig);

            if (ext === '.smi' || ext === '.sami') {
                fs.readFile(file, {encoding: 'utf-8'}, function(err, data) {
                    var subsrt = require('subsrt');
                    // Remove all <br> tags since it breaks the video.js srt parser and we don't need empty lines in the smi format
                    data = data.replace(/<br.*>/g, '');
                    var smiData = subsrt.convert(data, { format: 'srt', eol: '\n' });
                    fs.appendFileSync(path.join(srtPath, srt), smiData, 'utf-8');
                });
            }
            else {
                var rl = readline.createInterface({
                    input: fs.createReadStream(path.join(origPath, orig)),
                    output: process.stdout,
                    terminal: false
                });
                rl.on('line', function (line) {

                    //detect encoding
                    var charset = charsetDetect.detect(line);
                    var encoding = charset.encoding;
                    var line_, parsedBeginTime, parsedEndTime, parsedDialog;

                    // TODO: Replace the .ssa/.ass parsing code by using th subsrt library, like for the smi parsing
                    //parse SSA
                    if (ext === '.ssa' || ext === '.ass') {
                        encoding = 'utf-8';
                        if (line.indexOf('Format:') !== -1) {
                            var ssaFormat = line.split(',');

                            for (var i = 0; i < ssaFormat.length; i++) {
                                switch (ssaFormat[i]) {
                                case 'Text':
                                case ' Text':
                                    dialog = i;
                                    break;
                                case 'Start':
                                case ' Start':
                                    begin_time = i;
                                    break;
                                case 'End':
                                case ' End':
                                    end_time = i;
                                    break;
                                default:
                                }
                            }

                            if (dialog && begin_time && end_time) {
                                console.log('SUB formatted in \'ssa\'');
                            }
                            return; //we have the elms spots, move on to the next line
                        }

                        if (line.indexOf('Dialogue:') === -1) { //not a dialog line
                            return;
                        }

                        line_ = line.split(',');

                        parsedBeginTime = line_[begin_time];
                        parsedEndTime = line_[end_time];
                        parsedDialog = line_[dialog];
                        parsedDialog = parsedDialog.replace('{\\i1}', '<i>').replace('{\\i0}', '</i>'); //italics
                        parsedDialog = parsedDialog.replace('{\\b1}', '<b>').replace('{\\b0}', '</b>'); //bold
                        parsedDialog = parsedDialog.replace('\\N', '\n'); //return to line
                        parsedDialog = parsedDialog.replace(/{.*?}/g, ''); //remove leftovers brackets
                    }

                    //parse TXT
                    if (ext === '.txt') {
                        line_ = line.split('}');

                        var formatSeconds = function (seconds) {
                            var date = new Date(1970, 0, 1);
                            date.setSeconds(seconds);
                            return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
                        };

                        parsedBeginTime = formatSeconds(line_[0].replace('{', '') / 25);
                        parsedEndTime = formatSeconds(line_[1].replace('{', '') / 25);
                        parsedDialog = line_[2].replace('|', '\n');
                    }

                    //SRT needs a number for each subtitle
                    counter += 1;

                    //keep only the last lang
                    if (parsedBeginTime < lastBeginTime) {
                        counter = 1;
                        fs.writeFileSync(path.join(srtPath, srt), '');
                        console.log('SUB contains multiple tracks, keeping only the last');
                    }

                    //SRT formatting
                    var parsedLine =
                        counter + '\n' +
                        parsedBeginTime + ' --> ' + parsedEndTime + '\n' +
                        parsedDialog;

                    fs.appendFileSync(path.join(srtPath, srt), '\n\n' + parsedLine, encoding);
                    lastBeginTime = parsedBeginTime;
                });
            }

            setTimeout(function () {
                fs.readFile(path.join(srtPath, srt), function (err, dataBuff) {
                    if (!err) {
                        console.log('SUB transcoded to SRT:', srt);
                        callback(dataBuff);
                    } else {
                        console.warn('SUB transcoding failed', err);
                    }
                });
            }, 2000);
        };

        // Decompress zip
        var decompress = function (dataBuff, callback) {
            try {
                var zip = new AdmZip(dataBuff);
                var zipEntries = zip.getEntries();
                // TODO: Shouldn't we look for only 1 file ???
                zipEntries.forEach(function (zipEntry, key) {
                    if (zipEntry.entryName.indexOf('.srt') !== -1) {
                        var decompressedData = zip.readFile(zipEntry);
                        callback(decompressedData);
                    }
                });
            } catch (error) {
                console.warn('Failed to decompress subtitle!', error);
            }
        };

        // Handles charset encoding
        var decode = function (dataBuff, language, callback) {
            var targetEncodingCharset = 'utf8';

            var parse = function (strings) {
                strings = strings
                    .replace(/\{.*\}/g, '') // {/pos(x,y)}
                    .replace(/(- |==|sync).*[\s\S].*[\s\S].*[\s\S].*[\s\S].*\.(com|org|net|edu)/ig, '') // various teams
                    .replace(/[^0-9][\s\S][^0-9\W].*[\s\S].*[\s\S].*opensubtitles.*/ig, ''); // opensubs "contact us" ads

                strings = Common.sanitize(strings); // xss-style attacks
                strings = strings.replace(/--\&gt\;/g, '-->'); // restore srt format
                callback(strings);
            };

            var charset = charsetDetect.detect(dataBuff);
            var detectedEncoding = charset.encoding;
            console.log('SUB charset detected: ' + detectedEncoding);
            // Do we need decoding?
            if (detectedEncoding && detectedEncoding.toLowerCase().replace('-', '') === targetEncodingCharset) {
                parse(dataBuff.toString('utf-8'));
                // We do
            } else {
                if (!language && Settings.subtitle_language !== 'none') {
                    language = Settings.subtitle_language;
                    console.log('SUB charset: using subtitles_language setting (' + language + ') as default');
                }
                var langInfo = App.Localization.langcodes[ (language.indexOf('|')>0 ? language.substr(0,language.indexOf('|')) : language) ] || {};
                console.log('SUB charset expected:', langInfo.encoding);
                if (langInfo.encoding !== undefined && langInfo.encoding.indexOf(detectedEncoding) < 0) {
                    // The detected encoding was unexepected to the language, so we'll use the most common
                    // encoding for that language instead.
                    detectedEncoding = langInfo.encoding[0];
                    dataBuff = iconv.encode(iconv.decode(dataBuff, detectedEncoding), targetEncodingCharset);
                } else {
                    // fallback to utf8
                    console.log('SUB charset: fallback to utf-8');
                    dataBuff = iconv.decode(dataBuff, detectedEncoding);
                    detectedEncoding = 'UTF-8';
                }
                console.log('SUB charset used:', detectedEncoding);
                parse(dataBuff.toString('utf-8'));
            }
        };

        var vjsBind = function (data) {
            try {
                this_.parseCues(data);
            } catch (e) {
                console.error('Error reading subtitles timing, file seems corrupted', e);
                subsParams();
                App.vent.trigger('notification:show', new App.Model.Notification({
                    title: i18n.__('Error reading subtitle timings, file seems corrupted'),
                    body: i18n.__('Try another subtitle or drop one in the player'),
                    showRestart: false,
                    type: 'error',
                    autoclose: true
                }));
            }
        };

        this.on('loaded', function () {
            console.log('Subtitles loaded!');
            subsParams();
        });

        // Get it, Unzip it, Decode it, Send it
        get_subtitle(this.src_, function (dataBuf) {
            var ext = path.extname(this_.src_);

            if (ext === '.zip') {
                decompress(dataBuf, function (dataBuf) {
                    decode(dataBuf, this_.language(), vjsBind);
                });
            } else if (ext === '.ass' || ext === '.ssa' || ext === '.txt' || ext === '.smi' || ext === '.sami') {
                convert2srt(this_.src_, ext, function (dataBuf) {
                    decode(dataBuf, this_.language(), vjsBind);
                });
            } else {
                decode(dataBuf, this_.language(), vjsBind);
            }
        });

    }

};
