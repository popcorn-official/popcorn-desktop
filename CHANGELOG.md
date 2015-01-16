## 0.3.7 Beta - The Car Won't Start - 15 January 2015

BugFixes:

- Fall back to Sequential ID when AirPlay devices do not respond to ServerInfo queries
- Rebuild the new built-in VPN Client
- Renamed "External" to "ExtPlayer" to avoid confusion with non-local devices
- Fix the movie cover resizing code and garbage collect the cache to ensure old metadata isn't used
- Greatly improves the built-in DLNA detection
- Fix retina display for Ultra HD screens
- Properly hide the spinner in cases where an error occurs 
- Always show the FileSelector if TorrentCol is active. Fixes PT-1575
- Fix subtitle error handling in the streamer
- Prevent the app from getting stuck on "Waiting for Subtitles" if subtitle discovery fails
- Fix the HTTP API / Remote API
- Improved IP-Detection for all external devices. Fixes PT-1440
- Fix the issue where the Ukrainian flag was displayed instead of the Armenian flag
- Fixed TV Show covers not showing up due to Trakt shutting down Slurm Image Server

New Features:

- Calculate the remaining time before stream download completion
- Added a "Magnet" icon in the details pane to allow copying of the magnet link
- Added the ability to save the .torrent files and magnet links in-app for later

## 0.3.6 Beta - The Christmas Tree Is Up - 25 December 2014

Bugfixes:

- Changed encoding of VTT Subtitles file to UTF-8. Fixes playback of all subtitle languages on external devices.
- Fixed the bug where streams played on the wrong device when you have multiple AirPlay devices
- Temporarily Fixed IP address in Media URL for external devices
- Reworked the updater to use our DNS servers so it continues to work even with issues
- Automatically close the player on Chromecast when media playback has finished
- Fixed the Chromecast reconnection issue when stopping and starting a new session
- Made further fixes to the "Waiting for Subtitles" bug
- Reworked and fixed multiple issues with Chromecast Status-Updater
- Updated the Chromecast module to use a refactored Chromecast-js
- Added in a BitTorrent PeerID specific to Popcorn Time
- Fixed problems with Watchtrailer, should fix issue PT-1333
- Various other minor bugfixes

New Features:

- Torrent Health now automatically updates
- Added an option to disable updates
- Added a built in OpenVPN client
- Small event's celebration
- Added a 'download progress' status

## 0.3.5 Beta - We're Snowden In - 09 november 2014

- Automatically sync Trakt on start
- New search bar
- Custom color for subtitles
- New window's width/height calculation
- New official theme: 'FlaX'
- PNG's optimization
- You can now choose your player with external torrents/magnets

- Fixed invalid Certificate Fingerprints in the app not verifying causing requests to fail
- Caught when the "Theme" var in Database didn't exist upon upgrading
- Fixed movies not loading because Trakt started replying with 404s
- Fixing bookmarks that don't work on the list page for TV Shows and Anime
- Remove "Blown up" look for Retina but leave it in place for QFHD due to it's size
- Fixed the updater for Popcorn Time in linux

## 0.3.4 Beta - It's Cold Outside - 06 october 2014

After the introduction of the Remote Control API on 0.3.3,
these remotes have been created by our awesome users go grab the one you
like best at http://discuss.popcorntime.io/t/list-of-popcorn-time-remote-controls/2044

- Now comes with release names
- More resiliant to APIs falling down
- HiDPI support, scales properly on 1080p, 2k/Retina and 4k/QHD screens.
- Update vectorial 'about' view.
- New watchlist view, automatically synced to trakt.
- Better caching of network calls, makes the app more snappy.
- [TV] Auto-Play next episode.
- New themes infrastructure allows for easier integration with community
  themes.
- New translation infrastructure allows for easier integration with community
  translations.
- A lot of bugfixes and under-the-hood changes.
- All dependencies have been updated.
- [ALPHA] Anime Tab, thanks to the haruhichan people !
- [ALPHA] ChromeCast now supports subtitles and cover images.

## 0.3.3 Beta - 12 sept 2014
- Move to self-hosted repo, you can now find us at http://git.popcorntime.io
- Use FontAwesome instead of PNG's: nicer sharper icons accross the ui
- Get rid of white flash at startup.
- Rethink Settings: much cleaner layout, separated in advanced.
- Themes: we give you 3 new themes to check out, and soon you'll be able to
  submit your own.
- HTTP Api: to control Popcorn Time from another application
- New settings: 
	- Always on Top option
	- Start page option
	- Rating on covers
	- Fade or Hide watched items

- Multiple UI improvements
    - Resize covers on-the-fly
    - [TV] Open directly next unseen episode
    - Builtin help section

- External Players Framework:
    - VLC,
    - XBMC,
    - MPlayer,
    - mpv,
    - and many more !
- Linux installer

- [ALPHA] Trakt.tv synchronisation: trakt will now remember your favs for
- [ALPHA] External Devices Framework:
    - Chromecast
    - Airplay

release notes:
- This release ships with a huge internal code clean up that forced us to
  break former Databases compatibilities, so you most probably will have to reset
  your DataBase on install. sorry, we'll be better next time.
- We will not support auto-update for this release, sorry, we'll be better
  next time.

## 0.3.2 Beta - 12 june 2014

- Code cleanup
- Use official videojs
- IMDb links
- Support HDrip for old movies
- Trakt.tv integration to scrobble watched
- DMG app for MacOS
- Keyboard navigation
- Seen/Unseen icon
- HD TV series
- File selector for custom torrents

## 0.3.1 Beta - 21 may 2014

- Add methods to mark movie as watched
- Added quality filter for movies
- Added Advanced Settings with Connection, DHT, Tmp Folder options
- Added a help view for keyboard shortcuts. Press `?`
- Draggable subtitles. Move subtitles around the player.
- Drag and drop subtitles on the player to load a custom SRT file
- Rebuild TV Show API Endpoint with live data.
- Subtitles encode fixes.
- Copy stream URL to clipboard directly. Press `U`
- Catch exception to prevent blocking on initDb
- Return to Movie list after close movie
- TV Show search keywords can be in any order
- Faster app opening
- Better subtitles results (search by filename)
- Auto updater

## 0.3.0 Beta - 13 may 2014
- New NSIS Windows installer
- Rating stars
- Trailers
- Peers/Seeds view
- Brand new UI
- TV Series
- Bookmarks
- New languages
- Keyboard shortcuts
- More codec support
- More settings
- "About" tab

## 0.2.9 Beta - 15 april 2014
- Updater in-app
- New website
- Bump to working tree src/app
- Use Marionnette
- Speed up API requests
- Use OpenSans
- Loading screen

## 0.2.8 Beta - 16 march 2014
- New languages and subtitles
- Linux 32bits support
- Yts API


## 0.2.6 Beta, 0.2.7 Beta - 14 march 2014

- March 14 : original developers leave :(
- Confusing times & multiple repo change
- Trakt API
- Licence choice: GPL v3

## 0.2.5 Beta - 08 march 2014

- New languages 
- Localized Windows Installer
- Update Node-Webkit 0.9.2
- Infinite scroll
- Wipe temp folder on close
- Multiplatform grunt build
- Personnalize title-bar based on the platform
- Settings page

## 0.2.0 Beta - 03 march 2014

- New sidebar UI
- New languages
- Disclaimer
- Movie API

## 0.1.0 Alpha - 20 february 2014
- First release Windows/Linux amd64/MacOS
- Windows Installer
- Connect peerflix using .torrent files
- Use localStorage Web SQL
- Implement optional quality functionality (SD vs. HD)
- VideoJS full integration
- Rotten-Tomato
- Yify Subtitles
- Manual input torrent / subtitles files
- Multi-language App support