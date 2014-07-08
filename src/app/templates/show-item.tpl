<div id ="<%= imdb_id %>">
	<img class="cover-image" src="<%= images.poster %>" style="display: none">
	<div class="cover">
		<div class="cover-overlay">
			<i class="fa fa-heart actions-favorites"></i>
		</div>
	</div>

	<p class="title" title="<%= title %>"><%= title %></p>
	<p class="year"><%= year %></p>
	<% if(num_seasons == undefined) var num_seasons = 0 %>
	<p class="seasons"><%= num_seasons %> <%= num_seasons == 1 ? i18n.__("Season") : i18n.__("Seasons") %></p>
</div>