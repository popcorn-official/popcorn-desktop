## 0.5.0 - Mischief Managed - 10 February 2024

New Features:
- Update NW.js runtime to 0.82.0 (0.44.5 still supported as an option for this release)
- Add macOS build for Apple Silicon (NW.js 0.82.0 only)
- Add working Anime tab
- Add Watched tab
- Add Seedbox option for exiting the app when downloads complete
- Add VLC flatpack external player support
- Add Movies/Series UI Transparency option
- Add new theme Dutchy's Dark Orange
- Switch to the new OpenSubtitles REST API
- Update WebTorrent to 1.9.7

Bug Fixes:
- Fix WebTorrent bug which caused high CPU/memory usage
- Fix issue with broken bookmark entries preventing list from loading
- Fix issue with title translations
- Fix bug which caused switching to the default Chromium player when broken trailer link
- Fix bug which prevented saving magnet links with no name property
- Fix missing provider icons when no source link
- Fix Series poster zoom implementation
- Fix brightness and hue filters implementations
- Fix title display for mpv external player

Other:
- Update the build system
- Clean up obsolete/unnecessary code
- Update Torrent Collection providers
- Update torrent trackers
- Update various modules/dependencies
- Various other small fixes and optimizations

## 0.4.9 - Ogres are not like cakes - 04 September 2022

New Features:
- Add right-click to copy support to the majority of UI elements
- Add update notification option
- Add disable Favorites tab option
- Add ability to filter Torrent Collection results by right-clicking providers
- Make the Torrent Collection directory a part of the database also adding the ability to import/export it

Bug Fixes:
- Fix cover resize
- Fix some overlapping UI elements
- Fix Show all available subtitles for the default language option
- Fix issue with peers not being resolved when resuming stream/download
- Fix stream/download resuming when modifying file selection bug
- Fix undefined download/upload speed issue

Other:
- Clean up obsolete/unnecessary code
- Many more Settings, Torrent Collection, Seedbox and File selector UI changes/updates
- Update Torrent Collection providers
- Update various icons
- Update various modules/dependencies
- Various other small fixes and optimizations

## 0.4.8 - Who Crossed the Streams ? - 15 July 2022

New Features:
- Add multiple torrent support
- Add provider icons throughout the app
- Add option for Audio Passthrough
- Add external player support for NixOS

Bug Fixes:
- Fix Homebrew Cask installation
- Fix an XSS to RCE vulnerability (CVE-2022-25229)
- Fix fallback when source and TMDb with language other than English fail to fetch synopsis
- Fix scroll wheel volume adjust
- Fix .torrent file support

Other:
- Automatic subtitles / OpenSubtitles support redesign due to login now being required for use of their API
- Watchlist / Trakt implementation redesign
- Many more Settings, Torrent Collection, Seedbox and File selector UI changes/updates
- Update Torrent Collection providers
- Update torrent trackers
- Update various modules/dependencies
- Various other small fixes and optimizations

## 0.4.7 - Just Keep Swimming - 02 March 2022

New Features:
- Add API Server urls update/auto-update options
- Add API Server url(s) tooltip on tabs
- Add play/download functions to the Seedbox and various other right pane fixes, additions and optimizations
- Add player controls for zoom, contrast, brightness, hue and saturation
- Adjustable next episode preload time including disable preloading while keeping Play next episode automatically enabled
- Add concurrent DHT UDP requests limit option
- Add always expanded search field option
- Add an undo prompt when removing a bookmark
- Add links for contributing media information to TMDB
- Add more languages

Bug Fixes:
- Fix the Rebuild bookmarks database function
- Fix bookmarks sorting/filtering bug when more than 50 entries
- Fix DLNA media controls bug when subtitles are enabled
- Fix DLNA issue with Samsung devices
- Fix disabling automatic updates
- Fix some layout issues when native frame option enabled
- Watchlist fixes

Other:
- Update torrent trackers
- Update various modules/dependencies
- Various other small fixes and optimizations

## 0.4.6 - The Good Variant - 11 October 2021

New Features:
- Add Localization support
- Add multiple audio language support
- Add maximum Download/Upload speed options
- Add ability to minimize the native media player
- Add Source, Release Info and Parental Guide links for content where data exists
- Add a Magnet Link button in the loading screen
- Add a Rebuild bookmarks database function/button in the settings
- Add support for fetching the Genres list from the API
- Update WebTorrent to 1.5.5 also adding PE/MSE support

Bug Fixes:
- Fix issue with peers not being resolved when restarting canceled stream/download
- Fix wrong file selection on some instances where torrents contain multiple video files
- Fix issue where the subtitles and cover image weren't being downloaded when using the Download function
- Fix file/directory selection on Windows
- Remove non-working TVShow Time support since their API service has been terminated

Other:
- Optimize app closing time
- Settings page UI changes/updates
- Better unreachable API error message displaying all APIs tried
- Update torrent trackers
- Update various modules/dependencies
- Various other small fixes and optimizations

## 0.4.5 - The Next Wave - 21 June 2021

New Features:
- Update NWJS to 0.44.5 (https://github.com/nwjs/nw.js/blob/nw44/CHANGELOG.md)
- Add custom servers
- Add seedbox

BigFixes:
- Many bugs ...

## 0.4.4 Beta - Love in the Time of Corona - 14 April 2020

This part of the log lost in the depths of development

## 0.3.10 Beta - Popcorn Is Love - 31 October 2016

BigFixes:
- Fix Anime Tab
- Fix Chromecast displaying scrollbar
- Fix Movies and Series thumbnails not working (Linux)
- Update External Device packages
- Dependencies Update

New Features:
- Update NWJS to 0.18.1 (https://github.com/nwjs/nw.js/blob/nw18/CHANGELOG.md)
- Switch to Popcorn Time API  (https://github.com/popcorn-official/popcorn-api)
- Subtitles dropdown for movies has been removed (subtitles are fetched based on default subtitle language in settings)
- Subtitles are now fetched from OpenSubtitles

Known Bugs:
 - Watchlist items are not selectable
 - Select a random Movie


## 0.3.9 Beta - There's nothing on TV - 18 February 2016
- Switch to Butter Source Code
- Switch to New YTS API



## 0.3.8 Beta - There's nothing on TV - 09 July 2015

BugFixes:

- Fullscreen consistent while playing
- Multi-screen support
- Windows 8.1 : the app doesn't go under the taskbar anymore
- " & " in titles are now correctly handled
- Local subtitles should now always load correctly
- UI fixes
- More descriptive error messages and logs
- Fix "Open the app in last-open tab"
- Mac OS: fix mousewheel inverted
- Mac OS: Menu support
- Fix some issues with Keyboard navigation
- Allow to hide the updater notification
- Fix an issue corrupting cache if used on an external HDD
- Improvements in subtitle encoding
- Autoplay fixes
- Trakt.tv is back!
- Torrenting enhanced (finding more peers and better seeding)
- Remote control (httpapi) fixes
- Open TV Details "jump to" fixed
- More subtitles results for TV Series
- Download progress in the player now works for single file taken out of multifile torrents
- Images positionning in Movies & TV Series details
- Anime: fixes an issue where series got no episodes & movies no links
- Subtitles: most external torrents should be matched with subtitles now
- Arabic fonts (aljazeera & khalid art) can now be used to correctly display arabic subtitles
- Fix most issues with remotes.
- Fix the Popcorn Time player when watching trailers.

New Features:

- Node Webkit 12.1 (now known as nw.js)
- Cancel "Play Next Episode"
- Select your subtitles Font, and/or add a solid background to them.
- New subtitles for: Norwegian, Vietnamese
- Report bugs & issues from within the app (open the 'About' page)
- Mark as seen/unseen in Movie Details screen
- No more ads from Youtube
- Stream subtitles with DLNA/UPnP
- Search Strike or KickassTorrents (torrent portals) and save some torrents for later
- Allow SSA/ASS subtitles, along with TXT (mostly Chinese & Polish - needs testing)
- The app will now remember: last chosen quality, player, subtitles position, volume
- Mark an entire TV Series as watched
- Choose the application install directory (provided that it doesn't need admin rights)
- Play local video files in PT Player (mp4, avi, mov, mkv)
- Windows: launcher allowing to use PT as default for torrents/magnets/video files
- Support for multimedia keys
- Launch external players in Fullscreen
- Minimize to tray
- Translated synopsis (overview) for TV Series & Movies
- Calculation of the P2P exchange ratio of the entire app traffic
- FakeSkan (bitsnoop) will now warn you if an external torrent was flagged as "fake"
- "Randomize" button allowing to open a random movie
- Start Popcorn Time minimized with "-m" flag
- 1080p TV Shows are here !
- "Big Picture Mode" will allow you to read Popcorn Time's texts from your couch
- TVShow Time integration
- Display a warning if the HDD is almost full
- Sort by "Trending" on movies & tv shows
- Correctly display the sizes for your OS and language (ex: 32.5MiB in Linux English, 32.5Mo on Windows Spanish, 34.1MB in OSX English)

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
