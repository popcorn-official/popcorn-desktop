#!/bin/sh

# launch 'deb-make.sh 0.12.1 linux32' for example

nw=$1
arch=$2
if [[ $arch == *"32"* ]]; then
  real_arch="i386"
else
  real_arch="amd64"
fi
cwd="build/releases/deb-package/$arch"
name="popcorn-time"
read -n 9 revision <<< ` git log -1 --pretty=oneline`
version=$(sed -n 's|\s*\"version\"\:\ \"\(.*\)\"\,|\1|p' package.json)
package_name=${name}_${version}_${arch}-${revision}

### SOURCE TREE
#create package dir
mkdir -p $cwd/$package_name

#create dir tree
mkdir -p $cwd/$package_name/usr/share/applications #desktop
mkdir -p $cwd/$package_name/opt/Popcorn-Time #app files
mkdir -p $cwd/$package_name/usr/share/icons #icon

### COPY FILES
#base
cp -r build/cache/$arch/$nw/locales $cwd/$package_name/opt/Popcorn-Time/
cp build/cache/$arch/$nw/icudtl.dat $cwd/$package_name/opt/Popcorn-Time/
cp build/cache/$arch/$nw/libffmpegsumo.so $cwd/$package_name/opt/Popcorn-Time/
cp build/cache/$arch/$nw/nw $cwd/$package_name/opt/Popcorn-Time/Popcorn-Time
cp build/cache/$arch/$nw/nw.pak $cwd/$package_name/opt/Popcorn-Time/

#src
cp -r src $cwd/$package_name/opt/Popcorn-Time/
cp package.json $cwd/$package_name/opt/Popcorn-Time/
cp LICENSE.txt $cwd/$package_name/opt/Popcorn-Time/
cp CHANGELOG.md $cwd/$package_name/opt/Popcorn-Time/
#TODO:clean src/app

#node_modules
cp -r node_modules $cwd/$package_name/opt/Popcorn-Time/node_modules
#TODO:clean node_modules

#icon
cp src/app/images/icon.png $cwd/$package_name/usr/share/icons/popcorntime.png

#desktop
echo "[Desktop Entry]
Comment=Watch Movies and TV Shows instantly
Name=Popcorn Time
Exec=/opt/Popcorn-Time/Popcorn-Time
Icon=popcorntime.png
MimeType=application/x-bittorrent;x-scheme-handler/magnet;
StartupNotify=false
Categories=AudioVideo;Video;Network;Player;P2P;
Type=Application
" > $cwd/$package_name/usr/share/applications/popcorn-time.desktop

### DEBIAN
mkdir -p $cwd/$package_name/DEBIAN

#control
echo "
Package: $name
Version: $version
Section: web
Priority: optional
Architecture: $real_arch
Depends:
Maintainer: Popcorn Time Official <hello@popcorntime.io>
Description: Popcorn Time
 Watch Movies and TV Series instantly
" > $cwd/$package_name/DEBIAN/control

#copyright
echo "Format: http://www.debian.org/doc/packaging-manuals/copyright-format/1.0/
Upstream-Name: Popcorn Time
Source: popcorntime.io

Files: *
Copyright: 2014 Popcorn Time and the contributors <hello@popcorntime.io>
License: GPL-3.0+
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 .
 This package is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 .
 You should have received a copy of the GNU General Public License
 along with this program. If not, see <http://www.gnu.org/licenses/>.
 .
 On Debian systems, the complete text of the GNU General
 Public License version 3 can be found in \"/usr/share/common-licenses/GPL-3\".
" > $cwd/$package_name/DEBIAN/copyright

#postinstall script
echo "#!/bin/sh
set -e

# Work-around Menu item not being created on first installation
if [ -x /usr/bin/desktop-file-install ]; then
	desktop-file-install /usr/share/applications/popcorn-time.desktop
else
	chmod +x /usr/share/applications/popcorn-time.desktop
fi

# Work-around for My App not being executable:
if [ -e /opt/Popcorn-Time/Popcorn-Time ]; then
	chmod +x /opt/Popcorn-Time/Popcorn-Time
fi

if [ ! -e /lib/$(arch)-linux-gnu/libudev.so.1 ]; then
	ln -s /lib/$(arch)-linux-gnu/libudev.so.0 /opt/Popcorn-Time/libudev.so.1
	sed -i 's,Exec=,Exec=env LD_LIBRARY_PATH=/opt/Popcorn-Time ,g' /usr/local/share/applications/popcorn-time.desktop
fi
" > $cwd/$package_name/DEBIAN/postinst

#pre-remove script
echo "#!/bin/sh
set -e

#remove app files
rm -rf /opt/Popcorn-Time

#remove icon
rm -rf /usr/share/icons/popcorntime.png

#remove desktop
rm -rf /usr/share/applications/popcorn-time.desktop
" > $cwd/$package_name/DEBIAN/prerm

### CLEAN
shopt -s globstar
cd $cwd/$package_name/opt/Popcorn-Time
rm -rf node_modules/bower/** 
rm -rf node_modules/*grunt*/** 
rm -rf node_modules/stylus/** 
rm -rf ./**/test*/** 
rm -rf ./**/doc*/** 
rm -rf ./**/example*/** 
rm -rf ./**/demo*/** 
rm -rf ./**/bin/** 
rm -rf ./**/build/** 
rm -rf **/*.*~
cd ../../../../../../../


### PERMISSIONS
chmod 0644 $cwd/$package_name/usr/share/applications/popcorn-time.desktop
chmod -R 0755 $cwd/$package_name/DEBIAN

### BUILD
cd $cwd
dpkg-deb --build $package_name

### CLEAN
cd ../../../
mv $cwd/popcorn-time*.deb dist/linux
rm -rf build/releases/deb-package
