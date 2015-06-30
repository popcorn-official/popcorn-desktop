<div id="movie-error">
    <h2 class="error"><%= error %></h2>
    <div class="button retry-button" style="visibility:hidden">
        <div class="button-text"><i class="fa fa-refresh">&nbsp;&nbsp;</i><%= i18n.__("Retry") %></div>
    </div>
    <div class="button online-search" style="visibility:hidden">
        <div class="button-text"><i class="fa fa-search">&nbsp;&nbsp;</i><%= i18n.__("Search on %s", Settings.onlineSearchEngine || "Strike") %></div>
    </div>
</div>