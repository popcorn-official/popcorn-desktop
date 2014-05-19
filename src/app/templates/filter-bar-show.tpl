<ul class="nav nav-hor left">
	<li class="source showMovies"><%= i18n.__("Movies") %></li>
	<li class="source active showShows"><%= i18n.__("TV Series") %></li>
</ul>

<ul id="nav-filters" class="nav nav-hor filters">
	<li class="dropdown filter genres">
		<a class="dropdown-toggle" data-toggle="dropdown" href="#">
			<%= i18n.__("Genre") %><span class="value"><%= i18n.__(genre) %></span>
			<span class="caret"></span>
		</a>
		<ul class="dropdown-menu">
			<% _.each(genres, function(c) { %>
			<li><a href="#" data-value="<%= c %>"><%= i18n.__(c) %></a></li>
			<% }); %>
		</ul>
	</li>
	<li class="dropdown filter sorters">
		<a class="dropdown-toggle" data-toggle="dropdown" href="#">
			<%= i18n.__("Sort by") %><span class="value"><%= i18n.__((sorter.capitalizeEach())) %></span>
			<span class="caret"></span>
		</a>
		<ul class="dropdown-menu">
			<% _.each(sorters, function(c) { %>
			<li><a href="#" data-value="<%= c %>"><%= i18n.__((c.capitalizeEach())) %></a></li>
			<% }); %>
		</ul>
	</li>
</ul>
<ul class="nav nav-hor right">
	<li>
		<div class="right search">
			<form><input type="text" placeholder="<%= i18n.__("Search") %>"></form>
		</div>
	</li>
	<!--<li><button class="triggerUpdate"></button></li>-->
	<li><button class="favorites"></button></li>
	<li><button class="about"></button></li>
	<li><button class="settings"></button></li>
</ul>