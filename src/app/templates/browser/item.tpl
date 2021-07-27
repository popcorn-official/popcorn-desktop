<%
    if (typeof rating === 'object') { var rating = rating.percentage /10; }
%>
<div class="cover">
    <div class="cover-imgs">
        <% if (typeof hasNotLanguage !== 'undefined') {%>
        <i class="fa fa-language cover-translate"></i>
        <%} %>
    </div>
    <div class="cover-overlay cover-info-overlay">
        <i class="fa fa-heart actions-favorites tooltipped" data-toggle="tooltip" data-placement="auto bottom" data-delay='{ "show": "800", "hide": "100" }'></i>
        <i class="fa fa-eye actions-watched tooltipped" data-toggle="tooltip" data-placement="auto bottom" data-delay='{ "show": "800", "hide": "100" }'></i>

        <% if(typeof rating !== 'undefined'){
        var p_rating = Math.round(rating) / 2;  %>
            <div class="rating" <% if(Settings.coversShowRating){ %> style="display: block;"<% } %> >
                <div class="rating-stars">
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
                <div class="rating-value"><%= parseFloat(rating).toFixed(1) %>/10</div>
            </div>
        <%} %>
    </div>
</div>

<p class="title tooltipped" <% if(title.length > 20){ %> title="<%= title1 %>" data-toggle="tooltip" data-placement="auto bottom" <% } %> ><%= title1 %></p>
<% if (typeof title2 !== 'undefined' && title2 !== '') {%>
    <p class="title2 tooltipped" <% if(title2.length > 20){ %> title="<%= title2 %>" data-toggle="tooltip" data-placement="auto bottom" <% } %> ><%= title2 %></p>
<%} %>
<p class="year">
    <% if (typeof year !== 'undefined') {%>
        <%= year %>
    <%} %>
</p>

<% if (typeof item_data !== 'undefined') {%>
        <p class="seasons data">
            <%= i18n.__(item_data) %>
        </p>
<% } else if(typeof num_seasons !== 'undefined'){%>
    <p class="seasons">
        <%= num_seasons %> <%= num_seasons == 1 ? i18n.__("Season") : i18n.__("Seasons") %>
    </p>
<%}else if (typeof torrents !== 'undefined') { %>
    <p id="movie_quality" class="seasons quality" <% if(Settings.moviesShowQuality){ %> style="display: block;" <% } %> >
        <% q720 = torrents["720p"] !== undefined; q1080 = torrents["1080p"] !== undefined; q2160 = torrents["2160p"] !== undefined;
        if (q720 && q1080 && q2160) { %>
            720p/1080p/2160p
        <% } else if (q720 && q1080) { %>
            720p/1080p
        <% } else if (q720 && q2160) { %>
            720p/2160p
        <% } else if (q1080 && q2160) { %>
            1080p/2160p
        <% } else if (q2160) { %>
            2160p
        <% } else if (q1080) { %>
            1080p
        <% } else if (q720) { %>
            720p
        <% } else { %>
            HDRip
        <% } %>
    </p>
<%} %>
