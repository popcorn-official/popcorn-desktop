<div class="movie-detail">
	<div class="detail-window">
	<%  
		if(typeof backdrop === 'undefined'){ backdrop = ''; }; 
		if(typeof synopsis === 'undefined'){ synopsis = 'Synopsis not available.'; }; 
 		if(typeof runtime === 'undefined'){ runtime = 'N/A'; }; 
 	%>
		<div id="movie-backdrop" data-bgr="<%= backdrop %>" class="movie-backdrop"></div>
		<div class="movie-backdrop-overlay"></div>
		<div class="cover-detail-overlay"><div class="cover-detail-favorites"></div></div>
		<img class="movie-cover-image" src="<%= image %>" />
		<div class="sperator-movie"></div>
		<div class="movie-meta-title"><%= title %></div>
		<div class="movie-quick-info">
			<div class="movie-meta-details"><%= year %></div>
			<div class="movie-dot"></div>
			<% if (synopsis.length > 528) { var synopsis = synopsis.substring(0, 528) + "..."; } %>
			<div class="movie-meta-details"><%= runtime %> min</div>
			<div class="movie-dot"></div>

			<% var p_rating = Math.round(rating) / 2; %>

			<div data-toggle="tooltip" data-placement="left" title="Health <%= health %>" class="health-icon Excellent"></div>

			<div data-toggle="tooltip" data-placement="right" title="<%= rating %>/10" class="star-container">
				<% for (var i = 1; i <= Math.floor(p_rating); i++) { %>
					<div class="rating-star full"></div>
				<% }; %>
				<% if (p_rating % 1 > 0) { %>
					<div class="rating-star half"></div>
				<% }; %>
				<% for (var i = Math.ceil(p_rating); i < 5; i++) { %>
					<div class="rating-star null"></div>
				<% }; %>
			</div>
		</div>

		<div class="movie-overview-container">
			<div class="movie-meta-overview"><%= synopsis %></div>
		</div>

		<div class="movie-detail-close"></div>

		<div class="movie-controlls-container">

			<div class="movie-btn-watch"><div class="movie-watch-now"><%= i18n.__("Watch Now") %></div></div>

			<div class="movie-btn-watch-trailer">
				<div class="movie-watch-now"><%= i18n.__("Watch Trailer") %></div>
			</div>

			<div class="movie-quality-container">
				<% if (torrents["720p"] !== undefined && torrents["1080p"] !== undefined) { %>
					<div class="q720">720</div>
					<div class="q1080">1080</div>
					<div class="quality switch white">
						<input type="radio" name="switch" id="switch-hd-off" >
						<input type="radio" name="switch" id="switch-hd-on" checked >
						<span class="toggle"></span>
					</div>
				<% } else { %>
					<div class="q720"><% if (torrents["720p"] !== undefined) { %>720p<% }else { %><% if (torrents["1080p"] !== undefined) { %>1080p<% }} %> </div>
				<% } %>
			</div>

			<div class="sub-dropdown"><%= i18n.__("Subtitles") %><div id="toggle-sub-dropdown" class="flag toggle NA selected-lang"></div>
			<div id="toggle-sub-dropdown-arrow" class="sub-dropdown-arrow-down"></div> <div class="sub-dropdown-arrow-up"></div> </div>

			<div class="flag-container">
				<% for(var lang in subtitle){ %>
					<div class="sub-flag-icon flag <%= lang %>" data-lang="<%= lang %>" title="<%= App.Localization.langcodes[lang].nativeName %>"></div>
				<% } %>
			</div>
		</div>
	</div>
</div>