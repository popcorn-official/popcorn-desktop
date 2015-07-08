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
if [[ $(arch) == "x86_64" ]] ; then
	arch="64" && error=0
elif [[ $(arch) == "i"*"86" ]] ; then
	arch="32" && error=0
else
	error=1
fi
func_error

#Variables
version="PT_VERSION"
tos="https://popcorntime.io/tos"

#Disclaimer
clear
echo "
Popcorn Time $version - Linux $arch bits
==================================

Please read our Terms of service:
	$tos

This installer will install Popcorn Time in:
	~/.Popcorn-Time
	~/.local/share/applications
	~/.local/share/icons
"

{ read -p "To continue, type 'I agree': " r </dev/tty ; if [ "$r" != "I agree" ] || [ ! "$r" ] ; then echo "
Did not get the user agreement. Exiting." && exit 0 ; fi ; }

#if agreed, start install
clear
echo "
Popcorn Time $version - Linux $arch bits
=================================="

#extract archive
current="1: Copy files"
echo "
- Copying files to ~/.Popcorn-Time"
mkdir -p "$HOME/.Popcorn-Time"
cp -r locales icudtl.dat libffmpegsumo.so nw.pak Popcorn-Time "$HOME/.Popcorn-Time" &> /dev/null && error=0 || error=1

#move icon
mkdir -p "$HOME/.local/share/icons"
cp popcorntime.png "$HOME/.local/share/icons/popcorntime.png" &> /dev/null && error=0 || error=1

func_error

#create .desktop in home
echo "
- Creating new configuration files..."

current="2: Desktop file"
mkdir -p "$HOME/.local/share/applications"

echo "[Desktop Entry]
Comment=Watch Movies and TV Shows instantly
Name=Popcorn Time
Exec=$HOME/.Popcorn-Time/Popcorn-Time
Icon=popcorntime.png
MimeType=application/x-bittorrent;x-scheme-handler/magnet;
StartupNotify=false
Categories=AudioVideo;Video;Network;Player;P2P;
Type=Application" > "$HOME/.local/share/applications/Popcorn-Time.desktop" && error=0 || error=1
func_error

# Work-around for missing libudev.so.1 on Ubuntu 12.04
if [ ! -e /lib/$(arch)-linux-gnu/libudev.so.1 ]; then
	ln -s /lib/$(arch)-linux-gnu/libudev.so.0 $HOME/.Popcorn-Time/libudev.so.1
	sed -i 's,Exec=,Exec=env LD_LIBRARY_PATH='"$HOME"'/.Popcorn-Time ,g' $HOME/.local/share/applications/Popcorn-Time.desktop
fi

#chmod .desktop
current="3: Chmod files"
chmod +x "$HOME/.Popcorn-Time/Popcorn-Time/Popcorn-Time" &> /dev/null && error=0 || error=1
chmod +x "$HOME/.local/share/applications/Popcorn-Time.desktop" &> /dev/null && error=0 || error=1
func_error

#uninstaller
echo "How to uninstall Popcorn Time ?
===============================

1) Main application:
- Delete ~/.Popcorn-Time
- Delete ~/.local/share/applications/Popcorn-Time.desktop
- Delete ~/.local/share/icons/popcorntime.png

2) Configuration files and databases:
- Delete ~/.config/Popcorn-Time" > "$HOME/.Popcorn-Time/Uninstall.txt"

#installation success
echo "

Popcorn Time is now installed in:
	«$HOME/.Popcorn-Time»
"
