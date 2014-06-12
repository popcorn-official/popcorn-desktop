		<ul class="nav nav-hor left">
			<li class="source active showMovies"><%= i18n.__("Movies") %></li>
			<li class="source showShows"><%= i18n.__("TV Series") %></li>
		</ul>
		<ul id="nav-filters" class="nav nav-hor filters">
			<li class="dropdown filter genres">
				<a class="dropdown-toggle" data-toggle="dropdown" href="#">
					<%= i18n.__("Genre") %><span class="value"><%= i18n.__(genre.capitalizeEach()) %></span>
					<span class="caret"></span>
				</a>
				<ul class="dropdown-menu">
					<% _.each(genres, function(c) { %>
					<li><a href="#" data-value="<%= c %>"><%= i18n.__(c.capitalizeEach()) %></a></li>
					<% }); %>
				</ul>
			</li>
			<li class="dropdown filter sorters">
				<a class="dropdown-toggle" data-toggle="dropdown" href="#">
					<%= i18n.__("Sort by") %><span class="value"><%= i18n.__(sorter.capitalizeEach()) %></span>
					<span class="caret"></span>
				</a>
				<ul class="dropdown-menu">
					<% _.each(sorters, function(c) { %>
					<li><a href="#" data-value="<%= c %>"><%= i18n.__(c.capitalizeEach()) %></a></li>
					<% }); %>
				</ul>
			</li>
		</ul>
		<ul class="nav nav-hor right">
			<li>
				<div class="right search">
					<span class="remove-search"><span class="text-search"></span></span>
					<form><input id="searchbox" type="text" placeholder="<%= i18n.__("Search") %>"></form>
				</div>
			</li>
			<li><button class="favorites"></button></li>
			<li><button class="about"></button></li>
			<li><button class="settings"></button></li>
		</ul>