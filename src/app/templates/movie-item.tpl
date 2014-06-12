<div id ="tt<%= imdb %>">
	<img class="cover-image" src="<%= image %>" style="display: none">
	<div class="cover">
		<div class="cover-overlay">
			<div class="actions-favorites"></div>
			<div class="actions-watched"><img src = "./images/icons/ViewMoreInfo.png"/></div>
		</div>
	</div>

	<p class="title" title="<%= title %>"><%= title %></p>
	<p class="year"><%= year %></p>
	<% if(Settings.moviesShowQuality){ %>
		<p class="seasons">
		<% q720 = torrents["720p"] !== undefined; q1080 = torrents["1080p"] !== undefined;
		if (q720 && q1080) { %>720p/1080p<% } else if (q1080) { %>1080p<% } else if (q720) { %>720p<% } else { %>HDRip<% } %>
		</p>
	<% } %>
</div>