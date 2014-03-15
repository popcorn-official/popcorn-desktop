#Popcorn time [![Dependency Status](https://david-dm.org/isra17/popcorn-app.svg?theme=shields.io)](https://david-dm.org/isra17/popcorn-app)

To allow any computer user to watch movies easily streaming from torrents, without any particular knowledge.

## Building

### Dependencies

You will need nodejs and grunt:

    $ npm install -g grunt-cli

And ruby with compass to build the stylesheets. Read [this](http://thesassway.com/beginner/getting-started-with-sass-and-compass) for more information.

### Running and debugging

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

- Currently Gaze to watch all files and reload the app is disabled due to memory leaks and unstability.

### Build

Install the node modules:


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

