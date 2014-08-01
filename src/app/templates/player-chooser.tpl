<div id="watch-now" class="left"><%=i18n.__("Watch Now") %></div>
<div class="dropdown-toggle left playerchoice" data-toggle="dropdown">
  <img class="imgplayerchoice" src="images/icons/pt-icon.png"/>
  <span class="caret"></span>
</div>
<ul class="dropdown-menu playerchoicemenu" role="menu">
  <% _.each(items, function(item){ %>
    <li id ="player-<%= item.type %>">
      <a href="#"> <%= item.name %>
        <img class="playerchoiceicon" src="images/icons/<%= item.type %>-icon.png"/>
    </a>
    </li>
  <% }); %>
</ul>
