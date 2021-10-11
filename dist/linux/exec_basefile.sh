#!/bin/bash

#Error
func_error() {
[ $error == "0" ] && return 0
echo "
Unexpected Error:
=================
at: $current
... Please try again."
exit 1 
}

#Get current architecture
current="1:Set architecture"
if [[ $(uname --machine) == "x86_64" ]] ; then
	arch="64" && error=0
elif [[ $(uname --machine) == "i"*"86" ]] ; then
	arch="32" && error=0
else
	error=1
fi
func_error

#Variables
version="BT_VERSION"
tos="http://butterproject.org/tos.html"

#Disclaimer
clear
echo "
Butter $version - Linux $arch bits
==================================

Please read our Terms of service:
	$tos

This installer will install Butter in:
	~/.Butter
	~/.local/share/applications
	~/.local/share/icons
"

{ read -p "To continue, type 'I agree': " r </dev/tty ; if [ "$r" != "I agree" ] || [ ! "$r" ] ; then echo "
Did not get the user agreement. Exiting." && exit 0 ; fi ; }

#if agreed, start install
clear
echo "
Butter $version - Linux $arch bits
=================================="

#extract archive
current="1: Copy files"
echo "
- Copying files to ~/.Butter"
mkdir -p "$HOME/.Butter"
cp -r locales node_modules src git.json CHANGELOG.md icudtl.dat libffmpegsumo.so LICENSE.txt nw.pak package.nw package.json Butter README.md "$HOME/.Butter" &> /dev/null && error=0 || error=1

#move icon
mkdir -p "$HOME/.local/share/icons"
cp butter.png "$HOME/.local/share/icons/butter.png" &> /dev/null && error=0 || error=1

func_error

#create .desktop in home
echo "
- Creating new configuration files..."

current="2: Desktop file"
mkdir -p "$HOME/.local/share/applications"

echo "[Desktop Entry]
Comment=Watch Movies and TV Shows instantly
Name=Butter
Exec=$HOME/.Butter/Butter
Icon=butter.png
MimeType=application/x-bittorrent;x-scheme-handler/magnet;
StartupNotify=false
Categories=AudioVideo;Video;Network;Player;P2P;
Type=Application" > "$HOME/.local/share/applications/Butter.desktop" && error=0 || error=1
func_error

# Work-around for missing libudev.so.1 on Ubuntu 12.04
if [ ! -e /lib/$(uname --machine)-linux-gnu/libudev.so.1 ]; then
	ln -s /lib/$(uname --machine)-linux-gnu/libudev.so.0 $HOME/.Butter/libudev.so.1
	sed -i 's,Exec=,Exec=env LD_LIBRARY_PATH='"$HOME"'/.Butter ,g' $HOME/.local/share/applications/Butter.desktop
fi

#chmod .desktop
current="3: Chmod files"
chmod +x "$HOME/.Butter/Butter/Butter" &> /dev/null && error=0 || error=1
chmod +x "$HOME/.local/share/applications/Butter.desktop" &> /dev/null && error=0 || error=1
func_error

#uninstaller
echo "How to uninstall Butter ?
===============================

1) Main application:
- Delete ~/.Butter
- Delete ~/.local/share/applications/Butter.desktop
- Delete ~/.local/share/icons/butter.png

2) Configuration files and databases:
- Delete ~/.config/Butter" > "$HOME/.Butter/Uninstall.txt"

#installation success
echo "

Butter is now installed in:
	«$HOME/.Butter»
"
