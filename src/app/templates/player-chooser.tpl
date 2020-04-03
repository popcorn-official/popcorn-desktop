<div class="button dropup" >
    <div id="watch-now" class="left startStreaming" data-torrent="" data-episodeid="" data-episode="" data-season=""><%=i18n.__("Watch Now") %></div>
    <div class="dropdown-toggle left playerchoice" data-toggle="dropdown">
        <img class="imgplayerchoice" src="images/icons/local-icon.png"/>
        <span class="caret"></span>
    </div>
    <ul class="dropdown-menu playerchoicemenu" role="menu">
        <% _.each(items, function(item){ %>
        <li id ="player-<%= item.id %>">
            <a href="#"> <%= item.name %>
                <img class="playerchoiceicon" src="images/icons/<%= item.type %>-icon.png"/>
            </a>
        </li>
        <% }); %>
    </ul>
</div>
