<div class="play-control">
    <div class="flex-left">
        <div class="row setup-container">
            <div class="toggles-container">
                <div class="favourites-toggle"><%=i18n.__("Add to bookmarks") %></div>
                <div class="watched-toggle"><%=i18n.__("Not Seen") %></div>
            </div>
        </div>
        <div class="row">
            <div class="button dropup" id="player-chooser"></div>
            <div id="watch-trailer" class="button"><%=i18n.__("Watch Trailer") %></div>

            <div class="movie-quality-container">
                <% if (torrents["720p"] !== undefined && torrents["1080p"] !== undefined) { %>
                <div class="q720">720p</div>
                <div class="q1080">1080p</div>
                <div class="quality switch white">
                    <input data-toogle="tooltip" data-placement="top" title="720p - <%= Common.fileSize(torrents['720p'].size) %><br>1080p - <%= Common.fileSize(torrents['1080p'].size) %>" type="radio" name="switch" id="switch-hd-off" >
                    <input data-toogle="tooltip" data-placement="top" title="720p - <%= Common.fileSize(torrents['720p'].size) %><br>1080p - <%= Common.fileSize(torrents['1080p'].size) %>" type="radio" name="switch" id="switch-hd-on" checked >
                    <span class="toggle"></span>
                </div>
                <% } else { %>
                <% if (torrents["720p"] !== undefined) { %>
                <div data-toogle="tooltip" data-placement="top" title="<%= Common.fileSize(torrents['720p'].size) %>" class="q720">720p</div>
                <% }else if (torrents["1080p"] !== undefined) { %>
                <div data-toogle="tooltip" data-placement="top" title="<%= Common.fileSize(torrents['1080p'].size) %>" class="q720">1080p</div>
                <% } else { %>HDRip<% } %> 
                <% } %>
            </div>
        </div>
    </div>
    <div class="flex-right dropdowns-container">
        <div id="subs-dropdown"></div>
        <div id="audio-dropdown"></div>
    </div>
</div>
