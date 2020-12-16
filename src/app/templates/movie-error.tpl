<div id="movie-error">
    <h2 class="error"><%= error %></h2>
    <% if(Settings.torColSearchMore){ %>
    <div class="button retry-button">
    <% } else { %>
    <div class="button retry-button" style="margin-left:calc(50% - 125px)">
    <% } %>
        <div class="button-text"><i class="fa fa-sync">&nbsp;&nbsp;</i><%= i18n.__("Retry") %></div>
    </div>
    <% if(Settings.torColSearchMore){ %>
    <div class="button online-search">
        <div class="button-text"><i class="fa fa-search">&nbsp;&nbsp;</i><%= i18n.__("Search on %s", "Torrent Collection") %></div>
    </div>
    <% } %>
</div>
