<%  
if(typeof backdrop === "undefined"){ backdrop = ""; }; 
if(typeof synopsis === "undefined"){ synopsis = "Synopsis not available."; }; 
if(typeof runtime === "undefined"){ runtime = "N/A"; };
if (genre) {
    for(var i = 0; i < genre.length; i++) {
        genre[i] = i18n.__(genre[i]); 
    }
} else {
    var genre = [undefined];
};
%>

<div data-bgr="<%= backdrop %>" class="backdrop"></div>
<div class="backdrop-overlay"></div>

<div class="fa fa-times close-icon"></div>

<section class="poster-box">
    <img src="images/posterholder.png" data-cover="<%= cover %>" class="mcover-image" />
</section>

<section class="content-box">

    <div class="meta-container">
        <div class="title"><%= title %></div>

        <div class="metadatas">
            <div class="metaitem"><%= year %></div>
            <div class="dot"></div>
            <div class="metaitem"><%= runtime %> min</div>
            <div class="dot"></div>
            <div class="metaitem"><%= genre.join(" / ") %></div>
            <div class="dot"></div>
            <div data-toggle="tooltip" data-placement="top" title="<%=i18n.__("Open IMDb page") %>" class="movie-imdb-link"></div>
            <div class="dot"></div>
            <div class="rating-container">
                <div class="star-container" data-toggle="tooltip" data-placement="right" title="<%= rating %>/10">
                <% var p_rating = Math.round(rating) / 2; %>
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
                <div class="number-container hidden"><%= rating %> <em>/10</em></div>
            </div>
            <div data-toggle="tooltip" data-placement="left" title="<%=i18n.__("Health false") %>" class="fa fa-circle health-icon <%= health %>"></div>
            <div data-toogle="tooltip" data-placement="left" title="<%=i18n.__("Magnet link") %>" class="fa fa-magnet magnet-link"></div>

        </div>

        <div class="overview"><%= synopsis %></div>
    </div>

    <div class="bottom-container">

        <div class="favourites-toggle"><%=i18n.__("Add to bookmarks") %></div>
        <div class="watched-toggle"><%=i18n.__("Not Seen") %></div>
        <div class="sub-dropdown">
          <%= i18n.__("Subtitles") %>
          <div class="sub-flag-icon flag selected-lang none"></div>
          <div class="sub-dropdown-arrow"></div>
        </div>                                            
        <div class="flag-container">
                  <div class="sub-flag-icon flag none" data-lang="none" title="<%= i18n.__("Disabled") %>"></div>
                  <% for(var lang in subtitle){ %>
                      <div class="sub-flag-icon flag <%= lang %>" data-lang="<%= lang %>" title="<%= App.Localization.langcodes[lang].nativeName %>"></div>
                   <% } %>
        </div>
        
        <br>
        
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
</section>