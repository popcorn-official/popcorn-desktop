Popcorn time JSON-RPC 2 Api
=========================

The JSON-RPC api built into the popcorn time app is an interface other programs can use to communicate with popcorn time.
It uses basic http authentication and opens an endpoint port, both of which that you can set up in popocorn time's settings view.

Here are the currently supported procedures, the arguments they require, and the response they send:


##### ping()
An empty method you can call to test the connection to the API. It needs no arguments and responds without any arguments.

##### setvolume(volume*)
You can use this to set the volume if currently in the player view. Volume should be a decimal number between 0 and 1. Responds without arguments.

##### toggleplaying()
Toggles whether the video is playing.

##### togglemute()
Toggles whether the video is muted.

##### togglefullscreen()
Toggles full screen mode of the app.

##### togglefavourite()
Toggles favourite status of the currently selected item.

##### togglemoviesshows()
Toggles between movies and shows tabs.

##### togglewatched()
Toggles watched status of the currently selected item.

##### showslist()
Opens the shows tab.

##### movieslist()
Opens the movies tab.

##### getviewstack()
Gets the views stack. Responds with the array of currently stacked views.

##### getgenres()
Gets the available genres. Responds with the array of genres as a first argument.

##### getgenres_tv()
Gets the available shows genres. Responds with the array of genres as a first argument.

##### getsorters()
Gets the available sorters. Responds with the array of sorters as a first argument.

##### getsorters_tv()
Gets the available shows sorters. Responds with the array of sorters as a first argument.

##### filtergenre(genre*)
Set the filter for the given genre.

##### filtersorter(sorter*)
Set the filter for the given sorter.

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

##### quality()
Simulates a keyboard q button click which toggles quality if on movie detail view.

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