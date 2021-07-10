cask "popcorn-time" do
  version "0.4.5-43,g4fc2f4e4"
  sha256 "e266ec6eaae91211f18de96d468c6250912904bf14086e5f8cd23331d6c0db5c"

  server = "popcorn-ru.tk"
  homepage = "http://#{server}"
  zip = "Popcorn-Time-#{version.tr("-,", "+.")}_osx64.zip"

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
