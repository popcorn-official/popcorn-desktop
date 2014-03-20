#Popcorn time [![Dependency Status](https://david-dm.org/popcorn-team/popcorn-app.svg?theme=shields.io)](https://david-dm.org/popcorn-team/popcorn-app)

### Idea

To allow any computer user to watch movies easily streaming from torrents, without any particular knowledge.

![Demo Screenshot](http://static.cdnjd.com/imgs/how-ui.png)

### Status

Under development (RC1) for Mac OSX - Windows - Linux.

### APIs

**Currently used:**
- [YIFY](http://yts.re/api) movie torrents API.
- [YifySubtitles](http://www.yifysubtitles.com) for subtitles
- [Trakt.tv](https://trakt.tv/) for movies metadata.

### Development

See [Development's page](https://github.com/popcorn-team/popcorn-app/wiki/Development)

### How to contribute

First, building, testing and reporting bug is highly appreciated. Please include console's output and reproduction step in your bug report.
If you want to develop, you can look at the issues, especialy the bug and fix them.
Here's a [list of feature](https://github.com/popcorn-team/popcorn-app/wiki/Feature-Proposal) requested by the community so far.

Please follow the [contributions guidelines](https://github.com/popcorn-team/popcorn-app/wiki/Contribution-Guidelines).

Join us on IRC at `#popcorntime` on freenode ([web access](http://webchat.freenode.net/?channels=popcorntime)), most active developers hang in there.

## Any problem?

### Error about missing libudev.so.0
Search for libudev.so.0 on your distribution. Most of the time it can be easily fixed by creating a symbolic link from libudev.so to libudev.so.0

See: https://github.com/rogerwang/node-webkit/wiki/The-solution-of-lacking-libudev.so.0

### Error "Gtk-WARNING **: cannot open display:"
Try running `export DISPLAY=:0.0`

### Error "The video format is not supported"
See: https://github.com/rogerwang/node-webkit/wiki/Support-mp3-and-h264-in-video-and-audio-tag
