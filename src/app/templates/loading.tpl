<div class="loading">
	<div style="background-image:url( <%= backdrop %> )" class="loading-background"></div>
	<div class="loading-background-overlay"></div>

	<div class="state">
		<!-- download -->
		<div class="text_download"><%= i18n.__(state) %></div>

		<div class="seed_status" style="display:none">
			<!-- loading bar -->
			<div class="loading-progressbar">
				<div id="loadingbar-contents"></div>
			</div>

			<!-- Active Peers -->
			<div class="value_peers"></div>
			<div class="text_peers"><%= i18n.__("Peers") %> - </div>

			<div class="download_speed"></div>
			<div class="value_download"></div>
			<div class="download_percent"></div>
		</div>

		<div class="loading-button button-cancel"><div class="loading-button-text"><%= i18n.__("Cancel") %></div></div>
	</div>
</div>