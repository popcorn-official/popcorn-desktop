#!/bin/bash

#remove old script
rm -rf dist/linux/linux-dist-installer

#copy basefile
cp dist/linux/exec_dist_basefile.sh dist/linux/linux-dist-installer

#get version from package.json
version=$(cat package.json | sed '/version/!d' | sed s/\"version\"://g | sed s/\"//g | sed s/\ //g | sed s/\	//g | sed s/,//g)

#write version in script
sed -i "s/BT_VERSION/$version/g" dist/linux/linux-dist-installer
