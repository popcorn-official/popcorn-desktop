<div class="about-container">
	<div class="fa fa-times close-icon"></div>
	<div class="overlay-content"></div>
	<div class="margintop"></div>
	<img class="icon-about" src="/src/app/images/icon.png">
	<img class="icon-title" src="/src/app/images/icons/big-logo.png">
	<div class="content">
		<div class="title-version">
			<%= App.settings.version %> Beta
			<% if(App.git) { %>
				- <small><i><%= App.git.branch %> (<a class="links" href="https://git.popcorntime.io/stash/projects/PT/repos/popcorn-app/commits/<%= App.git.commit %>"><%= App.git.commit.slice(0,8) %></a>)</i></small>
			<% } %>
		</div>
		<div class="text-about">
			<div class="full-text">
				<%= i18n.__("Popcorn Time! is the result of many developers and designers putting a bunch of APIs together to make the experience of watching torrent movies as simple as possible.") %><br/>
				<%= i18n.__("We are an open source project. We are from all over the world. We love our movies. And boy, do we love popcorn.") %>
			</div>
		</div>
		<div class="icons_social">
			<a href='https://popcorntime.io' data-toggle="tooltip" data-placement="top" title="https://popcorntime.io" class='links site_icon'></span></a>
			<a href='https://twitter.com/popcorntimetv' data-toggle="tooltip" data-placement="top" title="https://twitter.com/popcorntimetv" class='links twitter_icon'></span></a>
			<a href='https://www.fb.com/PopcornTimeTv' data-toggle="tooltip" data-placement="top" title="https://www.fb.com/PopcornTimeTv" class='links facebook_icon'></span></a>
			<a href='https://gplus.to/PopcornTimeTV' data-toggle="tooltip" data-placement="top" title="https://gplus.to/PopcornTimeTV" class='links google_icon'></span></a>
			<a href='https://github.com/popcorn-official'data-toggle="tooltip" data-placement="top" title="https://github.com/popcorn-official" class='links github_icon'></span></a>
			<a href='http://blog.popcorntime.io' data-toggle="tooltip" data-placement="top" title="http://blog.popcorntime.io" class='links blog_icon'></span></a>
			<a href='http://discuss.popcorntime.io' data-toggle="tooltip" data-placement="top" title="http://discuss.popcorntime.io" class='links forum_icon'></span></a>
		</div>
		<div class="last-line">
			<%= i18n.__("Made with") %> <span style="color:#e74c3c;">&#10084;</span> <%= i18n.__("by a bunch of geeks from All Around The World") %>
		</div>
	</div>
</div>