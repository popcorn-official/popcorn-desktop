cask "popcorn-time-beta" do
  version :latest
  sha256 :no_check

  ci = "https://ci.popcorntime.app/job/Popcorn-Time-Desktop"
  url "#{ci}/lastSuccessfulBuild/artifact/build/Popcorn-Time-0.4.4_osx64.zip"
  appcast ci, configuration: "Latest successful build"
  name "Popcorn Time"
  desc "Watch movies and TV shows instantly"
  homepage "https://popcorntime.app/"

  auto_updates true
  conflicts_with cask: "popcorn-time"

  app "Popcorn-Time.app"

  bundle_id = "com.nw-builder.popcorn-time"
  uninstall quit: bundle_id

  zap trash: [
    "~/Library/Preferences/#{bundle_id}.plist",
    "~/Library/Application Support/Popcorn-Time",
    "~/Library/Application Support/com.apple.sharedfilelist/com.apple.LSSharedFileList.ApplicationRecentDocuments/#{bundle_id}.sfl*",
    "~/Library/Application Support/configstore/popcorn-time.json",
    "~/Library/Saved Application State/#{bundle_id}.savedState",
    "~/Library/Caches/Popcorn-Time",
  ]
end
