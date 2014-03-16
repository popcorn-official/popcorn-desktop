#Popcorn time [![Dependency Status](https://david-dm.org/yify/popcorn-app.png?theme=shields.io)](https://david-dm.org/yify/popcorn-app)

## Idea

To allow any computer user to watch movies easily streaming from torrents, without any particular knowledge.

![Demo Screenshot](http://static.cdnjd.com/imgs/how-ui.png)

### Status

Under development (RC1) for Mac OSX - Windows - Linux.

### APIs

**Currently used:**
- [YIFY](http://yts.re/api) movie torrents API.
- [OpenSubtitles](http://trac.opensubtitles.org/projects/opensubtitles/wiki/XMLRPC) for subtitles
- [TheMovieDB](http://www.themoviedb.org/) for movies metadata.

## Dependencies

You will need nodejs and grunt:

    $ npm install -g grunt-cli

And ruby with compass to build the stylesheets. Read [this](http://thesassway.com/beginner/getting-started-with-sass-and-compass) for more information.

## Running and debugging

Run at least once to install dependencies and generate css files.

    $ npm install
    $ grunt

Run compass in Terminal for CSS compiling and listen to future changes.

    $ compass watch --css-dir css

Run node-webkit from the root directory with --debug to enable debugging mode like so

    $ node-webkit . --debug

or

    $ nw . --debug

Press F12 to display the dev tools. Enjoy!

- Currently Gaze to watch all files and reload the app is disabled due to memory leaks and instability.

## Build

Install the node modules:


Build with:

    $ grunt build

By default it will build for your current platform however you can control that
by specifying a comma separated list of platforms in the `platforms` option to
grunt:

    $ grunt build --platforms=linux32,linux64,mac,win

You can also build for all platforms with:

    $ grunt build --platforms=all

## How to contribute

First, building, testing and reporting bug is highly appreciated. Please include console's output and reproduction step in your bug report.
If you want to develop, you can look at the issues, especialy the bug and fix them.

Join us on IRC at `#popcorntime` on freenode ([web access](http://webchat.freenode.net/?channels=popcorntime)), most active developpers hang in there.

## Any problem?

### Error about missing libudev.so.0
Search for libudev.0 on your distribution. Most of the time it can be easily fixed by creating a symbolic link from libudev.so to libudev.so.0

### Error "Gtk-WARNING **: cannot open display:"
Try running `export DISPLAY=:0.0`

### Error "The video format is not supported"
See: https://github.com/rogerwang/node-webkit/wiki/Support-mp3-and-h264-in-video-and-audio-tag
