## 0.3.4-dev - NOT RELEASED
- HiDPI support, scales properly on 1080p, 2k/Retina and 4k/QHD screens
- Update vectorial 'about' view
- New theme from @ghostbear
- [ALPHA] Anime Tab, thanks to the haruhichan people !

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
