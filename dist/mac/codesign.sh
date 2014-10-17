dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
build="$dir/../../build/releases/Popcorn-Time/mac"
app="$build/Popcorn-Time.app"
identity="2Z88DW977Y"

test -z "$1" && {
  echo "You need to provide the version."
  exit 1
}

echo "### remove previous dmg"
rm -Rf ${build}/*.dmg

echo "### signing frameworks"
codesign --force --verify --verbose --sign "$identity" "$app/Contents/Frameworks/node-webkit Framework.framework/node-webkit Framework"
codesign --force --verify --verbose --sign "$identity" "$app/Contents/Frameworks/node-webkit Helper EH.app/"
codesign --force --verify --verbose --sign "$identity" "$app/Contents/Frameworks/node-webkit Helper NP.app/"
codesign --force --verify --verbose --sign "$identity" "$app/Contents/Frameworks/node-webkit Helper.app/"
codesign --force --verify --verbose --sign "$identity" "$app/Contents/Frameworks/crash_inspector"

echo "### signing webkit"
codesign --force --verify --verbose --sign "$identity" "$app/Contents/MacOS/node-webkit"

echo "### signing app"
codesign --force --verify --verbose --sign "$identity" "$app"

echo "### verifying signature"
codesign -vvv -d "$app"

echo "### create dmg"
dist/mac/yoursway-create-dmg/create-dmg --volname "Popcorn Time $1" --background ./dist/mac/background.png --window-size 480 540 --icon-size 128 --app-drop-link 240 370 --icon "Popcorn-Time" 240 110 $dir/../../build/releases/Popcorn-Time/mac/Popcorn-Time-$1-Mac.dmg $dir/../../build/releases/Popcorn-Time/mac/

dmg="$dir/../../build/releases/Popcorn-Time/mac/Popcorn-Time-$1-Mac.dmg"

echo "### signing dmg"
codesign --force --verify --verbose --sign "$identity" "$dmg"

echo "### verifying signature"
codesign -vvv -d "$dmg"