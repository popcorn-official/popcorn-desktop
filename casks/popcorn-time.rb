cask "popcorn-time" do
  version "0.4.7"

  nwjs = "0.64.0"
  arch = "x64"

  name token.gsub(/\b\w/, &:capitalize)
  desc "BitTorrent client that includes an integrated media player"
  homepage "https://#{token}.ga/"

  repo = "popcorn-official/popcorn-desktop"
  zip = "#{name.first}-#{version}-Mac.zip"

  livecheck { url "https://github.com/#{repo}" }

  if (%w[-v --verbose -d --debug] & ARGV).any?
    v = "-v"
    quiet = silent = "verbose"
  else
    quiet = "quiet"
    silent = "silent"
  end

  if MacOS.version < :monterey || ENV["HOMEBREW_POPCORN_TIME_BUILD"] == "false"
    sha256 "91cabf4b161e5b729fe0ace68b5c17cccec2a816fb22f7d0127c70ff1bccb62c"

    url "#{homepage}/build/#{zip}"
  else
    sha256 "95dc272fbb3977f5c10449ab80d0568c43df80a47a16cf9a9fa4d959a56aab17"

    github = "github.com/iteufel/nwjs-ffmpeg-prebuilt"
    url "https://#{github}/releases/download/#{nwjs}/#{nwjs}-osx-#{arch}.zip", verified: github

    preflight do
      Tap.fetch(repo).path.cd do
        ENV["PATH"] += ":#{HOMEBREW_PREFIX}/bin"

        installed = Formula.installed.map(&:name)
        yarnrc = Pathname "#{Dir.home}/.yarnrc"
        keep = yarnrc.exist?

        app_build = "build/#{@cask.name.first}/os#{arch}/#{@cask.name.first}.app"

        gulpfile = Pathname "gulpfile.js"
        content = gulpfile.read
                          .sub!(/(nwVersion\s*=\s*['"])[0-9]+\.[0-9]+\.[0-9]+/, "\\1#{nwjs}")
                          .remove!(/(manifest|download)Url:.+/)
        gulpfile.write content

        system <<-EOS
          #{HOMEBREW_BREW_FILE} install node --#{quiet}

          npx --yes yarn install --ignore-engines --#{silent}
          npx yarn build --#{silent}

          rsync --recursive --relative node_modules #{app_build}/Contents/Resources/app.nw --#{quiet}

          /bin/mv #{v} #{staged_path}/libffmpeg.dylib \
          #{app_build}/Contents/Frameworks/nwjs*.framework/Versions/Current
          /bin/mv #{v} #{app_build} #{staged_path}

          git reset --hard --#{quiet}
          git clean -xd --force --#{quiet}
        EOS
        system(*%W[brew uninstall node --ignore-dependencies --#{quiet}]) unless installed.include? "node"
        FileUtils.rm_f yarnrc unless keep
      end
    end
  end

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
