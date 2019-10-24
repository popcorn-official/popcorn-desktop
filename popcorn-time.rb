cask 'popcorn-time' do
  version '0.3.10'
  sha256 '62002814ddac7587e447d0f8e7db5d7359ccca77893b79223f7b1f5c7d8992bf'

  url "https://mirror03.popcorntime.sh/repo/build/Popcorn-Time-#{version}-Mac.zip"
  name 'Popcorn Time'
  homepage 'https://popcorntime.sh/'

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
