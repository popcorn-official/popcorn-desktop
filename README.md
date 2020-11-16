# [Popcorn Time](https://github.com/popcorn-official/popcorn-desktop)

[![Latest Release](https://img.shields.io/github/v/release/popcorn-official/popcorn-desktop?color=brightgreen&label=latest%20release)![](https://img.shields.io/github/release-date/popcorn-official/popcorn-desktop?label=)](https://github.com/popcorn-official/popcorn-desktop/releases/latest)
[![Commits Since Latest Release](https://img.shields.io/github/commits-since/popcorn-official/popcorn-desktop/latest?label=commits%20since)](https://github.com/popcorn-official/popcorn-desktop/compare/master...development)
[![Latest Commit](https://img.shields.io/github/last-commit/popcorn-official/popcorn-desktop?label=latest%20commit)](https://github.com/popcorn-official/popcorn-desktop/commit/development)
[![Latest Build Status](https://ci.popcorntime.app/job/Popcorn-Time-Desktop/badge/icon?subject=latest%20build)](https://ci.popcorntime.app/job/Popcorn-Time-Desktop/)  
[![popcorntime.app Status](https://img.shields.io/website?down_color=red&down_message=offline&label=popcorntime.app&up_color=brightgreen&up_message=online&url=https%3A%2F%2Fpopcorntime.app)](https://popcorntime.app)
[![ci.popcorntime.app Status](https://img.shields.io/website?down_color=red&down_message=offline&label=ci.popcorntime.app&up_color=brightgreen&up_message=online&url=https%3A%2F%2Fci.popcorntime.app)](https://ci.popcorntime.app)
[![Twitter](https://img.shields.io/twitter/follow/r_popcorntime?color=3299EC&label=twitter&style=flat)](https://twitter.com/r_popcorntime)
[![Reddit](https://img.shields.io/reddit/subreddit-subscribers/PopCornTime?color=red&label=reddit&style=flat)](https://www.reddit.com/r/PopCornTime)
[![Forum](https://img.shields.io/discourse/posts?color=blue&label=forum&server=https%3A%2F%2Fdiscuss.popcorntime.app&style=flat)](https://discuss.popcorntime.app) 

Allow any user to easily watch movies through torrent streaming, without any prerequisites.

Visit the project's website at https://popcorntime.app.

***

## Install

### Windows:
Download and install:
  * **Latest release**: check [popcorntime.app](https://popcorntime.app/#get-app) or the repo's [releases page](https://github.com/popcorn-official/popcorn-desktop/releases)
  * Or **latest dev build (for testers)**: check the [latest successful build on ci.popcorntime.app](https://ci.popcorntime.app/job/Popcorn-Time-Desktop/lastSuccessfulBuild/)


### MacOS:
Easily install Popcorn Time via _[Homebrew](https://brew.sh) ([Cask](https://github.com/Homebrew/homebrew-cask#homebrew-cask)):_
  * **Latest release**:  
  `brew cask install https://raw.githubusercontent.com/popcorn-official/popcorn-desktop/development/casks/popcorn-time.rb`
  * Or **latest dev build (for testers)**:  
  `brew cask install https://raw.githubusercontent.com/popcorn-official/popcorn-desktop/development/casks/popcorn-time-beta.rb`

Also, if you keep a [_Brewfile_](https://github.com/Homebrew/homebrew-bundle#usage), you can add something like this:
  ~~~ rb
  repo = 'popcorn-official/popcorn-desktop'
  tap repo, "https://github.com/#{repo}.git"
  cask 'popcorn-time'
  ~~~


### Linux - Debian/Ubuntu based distros:
Via .deb package:

  _**Firstly, be aware** in some cases, missings dependencies packages (libatomic1, libgconf-2-4, libcanberra-gtk-module) were reported to be required for the app to works.  
  **If the app don't start for you too**, in this case, **try `sudo apt update && sudo apt install libatomic1 libgconf-2-4 libcanberra-gtk-module`** to be sure your system have the required dependencies._

Download and install:
  * **Latest release**: check [popcorntime.app](https://popcorntime.app/#get-app) or the repo's [releases page](https://github.com/popcorn-official/popcorn-desktop/releases)
  * Or **latest dev build (for testers)**: check the [latest successful build on ci.popcorntime.app](https://ci.popcorntime.app/job/Popcorn-Time-Desktop/lastSuccessfulBuild/)

Via archive and command line (tested on ubuntu 18.04 and 20.04):
  1. Download Popcorn Time archive:  
      * For the **latest release**:  
      `wget -c https://get.popcorntime.app/repo/build/Popcorn-Time-0.4.4-linux64.zip`  
  _if eventually you get issue with popcorntime.app website you can try to download from the github repo  
  `wget -c https://github.com/popcorn-official/popcorn-desktop/releases/download/v0.4.4/Popcorn-Time-0.4.4-linux64.zip`_
      * Or for the **latest dev build (for testers)**:  
      `wget -c https://ci.popcorntime.app/job/Popcorn-Time-Desktop/lastSuccessfulBuild/artifact/build/Popcorn-Time-0.4.4_linux64.zip -O Popcorn-Time-0.4.4-linux64.zip`
  2. Create popcorn-time folder in /opt/:  
  `sudo mkdir /opt/popcorn-time`  
  3. Install unzip && dependencies (they should not be always required but some users needed them to make Popcorn Time working):  
  `sudo apt update && sudo apt install unzip libcanberra-gtk-module libgconf-2-4 libatomic1`  
  4. Extract the zip in /opt/popcorn-time:  
  `sudo unzip Popcorn-Time-0.4.4-linux64.zip -d /opt/popcorn-time`  
  5. Create symlink of Popcorn-Time in /usr/bin:  
  `sudo ln -sf /opt/popcorn-time/Popcorn-Time /usr/bin/popcorn-time`  
  6. Create .desktop file (so the launcher):  
  `sudo nano /usr/share/applications/popcorntime.desktop`  
  7. and copy paste the following text in the editor and save  
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
Want to report a bug, request a feature, contribute to or translate Popcorn Time?  
Check out our in-depth guide to [Contributing to Popcorn Time](CONTRIBUTING.md#contributing-to-popcorn-time). We need all the help we can get!  
You can also join our [community](README.md#community) to keep up-to-date and meet other developers.  


## Getting Started

If you're comfortable getting up and running from a `git clone`, this method is for you.

The [development](https://github.com/popcorn-official/popcorn-desktop/tree/development) branch contains the latest changes.  
The [master](https://github.com/popcorn-official/popcorn-desktop/tree/master) branch contains the latest release.

#### Quickstart:

1. `yarn start`

If you encounter trouble with the above method, you can try:

1. `yarn config set yarn-offline-mirror ./node_modules/`
2. `yarn install --ignore-engines`
3. `yarn build`
4. `yarn start`

Optionally, you may simply run `./make_popcorn.sh` if you are on a linux or mac based operating system.

Full instructions & troubleshooting tips can be found in the [Contributing Guide](CONTRIBUTING.md#contributing-to-popcorn-time).

#### Building redistribuable packages/installers:

1. `yarn config set yarn-offline-mirror ./node_modules/`
2. `yarn install --ignore-engines`
3. `yarn dist --platforms=<platform>`

`<platform>` can be one or more of the folowing values (separated by a comma `,`):
* `win64`, `win32`, `linux64`, `linux32`, `osx64`, `all`

Redistribuable packages are saved into `build/` subfolder.


<a name="community"></a>
## Community
Keep track of Popcorn Time development and community activity.
  * Follow Popcorn Time on [Twitter](https://twitter.com/r_popcorntime).
  * Read and subscribe to [The Official Popcorn Time Blog](https://blog.popcorntime.app/).
  * Join in discussions on the [Popcorn Time Forum](https://discuss.popcorntime.app) and [r/PopCornTime](https://www.reddit.com/r/PopcornTime).


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
#### v0.3.10
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

Copyright © 2020 Popcorn Time Project - Released under the [GPL v3 license](LICENSE.txt).
