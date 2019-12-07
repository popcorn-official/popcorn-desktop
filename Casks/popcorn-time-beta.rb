cask 'popcorn-time-beta' do
  version '0.3.10,374'
  sha256 '1afaf5e39e2c0a0602e853a50c0139b9f6ecd8682f0a7f59d0c78976c9ce0b19'

  ci = 'https://ci.popcorntime.sh/view/All/job/Popcorn-Time-Desktop'
  url "#{ci}/lastStableBuild/artifact/build/Popcorn-Time-#{version.before_comma}_osx64.tar.xz"
  appcast ci, configuration: "Last stable build (##{version.after_comma})"
  name 'Popcorn Time'
  homepage 'https://popcorntime.sh/'

  conflicts_with cask: 'popcorn-time'

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