Popcorn time JSON-RPC 2 Api
=========================

The JSON-RPC api built into the popcorn time app is an interface other programs can use to communicate with popcorn time.
It uses basic http authentication and opens an endpoint port, both of which that you can set up in popocorn time's settings view.

Every response is an object containing the version of Popcorn Time in the key 'popcornVersion'.

Here are the currently supported procedures, the arguments they require, and the response they send:


##### ping()
An empty method you can call to test the connection to the API. It needs no arguments.

##### volume(volume*)
You can use this to get or set the volume if currently in the player view. If you want to set the volume then it should be a decimal number equal to or between 0 and 1.

##### toggleplaying()
Toggles whether the video is playing.

##### togglemute()
Toggles whether the video is muted.

##### togglefullscreen()
Toggles full screen mode of the app.

##### togglefavourite()
Toggles favourite status of the currently selected item.

##### toggletab()
Toggles between tabs.

##### togglewatched()
Toggles watched status of the currently selected item.

##### togglequality()
Simulates a keyboard q button click which toggles quality if on movie detail view.

##### showslist()
Opens the shows tab.

##### movieslist()
Opens the movies tab.

##### getviewstack()
Gets the views stack. Responds with the array of currently stacked views.

##### getgenres()
Gets the available genres for the current tab. Responds with the array of genres with the key 'genres' in the main object.

##### getsorters()
Gets the available sorters for the current tab. Responds with the array of sorters with the key 'sorters' in the main object.

##### gettypes()
Gets the available sorters for the current tab. Responds with the array of sorters with the key 'types' in the main object.

##### getplaying()
Gets information about the current playing video. Responds with the main object which contains the current playing state, download speed, upload speed, active peers, volume, title, quality, current time, duration, movie (true/false), imdb id (if movie = true), tvdb id (if movie = false), season (if movie = false) and episode (if movie = false).

##### getcurrenttab()
Gets the current tab.

##### filtergenre(genre*)
Set the filter for the given genre.

##### filtersorter(sorter*)
Set the filter for the given sorter.

##### filtertype(type*)
Set the filter for the given type.

##### filtersearch(term*)
Set the filter search for the given term.

##### clearsearch()
Clear the search field.

##### seek(amount*)
Seek through the video by the given time amount in seconds.

##### up()
Simulates a keyboard up button click

##### down()
Simulates a keyboard down button click

##### left()
Simulates a keyboard left button click

##### right()
Simulates a keyboard right button click

##### enter()
Simulates a keyboard enter button click

##### back()
Simulates a keyboard backspace button click

##### previousseason()
Go to previous season in show details view. Simulates ctrl+up click

##### nextseason()
Go to next season in show details view. Simulates ctrl+up click

##### subtitleoffset(amount*)
Adjusts subtitle offset by the given decimal amount

##### getsubtitles()
Gets the available subtitles for this movie. Responds with a list of subtitles as the first language

##### setsubtitle()
Sets the subtitle for this movie.

##### listennotifications()
This function is meant to be used for retrieving notifications from the app with the long-polling method.
This function returns when something happens with the app.
Because HTTP methods have a timeout, you should keep calling this function at some interval.
This function responds with an object of events that happened in the app as the first argument.

Currently, the following events are supported:

* volumechange: the player volume has been changed
* viewstack: the view stack has been changed