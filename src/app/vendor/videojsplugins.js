// VideoJS Plugins

var Button = videojs.getComponent('Button');
var SubtitlesButton = videojs.getComponent('SubtitlesButton');
var MenuItem = videojs.getComponent('MenuItem');

// var BiggerSubtitleButton = videojs.extend(Button, {
//     /** @constructor */
//     constructor: function() {
//         Button.apply(this, arguments);
//     },
//     handleClick: function() {
//         var $subs = $('#video_player.video-js .vjs-text-track-display');
//         var font_size = parseInt($subs.css('font-size'));
//         font_size = font_size + 2;
//         $subs.css('font-size', font_size + 'px');
//     }
// });
// videojs.registerComponent('BiggerSubtitleButton', BiggerSubtitleButton);
//
// var createBiggerSubtitleButton = function () {
//     var props = {
//         className: 'vjs_biggersub_button vjs-control',
//         innerHTML: '<div class="vjs-control-content"><span class="vjs-control-text">A+</span></div>',
//         role: 'button',
//         'aria-live': 'polite', // let the screen reader user know that the text of the button may change
//         tabIndex: 0
//     };
//     return videojs.Component.prototype.createEl(null, props);
// };
//
// var biggerSubtitle;
// videojs.plugin('biggerSubtitle', function () {
//     var options = {
//         'el': createBiggerSubtitleButton()
//     };
//     biggerSubtitle = new BiggerSubtitleButton(this, options);
//     this.controlBar.el().appendChild(biggerSubtitle.el());
// });

// videojs.SmallerSubtitleButton = videojs.Button.extend({
//     /** @constructor */
//     init: function (player, options) {
//         videojs.Button.call(this, player, options);
//         this.on('click', this.onClick);
//     }
// });
//
// videojs.SmallerSubtitleButton.prototype.onClick = function () {
//     var $subs = $('#video_player.video-js .vjs-text-track-display');
//     var font_size = parseInt($subs.css('font-size'));
//     font_size = font_size - 2;
//     $subs.css('font-size', font_size + 'px');
// };
//
// var createSmallerSubtitleButton = function () {
//     var props = {
//         className: 'vjs_smallersub_button vjs-control',
//         innerHTML: '<div class="vjs-control-content"><span class="vjs-control-text">A-</span></div>',
//         role: 'button',
//         'aria-live': 'polite', // let the screen reader user know that the text of the button may change
//         tabIndex: 0
//     };
//     return videojs.Component.prototype.createEl(null, props);
// };
//
// var smallerSubtitle;
// videojs.plugin('smallerSubtitle', function () {
//     var options = {
//         'el': createSmallerSubtitleButton()
//     };
//     smallerSubtitle = new videojs.SmallerSubtitleButton(this, options);
//     this.controlBar.el().appendChild(smallerSubtitle.el());
// });
//

class CustomTrackMenuItem extends MenuItem {
    constructor(player, options) {
        options = options || {};
        options.label = i18n.__('Custom...');
        super(player, options);
    }

    /**
     * Seek with the button's configured offset
     */
    handleClick() {
        this.player_.pause();
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = '.vtt, .srt, .ssa, .ass, .txt';

        input.onchange = e => {
            let file = e.target.files[0];
            if (file.type === 'text/vtt') {
                this.loadSubtitle(file);
                return;
            }
            this.convert2vtt(file).then((file) => {
                this.loadSubtitle(file);
            });
        };

        input.click();
    }

    // TODO: find some npm module, which works with strings
    srt2webvtt(data) {
        // remove dos newlines
        var srt = data.replace(/\r+/g, '');
        // trim white space start and end
        srt = srt.replace(/^\s+|\s+$/g, '');

        // get cues
        var cuelist = srt.split('\n\n');
        var result = '';

        if (cuelist.length > 0) {
            result += 'WEBVTT\n\n';
            for (var i = 0; i < cuelist.length; i=i+1) {
                result += this.convertSrtCue(cuelist[i]);
            }
        }

        return result;
    }

    convertSrtCue(caption) {
        // remove all html tags for security reasons
        //srt = srt.replace(/<[a-zA-Z\/][^>]*>/g, '');

        var cue = '';
        var s = caption.split(/\n/);

        // concatenate muilt-line string separated in array into one
        while (s.length > 3) {
            for (var i = 3; i < s.length; i++) {
                s[2] += '\n' + s[i];
            }
            s.splice(3, s.length - 3);
        }

        var line = 0;

        // detect identifier
        if (!s[0].match(/\d+:\d+:\d+/) && s[1].match(/\d+:\d+:\d+/)) {
            cue += s[0].match(/\w+/) + '\n';
            line += 1;
        }

        // get time strings
        if (s[line].match(/\d+:\d+:\d+/)) {
            // convert time string
            var m = s[1].match(/(\d+):(\d+):(\d+)(?:,(\d+))?\s*--?>\s*(\d+):(\d+):(\d+)(?:,(\d+))?/);
            if (m) {
                cue += m[1]+':'+m[2]+':'+m[3]+'.'+m[4]+' --> '
                    +m[5]+':'+m[6]+':'+m[7]+'.'+m[8]+'\n';
                line += 1;
            } else {
                // Unrecognized timestring
                return '';
            }
        } else {
            // file format error or comment lines
            return '';
        }

        // get cue text
        if (s[line]) {
            cue += s[line] + '\n\n';
        }

        return cue;
    }

    async convert2vtt(file) {
        let text = await file.text();

        let vtt = this.srt2webvtt(text);
        return new File(
            [vtt],
            'loaded.vtt',
            {type: 'text/vtt'}
        );
    }

    loadSubtitle(file) {

        // on call removeRemoteTextTrack this.player_ set to null (???)
        let tracks = videojs('video_player').remoteTextTracks() || [];
        for (let i = tracks.length - 1; i >= 0; --i) {
            if (tracks[i].language === '00') {
                videojs('video_player').removeRemoteTextTrack(tracks[i]);
            }
        }

        const track = videojs('video_player').addRemoteTextTrack({
            kind: 'subtitles',
            language: '00',
            label: i18n.__('Custom...'),
            mode: 'showing',
            src: URL.createObjectURL(file)
        }, false);
    }

}
videojs.registerComponent('сustomTrackMenuItem', CustomTrackMenuItem);

class CustomSubtitlesButton extends SubtitlesButton
{
    constructor(player, options, ready) {
        super(player, options, ready);
    }

    createItems(items, TrackMenuItem) {
        items = super.createItems(items, TrackMenuItem);
        items.push(new CustomTrackMenuItem(this.player()));
        return items;
    }
}
videojs.registerComponent('customSubtitlesButton', CustomSubtitlesButton);
