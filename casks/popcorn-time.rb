cask 'popcorn-time' do
  version '0.4.0'
  sha256 'c033562ea9a729f53798834bc721d0d5911bafe8c5a809138213f078c328ccd4'

  url "https://mirror03.popcorntime.sh/repo/build/Popcorn-Time-#{version}.pkg"
  appcast 'https://github.com/popcorn-official/popcorn-desktop/releases.atom'
  name 'Popcorn Time'
  homepage 'https://popcorntime.sh/'

  auto_updates true
  conflicts_with cask: 'popcorn-time-beta'

  app 'Popcorn-Time.app'

  bundle_id = 'com.nw-builder.popcorn-time'
  uninstall quit: bundle_id

  zap trash: [
               "~/Library/Preferences/#{bundle_id}.plist",
               '~/Library/Application Support/Popcorn-Time',
               "~/Library/Application Support/com.apple.sharedfilelist/com.apple.LSSharedFileList.ApplicationRecentDocuments/#{bundle_id}.sfl*",
               '~/Library/Application Support/configstore/popcorn-time.json',
               "~/Library/Saved Application State/#{bundle_id}.savedState",
               '~/Library/Caches/Popcorn-Time',
             ]
end
