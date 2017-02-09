# [Butter](https://github.com/butterproject/butter-desktop)

[![Build Status](https://travis-ci.org/butterproject/butter-desktop.svg?branch=master)](https://travis-ci.org/butterproject/butter-desktop)
[![Dependency Status](https://david-dm.org/butterproject/butter-desktop.svg)](https://david-dm.org/butterproject/butter-desktop)
[![devDependency Status](https://david-dm.org/butterproject/butter-desktop/dev-status.svg)](https://david-dm.org/butterproject/butter-desktop#info=devDependencies)

Allow any user to easily watch movies through torrent streaming, without any prerequisites.

Visit the project's website at <http://butterproject.org>.

***

## Getting Involved

Want to report a bug, request a feature, contribute to or translate Butter? Check out our in-depth guide to [Contributing to Butter](CONTRIBUTING.md#contributing-to-butter). We need all the help we can get! You can also join our [community](README.md#community) to keep up-to-date and meet other Butterrs.

## Getting Started

If you're comfortable getting up and running from a `git clone`, this method is for you.

After you clone the GitHub repository, you will need to build a number of assets using gulp.

The [master](https://github.com/butterproject/butter-desktop) branch which contains the latest release.

#### Quickstart:

    npm install -g gulp-cli
    npm install
    gulp build
    gulp run

Full instructions & troubleshooting tips can be found in the [Contributing Guide](CONTRIBUTING.md#contributing-to-butter)

<a name="community"></a>
## Community

Keep track of Butter development and community activity.

* Follow Butter on [Twitter] (https://twitter.com/butterproject), [Facebook] (https://www.facebook.com/ButterProjectOrg/) and [Google+](https://plus.google.com/communities/111003619134556931561).
* Read and subscribe to [The Official Butter Blog](http://blog.butterproject.org).
* Join in discussions on the [Butter Forum](https://www.reddit.com/r/ButterProject)
* Connect with us on IRC at `#butterproject` on freenode ([web access](http://webchat.freenode.net/?channels=butterproject))

##Screenshots
![Butter](https://cloud.githubusercontent.com/assets/8317250/10714437/b1e1dc8c-7b32-11e5-9c25-d9fbd5b2f3bd.png)
![Debugging Butter](https://cloud.githubusercontent.com/assets/8317250/10714430/add70234-7b32-11e5-9be7-1de539d865ba.png)

## Supported codecs

Butter currently support native decoding for the following codecs

Linux and Mac

* `aac, ac3, aac3, h264, mp1, mp2, mp3, mpeg4, mpegvideo, msmpeg4v1, msmpeg4v2, msmpeg4v3, hevc, flv, dca, flac`

Windows

* `aac, ac3, eac3, h264, mp1, mp2, mp3, mpeg4, mpegvideo, hevc, flv, dca, flac`

## Versioning

For transparency and insight into our release cycle, and for striving to maintain backward compatibility, Butter will be maintained according to the [Semantic Versioning](http://semver.org/) guidelines as much as possible.

Releases will be numbered with the following format:

`<major>.<minor>.<patch>-<build>`

Constructed with the following guidelines:

* A new *major* release indicates a large change where backward compatibility is broken.
* A new *minor* release indicates a normal change that maintains backward compatibility.
* A new *patch* release indicates a bugfix or small change which does not affect compatibility.
* A new *build* release indicates this is a pre-release of the version.


***

If you distribute a copy or make a fork of the project, you have to credit this project as the source.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see http://www.gnu.org/licenses/ .

***

Copyright (c) 2015 Butter Project - Released under the
[GPL v3 license](LICENSE.txt).
