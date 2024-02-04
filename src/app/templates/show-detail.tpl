<div class="show-detail-container">
    <div class="fa fa-times close-icon"></div>

    <section class="show-header">
        <div class="sh-backdrop">
            <div class="shb-img"></div>
        </div>
        <div class="sh-poster">
            <div class="shp-img"></div>
        </div>
        <div class="sh-metadata">
            <div class="shm-title"><%= displayTitle %></div>
            <div class="shm-infos">
                <div class="shmi-year" data-toggle="tooltip" data-placement="top" title="<%=i18n.__('Show Release Info') %>"><%= year %></div>
                    <span class="dot"></span>
                <div class="shmi-runtime"><%= runtime %> min</div>
                    <span class="dot"></span>
                <div class="shmi-status"><%= status !== undefined ? i18n.__(status.capitalizeEach()) : i18n.__("N/A") %></div>
                    <span class="dot"></span>
                <div class="shmi-genre"><%= genres.length > 0 && genres[0] !== undefined ? i18n.__(genres[0].capitalizeEach()).toLowerCase() : i18n.__("N/A") %></div>
                    <span class="dot"></span>
                <div class="shmi-imdb" data-toggle="tooltip" data-placement="top" title="<%=i18n.__('Open IMDb page') %>"></div>
                    <span class="dot"></span>
                <div class="shmi-rating">
                    <% p_rating = Math.round(rating.percentage) / 20;%>
                    <div data-toggle="tooltip" data-placement="right" title="<%= Math.round(rating.percentage) / 10 %>/10" class="star-container-tv">
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
                    <div class="number-container-tv hidden"><%= Math.round(rating.percentage) / 10 %><em>/10</em></div>
                </div>
                <div class="shmi-tmdb-link" data-toggle="tooltip" data-placement="top" title="<%=i18n.__('Submit metadata & translations') %>"><i class="fa fa-pencil-alt"></i></div>
            </div>
            <div class="shm-synopsis"><%= displaySynopsis %></div>
        </div>
        <div class="sh-actions">
            <div class="flex-left">
                <div class="sha-bookmark"><%=i18n.__("Add to bookmarks") %></div>
                <div class="sha-watched"><%=i18n.__("Mark as Seen") %></div>
            </div>
            <div class="flex-right dropdowns-container">
                <div id="subs-dropdown"></div>
                <div id="audio-dropdown"></div>
            </div>
        </div>
    </section>

    <section class="show-details<% if (Settings.seriesUITransparency !== 'medium') {switch(Settings.seriesUITransparency) { case '' : %> transpOff<%; break; case 'vlow': %> transpVLow<%; break; case 'low' : %> transpLow<%; break; case 'high': %> transpHigh<%; break; case 'vhigh': %> transpVHigh<%; break; default: %><%}} %>">
        <div class="spinner">
            <div class="loading-container">
                <div class="ball"></div>
                <div class="ball1"></div>
            </div>
        </div>
        <div class="sd-seasons">
            <div class="sds-title"><%= i18n.__("Seasons") %></div>
            <div class="sds-list">
                <ul>
                    <%_.each(torrents, function(value, season) { %>
                    <li class="tab-season<%= Settings.seriesUITransparency ? '' : ' transpOff' %>" data-tab="season-<%=season %>">
                        <a><%= i18n.__("Season %s", season) %></a>
                    </li>
                    <% }); %>
                </ul>
            </div>
        </div>
        <div class="sd-episodes">
            <div class="sde-title"><%= i18n.__("Episodes") %></div>
            <div class="sde-list">
                <% _.each(torrents, function(value, season) { %>
                <div class="tab-episodes season-<%=season %>">
                    <ul>
                        <% _.each(value, function(episodeData, episode) { %>
                        <li class="tab-episode<%= Settings.seriesUITransparency ? '' : ' transpOff' %>" data-id="<%=episodeData.tvdb_id %>" data-season="<%=episodeData.season %>" data-episode="<%=episodeData.episode %>">
                            <a href="#" class="episodeData">
                                <span><%=episodeData.episode %></span>
                                <% if (Settings.activateSeedbox) { %>
                                <div style="max-width:calc(60vw - 395px)"><%=localizeEpisode(episodeData).listTitle %></div>
                                <% } else { %>
                                <div><%=localizeEpisode(episodeData).listTitle %></div>
                                <% } %>
                            </a>

                            <i id="watched-<%=episodeData.season%>-<%=episodeData.episode%>" class="fa fa-eye watched"></i>
                        </li>
                        <% }); %>
                    </ul>
                </div>
                <% }); %>
            </div>
        </div>
        <div class="sd-overview<%= Settings.seriesUITransparency ? '' : ' transpOff' %>">
            <div class="sdo-infos">
                <div class="sdoi-title"></div>
                <div class="sdoi-links">
                    <div data-toggle="tooltip" data-placement="left" title="" class="source-icon"></div>
                    <div data-toggle="tooltip" data-placement="left" title="<%=i18n.__('Magnet link') %>" class="fa fa-magnet magnet-icon"></div>
                    <div data-toggle="tooltip" data-placement="left" title="<%=i18n.__('Health Unknown') %>" class="fa fa-circle health-icon None"></div>
                </div>
                <div class="sdoi-aired">
                    <div class="sdoi-number"></div>
                    <div class="sdoi-date"></div>
                </div>
                <div class="sdoi-synopsis"></div>
            </div>
            <div id="torrent-list"></div>
            <div class="sdo-watch">
                <div id="quality-selector"></div>
                <% if (showTorrentsMore) { %>
                <div id="show-all-torrents" class="show-all-torrents"><%=i18n.__("more...") %></div>
                <% } %>
                <div class="sdow-watchnow">
                    <div id="player-chooser"></div>
                </div>
                <% if (Settings.activateSeedbox) { %>
                <div id="download-torrent" class="button play-selector"><i class="fa fa-download"></i></div>
                <% } %>
            </div>
        </div>
        <div class="sd-torrents" id="torrent-show-list"></div>
    </section>

</div>
