dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
app="$dir/../../build/releases/Popcorn-Time/mac/Popcorn-Time.app"
identity="867BC7B779C240682C088BBDD206C6D02590F87E"

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