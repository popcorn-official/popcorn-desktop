#!/bin/sh

case ${OSTYPE} in *darwin*)
    # if this fails please run `brew install coreutils` - homebrew also has this package
    alias readlink=greadlink
    ;;
esac
basedir="$(dirname $(readlink -f ${0}))/../.."
windir="${basedir}/build/releases/Popcorn-Time/win"
outdir="${basedir}/build/updater/win"

rm -rf "${outdir}"

mkdir -p "${outdir}"

echo "Copying Sourcefiles"
cp -r "${basedir}/src" "${outdir}"

echo "Copying modules"
cp -r "${basedir}/node_modules" "${outdir}"
rm -rf "${basedir}/node_modules/grunt"

if [ "${POP_NEW_NW}" = "TRUE" ]; then
   echo "Copying compiled files"
   mkdir -p "${outdir}/node-webkit/"
   cp -r "${windir}/Popcorn-Time/*" "${outdir}/node-webkit/"
fi

cp "${basedir}/package.json" "${outdir}"
cp "${basedir}/.git.json" "${outdir}"

cd ${outdir}
vers=$(sed -n "s|\s*\"version\"\:\ \"\(.*\)\"\,|\1|p" "${basedir}/package.json")

echo "Zipping Files"
tar --exclude-vcs -caf "../Popcorn-Time-${vers}-Update-Win.tar.xz" .
