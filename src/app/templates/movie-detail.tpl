<%
if(typeof health === "undefined"){ health = false; };
if(typeof synopsis === "undefined"){ synopsis = "Synopsis not available."; };
if(typeof runtime === "undefined"){ runtime = "N/A"; };
if (genre) {
    for(var i = 0; i < genre.length; i++) {
        genre[i] = i18n.__(genre[i].capitalizeEach()).toLowerCase();
    }
} else {
    var genre = [undefined];
};
%>
<div class="backdrop"></div>
<div class="backdrop-overlay"<% if(Settings.moviesUITransparency !== '0.65') {%> style="opacity:<%=Settings.moviesUITransparency%>"<%}%>></div>
<div class="spinner">
    <div class="loading-container">
        <div class="ball"></div>
        <div class="ball1"></div>
    </div>
</div>
<div class="fa fa-times close-icon"></div>
<section class="poster-box">
    <img src="images/posterholder.png" class="mcover-image" />
</section>
<section class="content-box">
    <div class="meta-container">
        <div class="title"><%= displayTitle %></div>
        <div class="metadatas">
            <div class="metaitem"></div><div class="year" data-toggle="tooltip" data-container="body" data-placement="top" title="<%=i18n.__('Show Release Info') %>"><%= year %></div>
            <div class="metaitem"><%= runtime %> min</div>
            <div class="metaitem"><%= genre.join(" / ") %></div>
            <% if((typeof(certification) !== 'undefined') && (certification !== null) && (certification !== '') && (certification !== 'NR')) { %>
                <div class="metaitem"></div><div class="certification" data-toggle="tooltip" data-placement="top" title="<%=i18n.__('Parental Guide') %>"><%= certification %></div>
            <% } %>
            <div class="metaitem"></div><div class="fa fa-users show-cast" data-toggle="tooltip" data-placement="top" title="<%=i18n.__('Show cast') %>"></div>
            <div class="metaitem"></div><div data-toggle="tooltip" data-placement="top" title="<%=i18n.__('Open IMDb page') %>" class="movie-imdb-link"></div>
            <div class="metaitem rating-container">
                <div class="star-container" data-toggle="tooltip" data-container="body" data-placement="right" title="<%= rating %>/10">
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
            <div data-toggle="tooltip" data-placement="top" title="<%=i18n.__('Submit metadata & translations') %>" class="fa fa-pencil-alt tmdb-link"></div>
            <div class="status-indicators">
                <div data-toggle="tooltip" data-placement="left" title="<%=i18n.__('Health false') %>" class="fa fa-circle health-icon <%= health %>"></div>
                <div data-toogle="tooltip" data-placement="left" title="<%=i18n.__('Magnet link') %>" class="fa fa-magnet magnet-link"></div>
                <div data-toogle="tooltip" data-placement="left" title="" class="source-link"></div>
            </div>
        </div>
        <div class="overview"><%= displaySynopsis %></div>
        <div id="torrent-list"></div>
    </div>
    <div id="play-control"></div>
</section>
