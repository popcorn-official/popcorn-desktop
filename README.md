#Popcorn time [![Dependency Status](https://david-dm.org/popcorn-time/popcorn-app.png?theme=shields.io)](https://david-dm.org/popcorn-time/popcorn-time)

## Idea

To allow any computer user to watch movies easily streaming from torrents, without any particular knowledge.

![Demo Screenshot](http://getpopcornti.me/images/how-ui.png)

### Status

Under development (RC1) for Mac OSX - Windows - Linux.
 
### APIs

**Currently used:**
- ~~[RottenTomatoes](http://developer.rottentomatoes.com) for movies metadata.~~
- ~~[PirateBay](http://thepiratebay.se/browse/207/0/7/0) Recent popular movies list.~~
- [YIFY](http://yts.re/api) movie torrents API.
- [OpenSubtitles](http://trac.opensubtitles.org/projects/opensubtitles/wiki/XMLRPC) for subtitles
- [TheMovieDB](http://www.themoviedb.org/) for movies metadata.

**In discussion:**
- [SubtitleSeeker](http://www.api.subtitleseeker.com/About/Api-Search/) for subtitles.


## Building

### Dependencies

You will need nodejs and grunt:

    $ npm install -g grunt-cli

### Select your OS

Enable your Operating System in `Gruntfile.js` and disable all the others:

    …
    nodewebkit: {
      options: {
        …
        mac: false, // We want to build it for mac
        win: false, // We want to build it for win
        linux32: false, // We don't need linux32
        linux64: true // We don't need linux64
      },
    …

### Build

Install the node modules:

    $ npm install

Built with:

    $ grunt nodewkbuild


## Any problem?

### Regarding superagent dependency
Due to [wrong browser verification](https://github.com/visionmedia/superagent/issues/95) on a dependency, this hard fix must be applied.
Replace `node_modules/moviedb/node_modules/superagent/index.js` contents with:
```javascript
// if (typeof window != 'undefined') {
//   module.exports = require('./lib/superagent');
// } else if (process.env.SUPERAGENT_COV) {
//   module.exports = require('./lib-cov/node');
// } else {
  module.exports = require('./lib/node');
// }
```

### Regarding Video, MP4 H264 Playback
- Info: https://github.com/rogerwang/node-webkit/wiki/Support-mp3-and-h264-in-video-and-audio-tag
- Needed to build a custom build of node-webkit that adds h264 support (or you can download redy-to-go builds from https://file.ac/s4Lt3Vo6rls/)
- Alternatively, we can replace a .so and .dll file from the correspondent Chrome build to node-webkit and node-webkit.exe


## Development
- Run `compass watch` in Terminal for CSS compiling and listen to future changes.
- [How to build with SublimeText](https://github.com/rogerwang/node-webkit/wiki/Debugging-with-Sublime-Text-2-and-3)
- Currently Gaze to watch all files and reload the app is disabled due to memory leaks and unstability.
