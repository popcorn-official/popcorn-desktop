<div class="help-container">
	<div class="fa fa-times close-icon"></div>
	<div class="overlay-content"></div>
	<div class="content">
		<h1><%= i18n.__("Help Section") %></h1>
		<hr>
		<div class="did-you-know">
			<span class="title-dyk"><i class="fa fa-question-circle icon-dyk"></i><%= i18n.__("Did you know ?") %></span>
			<span class="randomized-dyk">You can paste magnet links anywhere in Popcorn Time with CTRL-V</span>

			<!-- did you know list

				- You can paste magnet links anywhere in Popcorn Time with CTRL-V
				- You can drag & drop a .torrent file into Popcorn Time
				- Clicking twice on a "Sort By" filter reverses the order of the list
				- Popcorn Time is Open Source. Find the code on [git.popcorntime.io] !
				- The Popcorn Time project started in February 2014 and already have had 150 people that contributed more than 3000 times to its development in August 2014.
				- The rule n°10 applies here. 
				- If a subtitle for a TV Show is missing, you can add it on [opensubtitles.org]. And the same way for a Movie, but on [yifysubtitles.com]
				- If you're experiencing connection drop issues, try to reduce the <%= i18n.__("DHT Limit") %>
				- Search "1998" to see all movies that came out that year
				- You can login to Trakt.tv to save all your watched items, and get to synchronize them
				- Clicking on the rating stars will display a number instead
				- This application is entirely written in HTML5, CSS3 and Javascript
				- Wanna know more about a Movie or a TV Series? Just click the IMDb icon. 

			-->	
		</div>

		<div class="help-outer">
			<h2 class="top">What does Popcorn Time offer?</h2>
			<p>With Popcorn Time, you can watch Movies and TV Series really easely. All you have to do is click on one of the covers, then click "Watch Now". But your experience is highly customizable:
				<ul>
					<li><b>Movies:</b> Our Movies collection only contains High-Definition movies, available in 720p and 1080p. To watch a movie, simply open Popcorn Time and navigate through the movies collection, reacheable through the "Movies" tab, in the navigation bar. The default view will show you all movies sorted by popularity, but you can apply your own filters, thanks to the "Genre" and "Sort by" filters. Once you have chosen a movie you want to watch, click its cover. Then click "Watch Now". Don't forget the popcorn!</li>
					<li><b>TV Series:</b> The TV Series tab, that you can reach by clicking "TV Series" in the navigation bar, will show you all available series in our collection. You can also apply your own filters, same as the Movies, to help you decide what to watch. In this collection, also just click the cover: the new window that will appear will allow you to navigate through Seasons and Episodes. Once your mind is set, just click the "Watch Now" button.</li>
					<li><b>Choose quality:</b> A slider next to the "Watch Now" button will let you choose the quality of the stream. You can also set a fixed quality in the Settings tab. Warning: a better quality equals more data to download.</li>
					<li><b>Subtitles:</b> Most of our Movies and TV Series have subtitles in your language. You can set them in the Settings tab. For the Movies, you can even set them through the dropdown menu, in the Movie Details page.</li>
					<li><b>Favorites:</b> Clicking the heart icon on a cover will add the movie/show to your favorites. This collection is reacheable through the heart-shaped icon, in the navigation bar. To remove an item from your collection, just click on the icon again! How simple is that?</li>
					<li><b>Watched icon:</b> Popcorn Time will keep in mind what you've already watched - a little help remembering doesn't cause any harm. You can also set an item as watched by clicking the eye-shaped icon on the covers. You can even build and syncronize your collection with Trakt.tv website, every required step will be described below.</li>
					<li><b>Search:</b> In Popcorn Time, you can use the magnifier icon to open the search. Type a Title, an Actor, a Director or even a Year, press "Enter" and let us show you what we can offer to fill your needs. To close your current search, you can click on the 'X' located next to your entry or type something else in the field.</li>
					<li><b>External Players:</b> If you prefer to use a custom player instead of the builtin one, you can do so by clicking the allocated icon on the "Watch Now" button. A list of your installed players will be shown, select one and Popcorn Time will send everything to it. If your player isn't on the list, please report it to us.</li>
					<li><b>Settings:</b> To push the customization even further, we offer you a large panel of options. To access the Settings, click the nut-shaped icon in the navigation bar.</li>
					<li><b>Keyboard Navigation:</b> The entire list of keyboard shortcuts is available by pressing "?" on your keyboard, or through the keyboard-shaped icon in the Settings tab.</li>
					<li><b>Custom Torrents and Magnet Links:</b> You can use custom torrents and magnets links in Popcorn Time. Simple drag and drop .torrent files into the application's window, and/or paste any magnet link.</li>
					<li><b>Torrent health:</b> On the details of Movies/TV Series, you can find a little circle, colored in grey, red, yellow or green. Those colors refer to the health of the torrent. A green torrent will be downloaded quickly, while a red torrent may not be downloaded at all, or very slowly. The color grey represents an error in the health calculation for Movies, and needs to be clicked in TV Series in order to display the health.</li>
				</ul>
			</p>
			
			<h2>How does Popcorn Time work?</h2>
			<p>Popcorn Time streams video content through torrents. Our movies are provided by YTS (http://yts.re) and our TV Series by EZTV (http://eztv.it), while getting all metadatas from Trakt (http://trakt.tv). We don't host any content ourselves.<br>
			Torrent streaming? Well, torrents use Bittorent protocol, which basically means that you download small parts of the content from another user's computer, while sending the parts you already downloaded to another user. You then watch those parts, while the next ones are being downloaded in the background. This exchange allows the content to stay healthy.<br>
			Once the movie is fully downloaded, you continue to send parts to the other users. And everything is deleted from your computer when you close Popcorn Time. As simple as that.<br><br>
			The application itself is built with Node-Webkit, HTML, CSS and Javascript. It works kinda like the Google Chrome Browser, except that you host the biggest part of the code on your computer. Yes, Popcorn Time works on the same technology as a regular website, like... let's say Wikipedia, or Youtube!
			</p>
			
			<h2>I found a bug, how do I report it?</h2>
			<p>Link + how to properly report</p>
		</div>
	</div>
</div>
