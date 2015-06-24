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

#progressbar on download
progressfilt ()
{
    local flag=false c count cr=$'\r' nl=$'\n'
    while IFS='' read -d '' -rn 1 c
    do
        if $flag
        then
            printf '%c' "$c"
        else
            if [[ $c != $cr && $c != $nl ]]
            then
                count=0
            else
                ((count++))
                if ((count > 1))
                then
                    flag=true
                fi
            fi
        fi
    done
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
downloadlink="http://cdn.popcorntime.io/build/Popcorn-Time-$version-Linux-$arch.tar.gz"

#Disclaimer
clear
echo "
Popcorn Time $version - Linux $arch bits
==================================

Please read our Terms of service:
	$tos

This installer will download and install Popcorn Time in:
	~/.Popcorn-Time
	~/.local/share/applications
"

{ read -p "If you agree with our ToS, type 'I agree': " r </dev/tty ; if [ "$r" != "I agree" ] || [ ! "$r" ] ; then echo "
The Terms of Service haven't been accepted." && exit 0 ; fi ; }

#if agreed, start install
clear
echo "
Popcorn Time $version - Linux $arch bits
=================================="

#download in temp and install in home
current="2:Get archive"
echo "
- Downloading and extracting the archive...
"
wget --progress=bar:force -O /tmp/popcorntime.tar.gz $downloadlink 2>&1 | progressfilt && error=0 || error=1
func_error

#extract archive
current="3:Extract archive"
mkdir -p "$HOME/.Popcorn-Time"
tar -xf /tmp/popcorntime.tar.gz -C /tmp --overwrite --preserve-permissions && error=0 || error=1
cp /tmp/Popcorn-Time/* "$HOME/.Popcorn-Time" &> /dev/null && error=0 || error=1
func_error

#download icon and install in home
wget -O "$HOME/.Popcorn-Time/icon.png" http://i.imgur.com/BhQu7He.png &> /dev/null

#create .desktop in home
echo "
- Creating new configuration files..."

current="4:Desktop file"
echo "[Desktop Entry]
Comment=Watch Movies and TV Shows instantly
Name=Popcorn Time
Exec=$HOME/.Popcorn-Time/Popcorn-Time
Icon=$HOME/.Popcorn-Time/icon.png
MimeType=application/x-bittorrent;x-scheme-handler/magnet;
StartupNotify=false
Categories=AudioVideo;Player;
Type=Application" > "$HOME/.local/share/applications/Popcorn-Time.desktop" && error=0 || error=1
func_error

# Work-around for missing libudev.so.1 on Ubuntu 12.04
if [ ! -e /lib/$(arch)-linux-gnu/libudev.so.1 ]; then
	ln -s /lib/$(arch)-linux-gnu/libudev.so.0 $HOME/.Popcorn-Time/libudev.so.1
	sed -i 's,Exec=,Exec=env LD_LIBRARY_PATH='"$HOME"'/.Popcorn-Time ,g' $HOME/.local/share/applications/Popcorn-Time.desktop
fi

#chmod .desktop
current="5:Chmod files"
chmod +x "$HOME/.Popcorn-Time/Popcorn-Time/Popcorn-Time" &> /dev/null && error=0 || error=1
chmod +x "$HOME/.local/share/applications/Popcorn-Time.desktop" &> /dev/null && error=0 || error=1
func_error

#uninstaller
echo "How to uninstall Popcorn Time ?
===============================

1) Main application:
- Delete ~/.Popcorn-Time
- Delete ~/.local/share/applications/Popcorn-Time.desktop

2) Configuration files and databases:
- Delete ~/.config/Popcorn-Time" > "$HOME/.Popcorn-Time/Uninstall.txt"

#installation success
echo "

Popcorn Time is now installed in:
	«$HOME/.Popcorn-Time»
"
