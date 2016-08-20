# Building Butter

You want to build the sources yourself? Great! This little guide will help you achieve just that.

***

* [Prerequisites](#prerequisites)
 * [Windows](#windows)
 * [Linux](#linux)
 * [OSX](#osx)
* [How to build](#how-to-build)
 * [Build and run from sources](#build-from-sources)
 * [Create redistribuable packages](#create-redistribuable-packages)
 * [Keep your sources up-to-date](#keep-your-sources-up-to-date)

***

## Prerequisites
A few tools are required in order to build the sources:
- **NodeJS** _(Javascript runtime engine)_: `nodejs >= 4.x.x`
- **NPM** _(NodeJS package ecosystem)_: `npm >= 3.x.x` 
- **Git** _(Distributed revision control system)_: `git >= 2.x.x`

You'll also need about 2000MB (~2GB) of free space.

Compatible platforms:
- **Windows 7** and above
- **Mac OSX 10.7** and above
- **Linux**: Arch, Debian 6 and above, Ubuntu 12.04 and above, Fedora 17 and above

#### Windows
1. Download NodeJS: [https://nodejs.org](https://nodejs.org/en/download/) 
2. Install NodeJS and NPM _(NPM is part of NodeJS)_
3. Update NPM: [https://github.com/npm](https://github.com/npm/npm/wiki/Troubleshooting#upgrading-on-windows)
4. Download Git: [https://git-for-windows.github.io](https://git-for-windows.github.io/)
5. Install Git BASH _(you don't need Git GUI, but you can install it)_


#### Linux
1. Install NodeJS and NPM: [https://nodejs.org](https://nodejs.org/en/download/package-manager/)
2. Update NPM: `npm install -g npm@3`
3. Install Git via your package manager:
 - Debian/Ubuntu/Mint/Elementary: `sudo apt-get install git`
 - Arch/Manjaro: `pacman -S git`
 - Fedora/RedHat/CentOS: `sudo yum install git`

#### OSX
1. Download NodeJS: [https://nodejs.org](https://nodejs.org/en/download/)
2. Install NodeJS and NPM _(NPM is part of NodeJS)_
3. Update NPM: `npm install -g npm@3`
4. Install Git: [https://sourceforge.net](http://sourceforge.net/projects/git-osx-installer/)

***

## How to build

Now that the requirements are met, we can get the source code and build the application. All the following instructions happen in a console (git bash, gnome-terminal, ...)

#### Build from sources

1. Install `gulp`, the [development task automation toolkit](https://www.npmjs.com/package/gulp):

        npm install -g gulp-cli

2. Get the sources from the [GitHub repository](https://github.com/butterproject/butter-desktop):
    
        git clone https://github.com/butterproject/butter-desktop.git

3. Install the [application dependencies](https://github.com/butterproject/butter-desktop/blob/master/package.json#L36):

        npm install
        
4. Build the application with `gulp`:

        gulp build

    _Note: an unpacked build is available under the `/build/Butter/<platform>` directory_

5. Run the application from sources:

        gulp run

    _Note: on old Linux distributions, see [libudev.so.1 workaround](https://github.com/nwjs/nw.js/wiki/The-solution-of-lacking-libudev.so.1)._

#### Create redistribuable packages

`Gulp` can automate the packing of redistribuable packages from the source code you built. You'll need a few more prerequisites if you want to produce `.deb` or `.exe` installers:
- **NSIS** (version 3): Allows to compile a Windows installer. Download it on [Windows](http://nsis.sourceforge.net/Download) or [Debian/Ubuntu](https://launchpad.net/%7Epali/+archive/ubuntu/pali/+sourcepub/4562034/+listing-archive-extra). It is not available on OSX.
- **dpkg-deb**: Allows to compile .deb packages. Available only on Linux: `sudo apt-get install dpkg-deb fakeroot`

To build the application redistribuable binaries, you can run:

        gulp dist --platforms=all

#### Keep your sources up-to-date

With `git`, you can stay up-to-date easily and track the upstream modifications. To update and run the application, simply use:

        git pull
        npm install
        gulp build
        gulp run

***
