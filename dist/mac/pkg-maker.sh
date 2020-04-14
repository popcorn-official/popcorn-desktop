#!/bin/sh
APP_NAME="$(cat package.json | grep '\"name\"' | cut -d '"' -f 4)"
APP_VER="$(cat package.json | grep version | cut -d '"' -f 4)"
BUILD_PATH="${APP_NAME}/osx64/${APP_NAME}.app"
CURRENT_DIR="$( dirname "${BASH_SOURCE[0]}" )"

cd $CURRENT_DIR/../../build

rm -Rf *.pkg
pkgbuild --root $BUILD_PATH --version $APP_VER --ownership recommended --install-location /Applications/${APP_NAME}.app Build.pkg
productbuild --resources ../dist/mac/resources/ --distribution ../dist/mac/resources/distribution.xml --version $APP_VER $APP_NAME-$APP_VER.pkg
rm -Rf Build.pkg
