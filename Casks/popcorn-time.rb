cask 'popcorn-time' do
  version '0.3.10'
  sha256 '7d2cd37837963df8bb3c3c8601e44142a8314ac71e943f544f9a638da1c1330f'

  url "https://popcorntime.sh/download/build/Popcorn-Time-#{version}-Mac.zip"
  name 'Popcorn Time'
  homepage 'https://popcorntime.sh/'

  app 'Popcorn-Time.app'

  bundle_id = 'com.nw-builder.popcorn-time'
  uninstall quit: bundle_id

  zap trash: [
               "~/Library/Preferences/#{bundle_id}.plist",
               '~/Library/Application Support/Popcorn-Time',
               "~/Library/Application Support/com.apple.sharedfilelist/com.apple.LSSharedFileList.ApplicationRecentDocuments/#{bundle_id}.sfl*",
               "~/Library/Saved Application State/#{bundle_id}.savedState",
               '~/Library/Caches/Popcorn-Time',
             ]
end
