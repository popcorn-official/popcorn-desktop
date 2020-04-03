#!/bin/sh
BUILD_PATH="Popcorn-Time/osx64/Popcorn-Time.app"
APP_VER="$(cat package.json | grep version | cut -d '"' -f 4)"
CURRENT_DIR="$( dirname "${BASH_SOURCE[0]}" )"

cd $CURRENT_DIR/../../build
rm -Rf *.pkg
pkgbuild --root $BUILD_PATH --version $APP_VER --ownership recommended --install-location /Applications/Popcorn-Time.app Build.pkg
productbuild --resources ../dist/mac/resources/ --distribution ../dist/mac/resources/distribution.xml --version $APP_VER Popcorn-Time-$APP_VER.pkg
rm -Rf Build.pkg