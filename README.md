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

After you clone the GitHub repository, you will need to build a number of assets using grunt.

The [master](https://github.com/butterproject/butter-desktop) branch which contains the latest release.

#### Quickstart with `npm start`:

1. `npm install -g grunt-cli bower`
2. `npm start` (this runs `npm install && grunt build && grunt start` for you)

If you want to use the more granular control over whats getting run, use this: 

#### Quickstart:

1. `npm install -g grunt-cli bower`
2. `npm install`
3. `grunt build`
4. `grunt start`

If you encounter trouble with the above method, you can try:

1. `npm install -g bower grunt-cli` (Linux: you may need to run with `sudo`)
1. `cd desktop`
1. `npm install`
1. `bower install`
1. `grunt lang`
1. `grunt nwjs`
1. `grunt css`
1. `grunt start`

Optionally, you may simply run `./make_butter.sh` if you are on a Linux or Mac based operating system.

Full instructions & troubleshooting tips can be found in the [Contributing Guide](CONTRIBUTING.md#contributing-to-butter)

<a name="community"></a>
## Community

Keep track of Butter development and community activity.

* Follow Butter on [Twitter] (https://twitter.com/butterproject), [Facebook] (https://www.facebook.com/ButterProjectOrg/) and [Google+](https://plus.google.com/communities/111003619134556931561).
* Read and subscribe to [The Official Butter Blog](http://blog.butterproject.org).
* Join in discussions on the [Butter Forum](http://discuss.butterproject.org)
* Connect with us on IRC at `#butterproject` on freenode ([web access](http://webchat.freenode.net/?channels=butterproject))

##Screenshots
![Butter](https://cloud.githubusercontent.com/assets/8317250/10714437/b1e1dc8c-7b32-11e5-9c25-d9fbd5b2f3bd.png)
![Debugging Butter](https://cloud.githubusercontent.com/assets/8317250/10714430/add70234-7b32-11e5-9be7-1de539d865ba.png)


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
