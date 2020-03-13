<div class="play-control">
    <div class="flex-left">
        <div class="row setup-container">
            <div class="toggles-container">
                <div class="favourites-toggle"><%=i18n.__("Add to bookmarks") %></div>
                <div class="watched-toggle"><%=i18n.__("Not Seen") %></div>
            </div>
        </div>
        <div class="row">
            <div id="player-chooser" class="play-selector"></div>
            <div id="watch-trailer"  class="button play-selector"><%=i18n.__("Watch Trailer") %></div>

            <div class="movie-quality-container">
                <div class="sdow-quality">
                    <div id="q720" class="q720">720p</div>
                    <div id="q1080" class="q1080">1080p</div>
                    <div id="q2160" class="q2160">4K</div>
                </div>
            </div>
        </div>
    </div>
    <div class="flex-right dropdowns-container">
        <div id="subs-dropdown"></div>
        <div id="audio-dropdown"></div>
    </div>
</div>
