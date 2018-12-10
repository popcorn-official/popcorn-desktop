pipeline {
  agent {
    node {
      label 'NODEJS'
    }

  }
  stages {
    stage('Building') {
      steps {
        sh '''#!/bin/bash
# Cleanup
rm -rf node_modules
rm -rf build
rm -rf Release
mkdir -p Release


# Update Lang
cd ${WORKSPACE}/src/app/language/ && tx pull -a -f
cd ${WORKSPACE}

npm install --force
node --max-old-space-size=8196 ./node_modules/.bin/gulp clean
node --max-old-space-size=8196 ./node_modules/.bin/gulp dist --platforms=win32
makensis -DARCH=win32 -DOUTDIR=${WORKSPACE}/build ${WORKSPACE}/dist/windows/installer_makensis.nsi
node --max-old-space-size=8196 ./node_modules/.bin/gulp dist --platforms=win64
makensis -DARCH=win64 -DOUTDIR=${WORKSPACE}/build ${WORKSPACE}/dist/windows/installer_makensis.nsi
node --max-old-space-size=8196 ./node_modules/.bin/gulp dist --platforms=linux32
node --max-old-space-size=8196 ./node_modules/.bin/gulp dist --platforms=linux64
node --max-old-space-size=8196 ./node_modules/.bin/gulp dist --platforms=osx64
# Release Archives
if [ "$RELEASE_TYPE" = "release" ]; then
scp ${WORKSPACE}/build/Popcorn-Time-0.3.10_linux64.tar.xz jenkins@get.popcorntime.sh:/srv/repo/build/Popcorn-Time-0.3.10-Linux-64.tar.xz
scp ${WORKSPACE}/build/Popcorn-Time-0.3.10_linux32.tar.xz jenkins@get.popcorntime.sh:/srv/repo/build/Popcorn-Time-0.3.10-Linux-32.tar.xz
scp ${WORKSPACE}/build/Popcorn-Time-0.3.10_osx64.tar.xz jenkins@get.popcorntime.sh:/srv/repo/build/Popcorn-Time-0.3.10-Mac.tar.xz
scp ${WORKSPACE}/build/Popcorn-Time-0.3.10-win32-Setup.exe jenkins@get.popcorntime.sh:/srv/repo/build/Popcorn-Time-0.3.10-Setup.exe
scp ${WORKSPACE}/build/Popcorn-Time-0.3.10-win64-Setup.exe jenkins@get.popcorntime.sh:/srv/repo/build/Popcorn-Time-0.3.10-Setup.exe

fi
'''
      }
    }
    stage('Archiving') {
      steps {
        archiveArtifacts(artifacts: 'build/*.deb, build/*.tar.xz, build/*.exe, build/*.zip', fingerprint: true, onlyIfSuccessful: true)
      }
    }
  }
}
