# [Popcorn Time](https://github.com/popcorn-official/popcorn-desktop)

[![Build Status](https://ci.popcorntime.app/job/Popcorn-Time-Desktop/badge/icon)](https://ci.popcorntime.app/job/Popcorn-Time-Desktop/)
[![Dependency Status](https://david-dm.org/popcorn-official/popcorn-desktop.svg)](https://david-dm.org/popcorn-official/popcorn-desktop)
[![devDependency Status](https://david-dm.org/popcorn-official/popcorn-desktop/dev-status.svg)](https://david-dm.org/popcorn-official/popcorn-desktop#info=devDependencies)
[![Twitter](https://img.shields.io/badge/twitter-@Popcorn%20Time-3299EC.svg?style=flat)](https://twitter.com/popcorntimetv)
[![Reddit](https://img.shields.io/badge/discussion-reddit-red.svg?style=flat)](https://reddit.com/r/popcorntime)
[![Forum](https://img.shields.io/badge/Forum-Discourse-blue.svg?style=flat)](https://discuss.popcorntime.app)
[![Facebook](https://img.shields.io/badge/facebook-Popcorn%20Time-354F88.svg?style=flat)](https://www.facebook.com/PopcornTimedotsh)



Allow any user to easily watch movies through torrent streaming, without any prerequisites.

Visit the project's website at <https://popcorntime.app>.

***

## Install

#### MacOS:

Easily install Popcorn Time via _[Homebrew](https://brew.sh) ([Cask](https://github.com/Homebrew/homebrew-cask#homebrew-cask))_ with `brew cask install https://raw.githubusercontent.com/popcorn-official/popcorn-desktop/development/casks/popcorn-time.rb`, or `brew cask install https://raw.githubusercontent.com/popcorn-official/popcorn-desktop/development/casks/popcorn-time-beta.rb` for the latest [stable] beta build. Also, if you keep a [_Brewfile_](https://github.com/Homebrew/homebrew-bundle#usage), you can add something like this:
~~~ rb
repo = 'popcorn-official/popcorn-desktop'
tap repo, "https://github.com/#{repo}.git"
cask 'popcorn-time'
~~~

#### Linux - Debian/Ubuntu based distros (tested on ubuntu 18.04):

* Install unzip && dependencies (they should not be always required but some users needed them to make Popcorn Time working) :  
`sudo apt update && sudo apt install unzip libcanberra-gtk-module libgconf-2-4 libatomic1`
* Create popcorn-time folder in /opt/ :  
`sudo mkdir /opt/popcorn-time`
* Download Popcorn Time archive :  
`wget https://get.popcorntime.app/repo/build/Popcorn-Time-0.4.4-linux64.zip`
* Extract the zip in /opt/popcorn-time :  
`sudo unzip Popcorn-Time-0.4.4-linux64.zip -d /opt/popcorn-time`
* Create symlink of Popcorn-Time in /usr/bin :  
`sudo ln -sf /opt/popcorn-time/Popcorn-Time /usr/bin/popcorn-time`
* Create .desktop file (so the launcher) :  
`sudo nano /usr/share/applications/popcorntime.desktop`
* and copy paste the following text in the editor and save  

```desktop
[Desktop Entry]
Version = 1.0
Type = Application
Terminal = false
Name = Popcorn Time
Exec = /usr/bin/popcorn-time
Icon = /opt/popcorn-time/src/app/images/icon.png
Categories = Application;
```


## Getting Involved

Want to report a bug, request a feature, contribute to or translate Popcorn Time? Check out our in-depth guide to [Contributing to Popcorn Time](CONTRIBUTING.md#contributing-to-popcorn-time). We need all the help we can get! You can also join our [community](README.md#community) to keep up-to-date and meet other developers.

## Getting Started

If you're comfortable getting up and running from a `git clone`, this method is for you.

The [master](https://github.com/popcorn-official/popcorn-desktop) branch which contains the latest release.

#### Quickstart:

1. `yarn start`

If you encounter trouble with the above method, you can try:  

1. `yarn config set yarn-offline-mirror ./node_modules/`
2. `yarn install --ignore-engines`
3. `yarn build`
5. `yarn start`

Optionally, you may simply run `./make_popcorn.sh` if you are on a linux or mac based operating system.

Full instructions & troubleshooting tips can be found in the [Contributing Guide](CONTRIBUTING.md#contributing-to-popcorn-time).


#### Building redistribuable packages/installers:

1. `yarn config set yarn-offline-mirror ./node_modules/`
2. `yarn install --ignore-engines`
2. `yarn dist --platforms=<platform>`

`<platform>` can be one or more of the folowing values (separated by a comma `,`):

- `win64`
- `win32`
- `linux64`
- `linux32`
- `osx64`
- `all`


Redistribuable packages are saved into `build/` subfolder.


<a name="community"></a>
## Community

Keep track of Popcorn Time development and community activity.

* Follow Popcorn Time on [Twitter](https://twitter.com/popcorntimetv) and [Facebook](https://www.facebook.com/PopcornTimeDotSh).
* Read and subscribe to [The Official Popcorn Time Blog](http://blog.popcorntime.app/).
* Join in discussions on the [Popcorn Time Forum](https://discuss.popcorntime.app/).

## Screenshots
![Popcorn Time](https://cloud.githubusercontent.com/assets/8317250/10714437/b1e1dc8c-7b32-11e5-9c25-d9fbd5b2f3bd.png)
![Debugging Popcorn Time](https://cloud.githubusercontent.com/assets/8317250/10714430/add70234-7b32-11e5-9be7-1de539d865ba.png)


## Versioning

For transparency and insight into our release cycle, and for striving to maintain backward compatibility, Popcorn Time will be maintained according to the [Semantic Versioning](http://semver.org/) guidelines as much as possible.

Releases will be numbered with the following format:

`<major>.<minor>.<patch>-<build>`

Constructed with the following guidelines:

* A new *major* release indicates a large change where backward compatibility is broken.
* A new *minor* release indicates a normal change that maintains backward compatibility.
* A new *patch* release indicates a bugfix or small change which does not affect compatibility.
* A new *build* release indicates this is a pre-release of the version.



## Archive Links for older installations
v3.10.0
* [Popcorn-Time-0.3.10-win32-Setup.exe](https://ci.popcorntime.app/job/Popcorn-Time-Desktop/200/artifact/build/Popcorn-Time-0.3.10-win32-Setup.exe)  58.90 MB
* [Popcorn-Time-0.3.10-win64-Setup.exe](https://ci.popcorntime.app/job/Popcorn-Time-Desktop/200/artifact/build/Popcorn-Time-0.3.10-win64-Setup.exe)  67.67 MB
* [Popcorn-Time-0.3.10_linux32.tar.xz](https://ci.popcorntime.app/job/Popcorn-Time-Desktop/200/artifact/build/Popcorn-Time-0.3.10_linux32.tar.xz)  63.10 MB
* [Popcorn-Time-0.3.10_linux64.tar.xz](https://ci.popcorntime.app/job/Popcorn-Time-Desktop/200/artifact/build/Popcorn-Time-0.3.10_linux64.tar.xz)  60.48 MB
* [Popcorn-Time-0.3.10_osx64.tar.xz](https://ci.popcorntime.app/job/Popcorn-Time-Desktop/200/artifact/build/Popcorn-Time-0.3.10_osx64.tar.xz)  50.43 MB
* [popcorn-time_0.3.10-28112f678_amd64.deb](https://ci.popcorntime.app/job/Popcorn-Time-Desktop/200/artifact/build/popcorn-time_0.3.10-28112f678_amd64.deb)  61.60 MB
* [popcorn-time_0.3.10-28112f678_i386.deb](https://ci.popcorntime.app/job/Popcorn-Time-Desktop/200/artifact/build/popcorn-time_0.3.10-28112f678_i386.deb)  65.17 MB



***

If you distribute a copy or make a fork of the project, you have to credit this project as the source.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see http://www.gnu.org/licenses/.

***

Copyright © 2019 Popcorn Time Project - Released under the [GPL v3 license](LICENSE.txt).
