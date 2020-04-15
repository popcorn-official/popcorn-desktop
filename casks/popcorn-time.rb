cask 'popcorn-time' do
  version '0.4.4'
  sha256 '02bcf7fe9f5a9bc38bd01c7d9107fb138bf49857c182691cd9439fa7a4e9859b'

  url "https://get.popcorntime.app/build/Popcorn-Time-#{version}.pkg"
  appcast 'https://github.com/popcorn-official/popcorn-desktop/releases.atom'
  name 'Popcorn Time'
  homepage 'https://popcorntime.app/'

  auto_updates true
  conflicts_with cask: 'popcorn-time-beta'

  pkg "Popcorn-Time-#{version}.pkg"

  bundle_id = 'com.nw-builder.popcorn-time'
  uninstall quit:   bundle_id,
            delete: "#{appdir}/Popcorn-Time.app"

  zap trash: [
               "~/Library/Preferences/#{bundle_id}.plist",
               '~/Library/Application Support/Popcorn-Time',
               "~/Library/Application Support/com.apple.sharedfilelist/com.apple.LSSharedFileList.ApplicationRecentDocuments/#{bundle_id}.sfl*",
               '~/Library/Application Support/configstore/popcorn-time.json',
               "~/Library/Saved Application State/#{bundle_id}.savedState",
               '~/Library/Caches/Popcorn-Time',
             ]
end
