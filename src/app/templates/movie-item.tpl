<% var p_rating = Math.round(rating) / 2; %>

<div id ="tt<%= imdb %>">
	<img class="cover-image" src="<%= image %>" style="display: none">
	<div class="cover">
		<div class="cover-overlay">
			<i class="fa fa-heart actions-favorites"></i>
			<i class="fa fa-eye actions-watched"></i>

			
				<div class="rating" <% if(Settings.coversShowRating){ %> style="display: block;"<% } %> >
					<div class="rating-stars">
						<% for (var i = 1; i <= Math.floor(p_rating); i++) { %>
							<i class="star"><svg viewbox="0 0 100 100" width="15px" height="15px"><path d="M71.686,85.706L69,60l16.982-17.541L62,39L50.001,13.98L38,39l-23.982,3.284L31,60l-2.692,25.676L49.98,72 c0.017,0,0.028,0,0.049,0L71.686,85.706z"/></svg></i>
						<% }; %>
						<% if (p_rating % 1 > 0) { %>
							<i class="star-half"><svg viewbox="0 0 100 100" width="15px" height="15px"><path d="M71.686,85.706L69,60l16.982-17.541L62,39L50.001,13.98L38,39l-23.982,3.284L31,60l-2.692,25.676L49.98,72 c0.017,0,0.028,0,0.049,0L71.686,85.706z"/></svg></i>
						<% }; %>
						<% for (var i = Math.ceil(p_rating); i < 5; i++) { %>
							<i class="star-empty"><svg viewbox="0 0 100 100" width="15px" height="15px"><path d="M71.686,85.706L69,60l16.982-17.541L62,39L50.001,13.98L38,39l-23.982,3.284L31,60l-2.692,25.676L49.98,72 c0.017,0,0.028,0,0.049,0L71.686,85.706z"/></svg></i>
						<% }; %>
					</div>
					<div class="rating-value"><%= rating %>/10</div>
				</div>
		
		</div>
	</div>

	<p class="title" title="<%= title %>"><%= title %></p>
	<p class="year"><%= year %></p>
	
		<p id="movie_quality" class="seasons quality" <% if(Settings.moviesShowQuality){ %> style="display: block;" <% } %> >
		<% q720 = torrents["720p"] !== undefined; q1080 = torrents["1080p"] !== undefined;
		if (q720 && q1080) { %>720p/1080p<% } else if (q1080) { %>1080p<% } else if (q720) { %>720p<% } else { %>HDRip<% } %>
		</p>

</div>
