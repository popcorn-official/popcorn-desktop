cask "popcorn-time" do
  version "0.4.9"

  nwjs = "0.64.0"
  arch = "x64"

  name token.gsub(/\b\w/, &:capitalize)
  desc "BitTorrent client that includes an integrated media player"
  homepage "https://shows.cf/"

  repo = "popcorn-official/popcorn-desktop"
  zip = "#{name.first}-#{version}-osx64.zip"

  livecheck { url "https://github.com/#{repo}" }

  if (%w[-v --verbose -d --debug] & ARGV).any?
    v = "-v"
    quiet = silent = "verbose"
  else
    quiet = "quiet"
    silent = "silent"
  end

  sha256 "773235cce1ff637e3d1dcf5df02413da2eca2198c1d310cc7a4e78afcc4a38ea"

  url "#{homepage}/build/#{zip}"

  auto_updates true
  depends_on arch: :x86_64

  app "#{name.first}.app"

  app_support = "#{Dir.home}/Library/Application Support"

  uninstall quit: bundle_id = "com.nw-builder.#{token}"

  zap trash: %W[
    #{app_support}/#{name.first}
    ~/Library/Preferences/#{bundle_id}.plist
    #{app_support}/com.apple.sharedfilelist/com.apple.LSSharedFileList.ApplicationRecentDocuments/#{bundle_id}.sfl*
    #{app_support}/configstore/#{token}.json
    ~/Library/Saved Application State/#{bundle_id}.savedState
    ~/Library/Caches/#{name.first}
  ]
end
