#!/bin/bash
# launch 'copy-libatomic.sh <platform> <app-name> <destination>'

arch=$1
projectName=$2
builddir=$3

outDir="$3/$2/$1"

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

if [[ $arch -eq "linux64" ]]; then
  read source <<< `readlink -f /usr/lib/x86_64*/libatomic.so.*`
else
  read source <<< `readlink -f /usr/lib/i386*/libatomic.so.*`
fi
echo "copy $source to $outDir" > "$outDir/echo"
cp $source "$outDir/lib/libatomic.so.1"
