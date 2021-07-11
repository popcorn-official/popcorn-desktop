cask "popcorn-time" do
  version "0.4.5"
  sha256 "cacf8ed13b427bceb481ba88ff97ff297f7e9e0487f1411f8d20ff87dd674ddb"

  server = "popcorn-ru.tk"
  homepage = "http://#{server}"
  zip = "Popcorn-Time-#{version.tr("-,", "+.")}-Mac.zip"

  url "#{homepage}/build/#{zip}"
  name token.titlecase
  desc "BitTorrent client that includes an integrated media player"
  homepage homepage

  zip.sub! version, "([0-9]+(?:\\.[0-9]+)+)"

  livecheck do
    url "#{homepage}/build"
    strategy :page_match
    regex Regexp.new zip
  end

  auto_updates true

  app "Popcorn-Time.app"

  app_support = "#{Dir.home}/Library/Application Support"

  postflight do
    require "securerandom"

    db = "#{app_support}/Popcorn-Time/Default/data/settings.db"

    %w[Movies Series].each do |medium|
      setting = {
        key:   "custom#{medium}Server",
        value: "https://#{server}/",
        _id:   SecureRandom.alphanumeric,
      }
      settings = File.read(db).lines

      next if settings.grep(/#{setting[:key]}/).any?

      `echo '#{setting.to_json}' >> '#{db}'`
    end
  end

  uninstall quit: bundle_id = "com.nw-builder.popcorn-time"

  zap trash: [
    "#{app_support}/Popcorn-Time",
    "~/Library/Preferences/#{bundle_id}.plist",
    "#{app_support}/com.apple.sharedfilelist/com.apple.LSSharedFileList.ApplicationRecentDocuments/#{bundle_id}.sfl*",
    "#{app_support}/configstore/popcorn-time.json",
    "~/Library/Saved Application State/#{bundle_id}.savedState",
    "~/Library/Caches/Popcorn-Time",
  ]
end
