<ul class="nav nav-hor left">
	<li class="source active showMovies"><%= i18n.__("Movies") %></li>
	<li class="source showShows"><%= i18n.__("TV Series") %></li>
        <li class="source showAnime"><%= i18n.__("Anime") %></li>
</ul>
<ul id="nav-filters" class="nav nav-hor filters">
	<% if(typeof type !== 'undefined'){ %>
		<li class="dropdown filter types">
			<a class="dropdown-toggle" data-toggle="dropdown" href="#">
				<%= i18n.__("Type") %>
					<span class="value"><%= i18n.__(type.capitalizeEach()) %></span>
					<span class="caret"></span>
			</a>
			<ul class="dropdown-menu">
				<% _.each(types, function(c) { %>
					<li><a href="#" data-value="<%= c %>"><%= i18n.__(c) %></a></li>
				<% }); %>
			</ul>
		</li>

	<% }if(typeof genre !== 'undefined'){ %>
		<li class="dropdown filter genres">
			<a class="dropdown-toggle" data-toggle="dropdown" href="#">
				<%= i18n.__("Genre") %>
					<span class="value"><%= i18n.__(genre.capitalizeEach()) %></span>
					<span class="caret"></span>
			</a>
			<ul class="dropdown-menu">
				<% _.each(genres, function(c) { %>
					<li><a href="#" data-value="<%= c %>"><%= i18n.__(c.capitalizeEach()) %></a></li>
				<% }); %>
			</ul>
		</li>
	<%} if(typeof sorter !== 'undefined'){ %>
		<li class="dropdown filter sorters">
			<a class="dropdown-toggle" data-toggle="dropdown" href="#">
				<%= i18n.__("Sort by") %>
					<span class="value"><%= i18n.__(sorter.capitalizeEach()) %></span>
					<span class="caret"></span>
			</a>
			<ul class="dropdown-menu">
				<% _.each(sorters, function(c) { %>
					<li><a href="#" data-value="<%= c %>"><%= i18n.__(c.capitalizeEach()) %></a></li>
				<% }); %>
			</ul>
		</li>
	<%}%>
</ul>
<ul class="nav nav-hor right">
	<li>
		<div class="right search">
			<span class="remove-search">
				<span class="text-search"></span>
			</span>
			<form>
				<input id="searchbox" type="text" placeholder="<%= i18n.__("Search") %>">
			</form>
		</div>
	</li>
	<li>
		<i id="filterbar-favorites" class="fa fa-heart favorites"></i>
	</li>
	<li>
		<i id="filterbar-about" class="fa fa-info-circle about"></i>
	</li>
	<li>
		<i id="filterbar-settings" class="fa fa-cog settings"></i>
	</li>
</ul>
