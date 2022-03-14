cask "popcorn-time" do
  version "0.4.7"
  sha256 "91cabf4b161e5b729fe0ace68b5c17cccec2a816fb22f7d0127c70ff1bccb62c"

  server = "popcorn-time.ga"
  homepage = "http://#{server}"
  zip = "Popcorn-Time-#{version}-osx64.zip"

  url "#{homepage}/build/#{zip}"
  name token.titlecase
  desc "BitTorrent client that includes an integrated media player"
  homepage homepage

  livecheck do
    url "#{homepage}/build"
    strategy :page_match
    regex Regexp.new zip.sub version, "([0-9]+(?:\\.[0-9]+)+)"
  end

  auto_updates true

  app "Popcorn-Time.app"

  app_support = "#{Dir.home}/Library/Application Support"

  postflight do
    require "securerandom"

    db = "#{app_support}/Popcorn-Time/Default/data/settings.db"

    if File.exists?(db)
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
