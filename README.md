#Popcorn Time [![Dependency Status](https://david-dm.org/popcorn-official/popcorn-app.svg)](https://david-dm.org/popcorn-official/popcorn-app)

### Idea

To allow any computer user an easy method of streaming movies from torrents, without any particular knowledge.

![Demo Screenshot](http://get-popcorn.com/images/header-ui.jpg)

### APIs

**Currently used APIs:**
- [YIFY](http://yts.re/api) movie torrents API.
- [YifySubtitles](http://www.yifysubtitles.com) for subtitles
- [Trakt.tv](https://trakt.tv/) for movies metadata.

### Development

See the [Development's page](https://github.com/popcorn-official/popcorn-app/wiki/Development)

### How to contribute

First, building, testing and reporting bug is highly appreciated. Please include console's output and reproduction step in your bug report.

Right now we are doing a lot of refactoring to clean the codebase so if you work on a new feature based on 0.2.x, it probably won't merge into 0.3.0. This is why we recommend you to hold all pull request other than bug fixes until we release 0.3.0 and stabilize the new codebase. From that point, we plan to add a lot of new features asked by the community and merge pull request.

If you want to develop, you can look at the issues, especialy the bugs and then fix them.
Here's a [list of feature](https://popcorntime.uservoice.com/forums/245422-general) requested by the community so far.

Please follow the [contributions guidelines](https://github.com/popcorn-official/popcorn-app/blob/master/CONTRIBUTING.md).

It is recommended to join us on IRC at `#popcorntime` on freenode ([web access](http://webchat.freenode.net/?channels=popcorntime)), most active developers hang in there. You can ask `phnz` or  `Sharkiller` for high priority task.

## Any problem?

### Need to report a bug? [Read the report guideline](https://github.com/popcorn-official/popcorn-app/blob/master/CONTRIBUTING.md#report-a-bug)

### Error about missing libudev.so.0
Search for libudev.so.0 on your distribution. Most of the time it can be easily fixed by creating a symbolic link from libudev.so to libudev.so.0

See: https://github.com/rogerwang/node-webkit/wiki/The-solution-of-lacking-libudev.so.0

### Error "Gtk-WARNING **: cannot open display:"
Try running `export DISPLAY=:0.0`

### Error "The video format is not supported"
See: https://github.com/rogerwang/node-webkit/wiki/Support-mp3-and-h264-in-video-and-audio-tag
