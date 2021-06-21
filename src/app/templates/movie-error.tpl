<div id="movie-error">
    <h2 class="error"><%= error %></h2>
    <div class="button retry-button">
        <div class="button-text"><i class="fa fa-sync">&nbsp;&nbsp;</i><%= i18n.__("Retry") %></div>
    </div>
    <div class="button change-api">
        <div class="button-text"><i class="fa fa-server">&nbsp;&nbsp;</i><%= i18n.__("Change API Server") %></div>
    </div>
    <div class="button online-search">
        <div class="button-text"><i class="fa fa-search">&nbsp;&nbsp;</i><%= i18n.__("Search on %s", "Torrent Collection") %></div>
    </div>
</div>
