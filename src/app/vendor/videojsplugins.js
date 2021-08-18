// VideoJS Plugins

var Button = videojs.getComponent('Button');
var MenuButton = videojs.getComponent('MenuButton');
var SubtitlesButton = videojs.getComponent('SubtitlesButton');
var MenuItem = videojs.getComponent('MenuItem');
var srt2vtt = require('srt-to-vtt');
var fs = require('fs');

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

        // let that = this;
        // this.fileInput_ = $('<input type="file" accept=".srt, .ssa, .ass, .txt" style="display: none;">');
        // $(this.el()).append(this.fileInput_);
        // this.fileInput_.on('change', function () {
        //     that.player_.play();
        //     if (this.value === '') {
        //         return;
        //     }
        //     that.loadSubtitle(this.value);
        //     this.value = null; //reset
        // });
    }

    /**
     * Seek with the button's configured offset
     */
    handleClick() {
        console.log('click!');
        this.player_.pause();
        // this.fileInput_.trigger('click'); // redirect to fileInput click
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = '.vtt, .srt, .ssa, .ass, .txt';

        input.onchange = e => {
            var file = e.target.files[0];
            console.log(file);
            this.loadSubtitle(file);
        };

        input.click();
        // const now = this.player_.currentTime();
        //
        // if (this.options_.direction === 'forward') {
        //     this.player_.currentTime(now + this.options_.seconds);
        // } else if (this.options_.direction === 'back') {
        //     this.player_.currentTime(now - this.options_.seconds);
        // }
    }

    loadSubtitle(file) {

        //clean tracks
        var tracks = this.player_.textTracks() || [];
        for (var i = 0; i < tracks.length; ++i) {
            if (tracks[i].id_.indexOf('vjs_subtitles_00') !== -1) {
                $(tracks[i].el()).remove();
                tracks.splice(i, 1);
                break;
            }
        }

        window['x'] = file;

        file.text().then((x) => fs.writeFileSync(App.settings.tmpLocation + '/temp.srt', x)).then((stream) => {
            fs.createReadStream(App.settings.tmpLocation + '/temp.srt')
                .pipe(srt2vtt())
                .pipe(fs.createWriteStream(App.settings.tmpLocation + '/temp.vtt'));
        }).then(() => {
            let file = new Blob(new Uint8Array(fs.readFileSync(App.settings.tmpLocation + '/temp.vtt')), {type: 'text/vtt'});
            console.log(file);
            const track = this.player_.addRemoteTextTrack({
                kind: 'subtitles',
                language: '01',
                label: 'str2vtt',
                mode: 'showing',
                src: URL.createObjectURL(file)
            }, false);
            console.log(track);
        });
        //return;

        //file.stream().pipe(srt2vtt()).toBlob()

        const track = this.player_.addRemoteTextTrack({
            kind: 'subtitles',
            language: '00',
            label: 'original',
            mode: 'showing',
            src: URL.createObjectURL(file)
        }, false);
        // const track = this.player_.addTextTrack('subtitles', 'Loaded', App.Settings.language, {
        //     src: filePath
        // });
        console.log(track);
        //App.vent.trigger('customSubtitles:added', filePath);
        //vjs.TextTrackMenuItem.prototype.onClick.call(this); // redirect to TextTrackMenuItem.onClick
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

/**
 * Button for subtitles menu
 *
 * @extends MenuButton
 * @class SubtitlesButton
 */
class CustomButton extends MenuButton {
    /**
     * Constructor for class
     *
     * @param {Player|Object} player The player
     * @param {Object=} options Button options
     * @param {string} options.direction back or forward
     * @param {Int} options.seconds number of seconds to seek
     */
    constructor(player, options) {
        super(player, options);
        if (this.options_.direction === 'forward') {
            this.controlText(this.localize('Seek forward {{seconds}} seconds')
                .replace('{{seconds}}', this.options_.seconds));
        } else if (this.options_.direction === 'back') {
            this.controlText(this.localize('Seek back {{seconds}} seconds')
                .replace('{{seconds}}', this.options_.seconds));
        }
    }

    /**
     * Return button class names which include the seek amount.
     *
     * @return {string} css cass string
     */
    buildCSSClass() {
        return `vjs-subtitles-button ${super.buildCSSClass()}`;
    }

    /**
     * Seek with the button's configured offset
     */
    handleClick() {
        console.log('click!');


        // const now = this.player_.currentTime();
        //
        // if (this.options_.direction === 'forward') {
        //     this.player_.currentTime(now + this.options_.seconds);
        // } else if (this.options_.direction === 'back') {
        //     this.player_.currentTime(now - this.options_.seconds);
        // }
    }
}

videojs.registerComponent('customButton', CustomButton);

// // Custom Subtitles Button/Menu
// videojs.registerPlugin('customSubtitles', function () {
//
//     // Find subtitlesButton
//     var subtitlesButton;
//     this.controlBar.children().forEach(function (el) {
//         if (el.name() === 'subtitlesButton') {
//             subtitlesButton = el;
//         }
//     });
//
//     var CustomTrackMenuItem = vjs.TextTrackMenuItem.extend({
//
//         /*@ Constructor */
//         init: function (player, options) {
//             options = options || {};
//             // fake 'empty' track
//             options['track'] = {
//                 kind: function () {
//                     return 'subtitles';
//                 },
//                 player: player,
//                 label: function () {
//                     return i18n.__('Custom...');
//                 },
//                 dflt: function () {
//                     return false;
//                 },
//                 mode: function () {
//                     return false;
//                 }
//             };
//
//             this.fileInput_ = $('<input type="file" accept=".srt, .ssa, .ass, .txt" style="display: none;">');
//             $(this.el()).append(this.fileInput_);
//
//             var that = this;
//
//             App.vent.on('videojs:drop_sub', function () {
//                 var subname = Settings.droppedSub;
//                 var subpath = path.join(App.settings.tmpLocation, subname);
//                 win.info('Subtitles dropped:', subname);
//                 that.loadSubtitle(subpath);
//             });
//
//             this.fileInput_.on('change', function () {
//                 that.player_.play();
//                 if (this.value === '') {
//                     return;
//                 }
//                 that.loadSubtitle(this.value);
//                 this.value = null; //reset
//             });
//
//             vjs.TextTrackMenuItem.call(this, player, options);
//         }
//     });
//
//     CustomTrackMenuItem.prototype.onClick = function () {
//         this.player_.pause();
//         this.fileInput_.trigger('click'); // redirect to fileInput click
//     };
//
//     CustomTrackMenuItem.prototype.loadSubtitle = function (filePath) {
//
//         //clean tracks
//         var tracks = this.player_.textTracks() || [];
//         for (var i = 0; i < tracks.length; ++i) {
//             if (tracks[i].id_.indexOf('vjs_subtitles_00') !== -1) {
//                 $(tracks[i].el()).remove();
//                 tracks.splice(i, 1);
//                 break;
//             }
//         }
//
//         this.track = this.player_.addTextTrack('subtitles', i18n.__('Custom...'), '00', {
//             src: filePath
//         });
//         App.vent.trigger('customSubtitles:added', filePath);
//         vjs.TextTrackMenuItem.prototype.onClick.call(this); // redirect to TextTrackMenuItem.onClick
//     };
//
//     subtitlesButton.menu.addItem(new CustomTrackMenuItem(this));
//     subtitlesButton.show(); // Always show subtitles button
//
// });
