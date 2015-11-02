#!/bin/bash

#remove old script
rm -rf dist/linux/linux-installer

#copy basefile
cp dist/linux/exec_basefile.sh dist/linux/linux-installer

#get version from package.json
version=$(cat package.json | sed '/version/!d' | sed s/\"version\"://g | sed s/\"//g | sed s/\ //g | sed s/\	//g | sed s/,//g)

#write version in script
sed -i "s/BT_VERSION/$version/g" dist/linux/linux-installer
