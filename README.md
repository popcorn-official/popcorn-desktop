#Popcorn Time [![Dependency Status](https://david-dm.org/popcorn-official/popcorn-app.svg)](https://david-dm.org/popcorn-official/popcorn-app)

### Idea

To allow any computer user to watch movies easily streaming from torrents, without any particular knowledge.

![Demo Screenshot](http://i.imgsnap.tk/image.php?i=4f31ffd842828a896fa26fe6222fc01d9193a10d5f770a5930e10d5f)
![](http://i.imgsnap.tk/image.php?i=36313fd842828a896fa26fe6222fc01d9193aa157b7481b3e95a157b)
![](https://photos-6.dropbox.com/t/0/AADzD3xqTr81MhS-F3xHWP8FFb0mVSQQyF0JxpOwU80kPQ/12/176835404/png/1024x768/3/1398931200/0/2/Screenshot%202014-04-30%2023.14.26.png/vNfW4EqtO8bqFk5QaEVS6pBTzLE-rfCUA-edcljLMDU)
![](http://i.imgsnap.tk/image.php?i=7530fd842828a896fa26fe6222fc01d9193a25fcf3b674b9b525fcf)
![](http://i.imgsnap.tk/image.php?i=e7d5957fafd842828a896fa26fe6222fc01d9193ae5a8d9f0c46878e5a8d)
### APIs

**Currently used:**
- [YIFY](http://yts.re/api) movie torrents API.
- [YifySubtitles](http://www.yifysubtitles.com) for subtitles
- [Trakt.tv](https://trakt.tv/) for movies metadata.

### Development

See [Development's 0.3 page](https://github.com/popcorn-official/popcorn-app/wiki/Build-and-Debug-dev-0.3)

### How to contribute

First, building, testing and reporting bug is highly appreciated. Please include console's output and reproduction step in your bug report.

Right now we are doing a lot of refactoring to clean the codebase so if you work on a new feature based on 0.2.x, it probably won't merge into 0.3.0. This is why we recommend you to hold all pull request other than bug fixes until we release 0.3.0 and stabilize the new codebase. From that point, we plan to add a lot of new features asked by the community and merge pull request.

If you want to develop, you can look at the issues, especialy the bug and fix them.
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

