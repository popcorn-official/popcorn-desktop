#!/bin/bash

#copy basefile
cp exec_basefile.sh linux-installer

#get version from package.json
version=$(cat ../../package.json | sed '/version/!d' | sed s/\"version\"://g | sed s/\"//g | sed s/\ //g | sed s/,//g)

#write version in script
sed -i "s/PT_VERSION/$version/g" linux-installer
