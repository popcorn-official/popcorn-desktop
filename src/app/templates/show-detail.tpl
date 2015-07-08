<div class="fa fa-times close-icon"></div>
<div class="tv-poster">
    <div data-bgr="<%= images.fanart %>" class="tv-poster-background"><div class="tv-poster-overlay"></div></div>
    <div data-bgr="<%= images.poster %>" class="tv-cover"></div>

    <div class="tv-meta-data">
        <div class="tv-title"><%= title %></div>
        <div class="tv-year"><%= year %></div>
        <div class="tv-dot"></div>
        <div class="tv-runtime"><%= runtime %> min</div>
        <div class="tv-dot"></div>
        <div class="tv-status"><%= status !== undefined ? i18n.__(status.capitalizeEach()) : i18n.__("N/A") %></div>
        <div class="tv-dot"></div>
        <div class="tv-genre"><%= i18n.__(genres[0]) %></div>
        <div class="tv-dot"></div>
        <div data-toggle="tooltip" data-placement="top" title="<%=i18n.__("Open IMDb page") %>" class="show-imdb-link"></div>
        <div class="tv-dot"></div>
        <div class="rating-container-tv">
            <% p_rating = Math.round(rating.percentage) / 20; // Roundoff number to nearest 0.5 %>
            <div data-toggle="tooltip" data-placement="right" title="<%= Math.round(rating.percentage) / 10 %> /10" class="star-container-tv">

            <% for (var i = 1; i <= Math.floor(p_rating); i++) { %>
                    <i class="fa fa-star rating-star"></i>
                <% }; %>
                <% if (p_rating % 1 > 0) { %>
                    <span class = "fa-stack rating-star-half-container">
                        <i class="fa fa-star fa-stack-1x rating-star-half-empty"></i>
                        <i class="fa fa-star-half fa-stack-1x rating-star-half"></i>
                    </span>
                <% }; %>
                <% for (var i = Math.ceil(p_rating); i < 5; i++) { %>
                    <i class="fa fa-star rating-star-empty"></i>
            <% }; %>
            </div>
            <div class="number-container-tv hidden"><%= Math.round(rating.percentage) / 10 %> <em>/10</em></div>
        </div>
        <div class="tv-overview"><%= synopsis %></div>
        <div class="favourites-toggle"><%=i18n.__("Add to bookmarks") %></div>
        <div class="show-watched-toggle"><%=i18n.__("Mark as Seen") %></div>
    </div>
</div>

<div class="episode-base">
    <div class="episode-info">
        <div class="episode-info-title"></div>
        <div class="episode-info-number"></div>
        <div data-toggle="tooltip" data-placement="left" title="<%=i18n.__("Health Unknown") %>" class="fa fa-circle health-icon None"></div>
        <div data-toggle="tooltip" data-placement="left" title="<%=i18n.__("Magnet link") %>" class="fa fa-magnet show-magnet-link"></div>
        <div class="episode-info-date"></div>
        <div class="episode-info-description"></div>
        <div class="show-quality-container">
            <div class="quality-selector">
                <div id="q480" class="q480">480p</div>
                <div id="q720" class="q720">720p</div>
                <div id="q1080" class="q1080">1080p</div>
            </div>
        </div>
        <div class="movie-btn-watch-episode">
            <div class="button dropup" id="player-chooser"></div>
        </div>
    </div>

    <div class="display-base-title">
        <div class="episode-list-seasons"><%= i18n.__("Seasons") %></div>
        <div class="episode-list-episodes"><%= i18n.__("Episodes") %></div>
    </div>

    <div class="season-episode-container">
        <div class="tabs-base">
            <div class="tabs-seasons">
                <ul>
                    <% var torrents = {};
                    _.each(episodes, function(value, currentEpisode) {
                        if (!torrents[value.season]) torrents[value.season] = {};
                        torrents[value.season][value.episode] = value;
                    });
                    _.each(torrents, function(value, season) { %>
                        <li class="tab-season" data-tab="season-<%=season %>">
                            <a><%= i18n.__("Season %s", season) %></a>
                        </li>
                    <% }); %>
                </ul>
            </div>
            <div class="tabs-episodes">
                <% _.each(torrents, function(value, season) { %>
                    <div class="tab-episodes season-<%=season %>">
                        <ul>
                            <% _.each(value, function(episodeData, episode) {
                                var first_aired = '',
                                    q1080 = '',
                                    q720 = '',
                                    q480 = '';
                                if (episodeData.first_aired !== undefined) {
                                    first_aired = moment.unix(episodeData.first_aired).locale(Settings.language).format("LLLL");
                                }
                                if(episodeData.torrents["480p"]) {
                                    q480 = episodeData.torrents["480p"].url;
                                }
                                if(episodeData.torrents["720p"]) {
                                    q720 = episodeData.torrents["720p"].url;
                                }
                                if(episodeData.torrents["1080p"]) {
                                    q1080 = episodeData.torrents["1080p"].url;
                                }

                            %>
                                <li class="tab-episode" data-id="<%=episodeData.tvdb_id %>">
                                    <a href="#" class="episodeData">
                                        <span><%=episodeData.episode %></span>
                                        <div><%=episodeData.title %></div>
                                    </a>
                                    
                                    <i id="watched-<%=episodeData.season%>-<%=episodeData.episode%>" class="fa fa-eye watched"></i>


                                    <!-- hidden template so we can save a DB query -->
                                    <div class="template-<%=episodeData.tvdb_id %>" style="display:none">
                                        <span class="title"><%=episodeData.title %></span>
                                        <span class="date"><%=first_aired %></span>
                                        <span class="season"><%=episodeData.season %></span>
                                        <span class="episode"><%=episodeData.episode %></span>
                                        <span class="overview"><%=episodeData.overview %></span>
                                        <span class="q480"><%=q480 %></span>
                                        <span class="q720"><%=q720 %></span>
                                        <span class="q1080"><%=q1080 %></span>
                                    </div>
                                </li>
                            <% }); %>
                        </ul>
                    </div><!--End tabs-episode-->
                <% }); %>
            </div><!--End tabs-episode-base-->
        </div><!--End tabs_base-->
    </div><!--End season-episode-container-->
</div>