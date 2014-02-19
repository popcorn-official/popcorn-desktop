#Popcorn time [![Dependency Status](https://david-dm.org/popcorn-time/popcorn-time.png?theme=shields.io)](https://david-dm.org/popcorn-time/popcorn-time)

## Idea

To allow any computer user to watch movies easily streaming from torrents, without any particular knowledge. The only requirements are an internet connection and [VLC](http://www.videolan.org/vlc/index.html) installed.

![Demo Screenshot](https://f.cloud.github.com/assets/1133842/1980972/1083f360-83cd-11e3-8e08-b01de5d33f1c.png)

### Status

Under development (only in Mac OSX? _somebody should try Linux and Windows_) - no alpha candidate yet.

## Roadmap (TO-DOs)
√ Means done.<br>
\- Means half-done / some progress.<br>
[ ] Means not yet started.

### Alpha (0.1a)
- [√] Connect VLC and peerflix app using `.torrent` files instad of `magnet:`
- [√] ~~Movie landing information~~ Movie sidebar information with conditionals for subtitles, quality and play button.
- [√] Use ~~`localStorage`~~ [Web SQL](https://github.com/rogerwang/node-webkit/wiki/Save-persistent-data-in-app) to cache most of the application content such as URLs (images, torrents, etc.) and information in order to load it faster preventing multiple API requests for things we already had requested in the past.
- [√] Implement subtitles functionality, including multiple languages. Current support for Spanish and English.
- [√] Implement optional quality functionality (SD vs. HD). This version should be dvdrip/dvdscreener or 720p. For connectivity issues, we need the smallest version possible, even if it is 720p some version are 800mb. Compressed but a great quality.
- [√] Define what to do with our current API usage.
    - ~~Change User-Agent on subtitles properly,~~
    - ~~Check rate limits on RottenTomatoes~~
    - ~~Avoid using KimonoLabs, implement YIFY?~~

### Beta (v0.1b)
- [√] Search through movies functionality ~~(fuck yeah bitches!)~~
- [√] Loading indicator:
    - when launching a movie.
    - when searching.
    - when app is loading the latest 50.
- [√] ~~Make sure downloaded movie files are deleted from disk, either with TTL or on demand. Subtitles don't matter because they're lightweight (bunch of KBs)~~ Movie files will be deleted after rebooting.
- [√] Make an effort for better subtitles match.
- [√] Add `--debug` flag to see extra information in console.
- [√] Create gh-pages with downloadable application (project landing page.)


### Release Candidate 1
- [√] Support for Mac OS X
- [√] Support for Windows
- [√] Sidebar functionality (Genres)
- [√] VideoJS full integration
- [√] Build [rotten-cache](https://github.com/popcorn-time/rotten-cache)
- [√] Better subtitles. Scrapping http://yifysubtitles.com or a script that download the subtitles from that page and uploads it to opensubtitles
- [√] Package Windows and OSX release apps.


### Release Candidate 2
- [ ] Support for Linux (Ubuntu, Fedora)
- [ ] Play a random movie
- [ ] Manual input torrent / subtitles files
- [ ] Multi-language support (Spanish, English) - use of `navigator.language` (indexOf en|es) could be en-US, en-GB, es, es-AR, en, etc.

### APIs

**Currently used:**
- ~~[RottenTomatoes](http://developer.rottentomatoes.com) for movies metadata.~~
- ~~[PirateBay](http://thepiratebay.se/browse/207/0/7/0) Recent popular movies list.~~
- [YIFY](http://yts.re/api) movie torrents API.
- [OpenSubtitles](http://trac.opensubtitles.org/projects/opensubtitles/wiki/XMLRPC) for subtitles
- [TheMovieDB](http://www.themoviedb.org/) for movies metadata.

**In discussion:**
- [SubtitleSeeker](http://www.api.subtitleseeker.com/About/Api-Search/) for subtitles.

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

## Testing it out
1. Open a Terminal with this project folder.
2. Run `npm install` in Terminal to include project dependencies.
3. Copy the [node-webkit application binary](https://s3.amazonaws.com/node-webkit/v0.8.4/node-webkit-v0.8.4-osx-ia32.zip) for OSX 10.7+ to your `/Applications` folder.
4. Run `/Applications/node-webkit.app/Contents/MacOS/node-webkit .` in Terminal to open up the application.

### Development
- Run `compass watch` in Terminal for CSS compiling and listen to future changes.
- [How to build with SublimeText](https://github.com/rogerwang/node-webkit/wiki/Debugging-with-Sublime-Text-2-and-3)
- Currently Gaze to watch all files and reload the app is disabled due to memory leaks and unstability.
