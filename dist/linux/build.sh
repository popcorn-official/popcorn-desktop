#!/bin/sh

# Builds Popcorn Time for Linux
# (node-webkit version is for 64 bits linux)

POPCORNPATH=$(pwd)/../..
NWAPP=$POPCORNPATH/node-webkit/linux/
BUILDPATH=$(pwd)/PopcornTime
TMPBUILD=$BUILDPATH/tmp

rm -rf "$BUILDPATH"

# Start by taking the standard node-webkit for linux
mkdir "$BUILDPATH"
cp -a "$NWAPP" "$BUILDPATH/nw"

# Now copy all the necessary files into the tmp build path
mkdir "$TMPBUILD"
cp "$POPCORNPATH/index.html" "$TMPBUILD"
cp "$POPCORNPATH/package.json" "$TMPBUILD"
cp -a "$POPCORNPATH/css" "$TMPBUILD/css"
cp -a "$POPCORNPATH/js" "$TMPBUILD/js"
cp -a "$POPCORNPATH/fonts" "$TMPBUILD/fonts"
cp -a "$POPCORNPATH/images" "$TMPBUILD/images"
cp -a "$POPCORNPATH/language" "$TMPBUILD/language"
cp -a "$POPCORNPATH/tmp" "$TMPBUILD/tmp"
cp -a "$POPCORNPATH/node_modules" "$TMPBUILD/node_modules"

cd $TMPBUILD
zip -r popcorn-app.nw *
cat $BUILDPATH/nw/nw popcorn-app.nw > $BUILDPATH/popcorn-app.run
cd $BUILDPATH
chmod +x $BUILDPATH/popcorn-app.run
cp $BUILDPATH/nw/nw.pak $BUILDPATH/nw.pak
cp $BUILDPATH/nw/libffmpegsumo.so $BUILDPATH/libffmpegsumo.so
zip popcorn-app_linux64.zip nw.pak libffmpegsumo.so popcorn-app.run