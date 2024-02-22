#!/bin/bash
# launch 'copy-libatomic.sh <destination> <app-name> <platform>'

builddir=$1
projectName=$2
arch=$3

outDir="$1/$2/$3"

sudo dpkg --add-architecture i386
dpkg-query -s libatomic1
if [ ! $? = 0 ]; then
  sudo apt update
  sudo apt install -y libatomic1
fi
dpkg-query -s libatomic1:i386
if [ ! $? = 0 ]; then
  sudo apt update
  sudo apt install -y libatomic1:i386
fi

if [[ $arch == "linux64" ]]
then
  read source <<< `readlink -f /usr/lib/x86_64*/libatomic.so.*`
else
  read source <<< `readlink -f /usr/lib/i386*/libatomic.so.*`
fi
cp $source "$outDir/lib/libatomic.so.1"
