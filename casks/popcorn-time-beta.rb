cask "popcorn-time-beta" do
  version "0.4.3,410"
  sha256 "842d3eab8b4eca619f922ac3b7a9a699fe94fa33df38a86b312582e787b3c8ae"

  ci = "https://ci.popcorntime.app/job/Popcorn-Time-Desktop"
  url "#{ci}/lastStableBuild/artifact/build/Popcorn-Time-#{version.before_comma}_osx64.zip"
  appcast ci, configuration: "Last stable build (##{version.after_comma})"
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
