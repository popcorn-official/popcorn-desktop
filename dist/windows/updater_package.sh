#!/bin/sh

basedir="$(dirname $(readlink -f ${0}))/../.."
windir="${basedir}/build/releases/Popcorn-Time/win"
outdir="${basedir}/build/updater/win"

mkdir -p "${outdir}"

echo "Copying Sourcefiles"
cp -r "${basedir}/src" "${outdir}"

echo "Copying modules"
cp -r "${basedir}/node_modules" "${outdir}"

if [ ${POP_NEW_NW} = "TRUE" ]; then
   echo "Copying compiled files"
   mkdir -p "${outdir}/node-webkit/"
   cp -r "${windir}/Popcorn-Time/*" "${outdir}/node-webkit/"
fi

cp "${basedir}/package.json" "${outdir}"
cp "${basedir}/.git.json" "${outdir}"

echo "${basedir} \n ${windir} \n ${outdir}"

cd ${outdir}
vers=$(sed -n "s|\s*\"version\"\:\ \"\(.*\)\"\,|\1|p" "${basedir}/package.json")

echo "Zipping Files"
zip -r "../Popcorn-Time-${vers}-Update-Win.zip" *
