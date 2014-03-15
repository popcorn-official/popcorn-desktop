#Warning the repo was cleaned to shrink its size from over 100 Mo to less than 5 Mo. Please re-clone your project or use `git rebase`. Thanks

#Popcorn time [![Dependency Status](https://david-dm.org/isra17/popcorn-app.svg?theme=shields.io)](https://david-dm.org/isra17/popcorn-app)

## Idea

To allow any computer user to watch movies easily streaming from torrents, without any particular knowledge.

![Demo Screenshot](http://i.imgur.com/6iNnWBO.png)

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

And ruby with compass to build the stylesheets. Read [this](http://thesassway.com/beginner/getting-started-with-sass-and-compass) for more information.

### Build

Install the node modules:

    $ npm install

Build with:

    $ grunt build

By default it will build for your current platform however you can control that
by specifying a comma separated list of platforms in the `platforms` option to
grunt:

    $ grunt build --platforms=linux32,linux64,mac,win

You can also build for all platforms with:

    $ grunt build --platforms=all

## Any problem?


### Regarding Video, MP4 H264 Playback
- Info: https://github.com/rogerwang/node-webkit/wiki/Support-mp3-and-h264-in-video-and-audio-tag
- Needed to build a custom build of node-webkit that adds h264 support (or you can download ready-to-go builds from https://file.ac/s4Lt3Vo6rls/)
- Alternatively, we can replace a .so and .dll file from the correspondent Chrome build to node-webkit and node-webkit.exe


## Development
- Run `grunt build` at least once after running `npm install`. This should fix a dependancy.
- Run `compass watch --css-dir css` in Terminal for CSS compiling and listen to future changes.
- [How to build with SublimeText](https://github.com/rogerwang/node-webkit/wiki/Debugging-with-Sublime-Text-2-and-3)
- Currently Gaze to watch all files and reload the app is disabled due to memory leaks and unstability.
- Run node-webkit from the root directory with --debug to enable debugging mode like so ```node-webkit . --debug```
