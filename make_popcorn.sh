#!/usr/bin/bash

## Version 0.1.1
##
## Usage
## ./make_popcorn.sh [url]
##
## The script make_popcorn.sh allows you to clone, setup, and build a version of Popcorn Time
## The [url] handle is optional and allows you to pick what repository you wish to clone
## If you use 'ssh' in the place of the optional [url] parameter, it will clone via ssh instead of http
##
## Optionally, you can also pass in a specific branch to build or clone, by making url contain a branch specifier
## ./make_popcorn.sh '-b release/0.3.4 https://github.com/popcorn-official/popcorn-desktop'
##


clone_repo="True"
if [ -z "$1" ]; then
    clone_url="https://github.com/popcorn-official/popcorn-desktop.git"
elif [ "$1" = "ssh" ]; then
    clone_url="ssh://git@github.com:popcorn-official/popcorn-desktop.git"
else
    clone_url="$1"
fi

clone_command() {
    if git clone $clone_url $dir; then
        echo "Cloned Popcorn Time successfully"
    else
        echo "Popcorn Time encountered an error and could not be cloned"
        exit 2
    fi
}

if [ -e ".git/config" ]; then
    dat=$(grep url .git/config)
    case $dat in *popcorn*)
        echo "You appear to be inside of a Popcorn Time repository already, not cloning"
        clone_repo="False"
        ;;
    *)
        try="True"
        tries=0
        while [ "$try" = "True" ]; do
            read -p "Looks like we are inside a git repository, do you wish to clone inside it? (yes/no) [no] " rd_cln
            if [ -z "$rd_cln" ]; then
                rd_cln='no'
            fi
            tries=$((tries+1))
            if [ "$rd_cln" = "yes" ] || [ "$rd_cln" = "no" ]; then
                try="False"
            elif [ "$tries" -ge "3" ]; then
                echo "No valid input, exiting"
                exit 1
            else
                echo "Not a valid answer, please try again"
            fi
        done
        if [ "$rd_cln" = "no" ]; then
            echo "You appear to be inside of a Popcorn Time repository already, not cloning"
            clone_repo="False"
        else
            echo "You've chosen to clone inside the current directory"
        fi
        ;;
    esac
fi
if [ "$clone_repo" = "True" ]; then
    echo "Cloning Popcorn Time"
    read -p "Where do you wish to clone Popcorn Time to? [popcorn] " dir
    if [ -z "$dir" ]; then
        dir='popcorn'
    elif [ "$dir" = "/" ]; then
        dir='popcorn'
    fi
    if [ ! -d "$dir" ]; then
        clone_command

    else
        try="True"
        tries=0
        while [ "$try" = "True" ]; do
            read -p "Directory $dir already exists, do you wish to delete it and redownload? (yes/no) [no] " rd_ans
            if [ -z "$rd_ans" ]; then
                rd_ans='no'
            fi
            tries=$((tries+1))
            if [ "$rd_ans" = "yes" ] || [ "$rd_ans" = "no" ]; then
                try="False"
            elif [ "$tries" -ge "3" ]; then
                echo "No valid input, exiting"
                exit 3
            else
                echo "Not a valid answer, please try again"
            fi
        done
        if [ "$rd_ans" = "yes" ]; then
            echo "Removing old directory"
            if [ "$dir" != "." ] || [ "$dir" != "$PWD" ]; then
                echo "Cleaning up from inside the destination directory"
                rm -rf $dir
            fi
            clone_command
        else
            echo "Directory already exists and you've chosen not to clone again"
        fi
    fi
fi

if [ -z "$dir" ]; then
    dir="."
fi
cd $dir
echo "Switched to $PWD"

if [ "$rd_dep" = "yes" ]; then

    echo "Installing local dependencies"
    yarn config set yarn-offline-mirror ./node_modules/
    yarn install --ignore-engines
    yarn build
    echo "Successfully setup for Popcorn Time"
fi

if yarn build; then
    echo "Popcorn Time built successfully!"
    if [[ `uname -s` != *"NT"* ]]; then # if not windows
        ./Create-Desktop-Entry
    fi
    echo "Run 'yarn start' to launch the app or run Popcorn-Time from the ./build folder..."
    echo "Enjoy!"
else
    echo "Popcorn Time encountered an error and couldn't be built"
    exit 5
fi
