<div class="help-container">
    <div class="fa fa-times close-icon"></div>
    <div class="overlay-content"></div>
    <div class="content">
        <h1><%= i18n.__("Help Section") %></h1>
        <hr>
        <div class="did-you-know">
            <span class="title-dyk"><i class="fa fa-question-circle icon-dyk"></i><%= i18n.__("Did you know?") %></span>
            <span class="randomized-dyk"></span>
        </div>

        <div class="help-outer">
            <h2 class="top"><%= i18n.__("What does Popcorn Time offer?") %></h2>
            <p><%= i18n.__("With Popcorn Time, you can watch Movies and TV Series really easily. All you have to do is click on one of the covers, then click 'Watch Now'. But your experience is highly customizable:") %>
                <ul>
                    <li><b><%= i18n.__("Movies") %>:</b> <%= i18n.__("Our Movies collection only contains High-Definition movies, available in 720p and 1080p. To watch a movie, simply open Popcorn Time and navigate through the movies collection, reachable through the 'Movies' tab, in the navigation bar. The default view will show you all movies sorted by popularity, but you can apply your own filters, thanks to the 'Genre' and 'Sort by' filters. Once you have chosen a movie you want to watch, click its cover. Then click 'Watch Now'. Don't forget the popcorn!") %></li>
                    <li><b><%= i18n.__("TV Series") %>:</b> <%= i18n.__("The TV Series tab, that you can reach by clicking 'TV Series' in the navigation bar, will show you all available series in our collection. You can also apply your own filters, same as the Movies, to help you decide what to watch. In this collection, also just click the cover: the new window that will appear will allow you to navigate through Seasons and Episodes. Once your mind is set, just click the 'Watch Now' button.") %></li>
                    <li><b><%= i18n.__("Choose quality") %>:</b> <%= i18n.__("A slider next to the 'Watch Now' button will let you choose the quality of the stream. You can also set a fixed quality in the Settings tab. Warning: a better quality equals more data to download.") %></li>
                    <li><b><%= i18n.__("Subtitles") %>:</b> <%= i18n.__("Most of our Movies and TV Series have subtitles in your language. You can set them in the Settings tab. For the Movies, you can even set them through the dropdown menu, in the Movie Details page.") %></li>
                    <li><b><%= i18n.__("Favorites") %>:</b> <%= i18n.__("Clicking the heart icon on a cover will add the movie/show to your favorites. This collection is reachable through the heart-shaped icon, in the navigation bar. To remove an item from your collection, just click on the icon again! How simple is that?") %></li>
                    <li><b><%= i18n.__("Watched icon") %>:</b> <%= i18n.__("Popcorn Time will keep in mind what you've already watched - a little help remembering doesn't cause any harm. You can also set an item as watched by clicking the eye-shaped icon on the covers. You can even build and synchronize your collection with Trakt.tv website, via the Settings tab.") %></li>
                    <li><b><%= i18n.__("Search") %>:</b> <%= i18n.__("In Popcorn Time, you can use the magnifier icon to open the search. Type a Title, an Actor, a Director or even a Year, press 'Enter' and let us show you what we can offer to fill your needs. To close your current search, you can click on the 'X' located next to your entry or type something else in the field.") %></li>
                    <li><b><%= i18n.__("External Players") %>:</b> <%= i18n.__("If you prefer to use a custom player instead of the built in one, you can do so by clicking the allocated icon on the 'Watch Now' button. A list of your installed players will be shown, select one and Popcorn Time will send everything to it. If your player isn't on the list, please report it to us.") %></li>
                    <li><b><%= i18n.__("Settings") %>:</b> <%= i18n.__("To push the customization even further, we offer you a large panel of options. To access the Settings, click the wheel-shaped icon in the navigation bar.") %></li>
                    <li><b><%= i18n.__("Keyboard Navigation") %>:</b> <%= i18n.__("The entire list of keyboard shortcuts is available by pressing '?' on your keyboard, or through the keyboard-shaped icon in the Settings tab.") %></li>
                    <li><b><%= i18n.__("Custom Torrents and Magnet Links") %>:</b> <%= i18n.__("You can use custom torrents and magnets links in Popcorn Time. Simply drag and drop .torrent files into the application's window, and/or paste any magnet link.") %></li>
                    <li><b><%= i18n.__("Torrent health") %>:</b> <%= i18n.__("On the details of Movies/TV Series, you can find a little circle, colored in grey, red, yellow or green. Those colors refer to the health of the torrent. A green torrent will be downloaded quickly, while a red torrent may not be downloaded at all, or very slowly. The color grey represents an error in the health calculation for Movies, and needs to be clicked in TV Series in order to display the health.") %></li>
                </ul>
            </p>

            <h2><%= i18n.__("How does Popcorn Time work?") %></h2>
            <p><%= i18n.__("Popcorn Time streams video content through torrents. Our movies are provided by %s and our TV Series by %s, while getting all metadata from %s. We don't host any content ourselves.", 'YTS (http://yts.re)', 'TVApi (http://eztvapi.re)', 'Trakt (http://trakt.tv)') %><br>
            <%= i18n.__("Torrent streaming? Well, torrents use Bittorrent protocol, which basically means that you download small parts of the content from another user's computer, while sending the parts you already downloaded to another user. Then, you watch those parts, while the next ones are being downloaded in the background. This exchange allows the content to stay healthy.") %><br>
            <%= i18n.__("Once the movie is fully downloaded, you continue to send parts to the other users. And everything is deleted from your computer when you close Popcorn Time. As simple as that.") %><br><br>
            <%= i18n.__("The application itself is built with Node-Webkit, HTML, CSS and Javascript. It works like the Google Chrome browser, except that you host the biggest part of the code on your computer. Yes, Popcorn Time works on the same technology as a regular website, like... let's say Wikipedia, or Youtube!") %>
            </p>

            <h2><%= i18n.__("I found a bug, how do I report it?") %></h2>
            <p>
                <em><%= i18n.__("Warning: Always use English when contacting us, or we might not understand you.") %></em><br><br>
                <b>A) <%= i18n.__("First method") %></b><br>
                    <a id="in-app-reporter"><%= i18n.__("Use the in-app reporter") %></a><br>
                    <em><%= i18n.__("You can find it later on the About page") %></em>
                    <br><br>

                <b>B) <%= i18n.__("Second method") %></b><br>
                    <%= i18n.__("You can create an account on our %s repository, and click on %s.", '<a class="links" href="https://git.popcorntime.io/users/sign_up">GitLab</a>', '"Issues"') %>
                        <li><%= i18n.__("Use the %s issue filter to search and check if the issue has already been reported or is already fixed.", 'GitLab') %></li>
                        <li><%= i18n.__("Include a screenshot if relevant - Is your issue about a design feature or a bug?") %></li>
                    <br>
                    <%= i18n.__("A good bug report shouldn't leave others needing to chase you up for more information. Be sure to include the details of your environment.") %>
                <br><br>
            </p>
        </div>
    </div>
</div>
