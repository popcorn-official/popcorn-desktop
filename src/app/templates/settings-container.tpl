<div class="settings-container">
	<div class="close"></div>
	<div class="sidebar">
		<div class="title"><%= i18n.__("Settings") %></div>
		<div class="user-interface"><%= i18n.__("User Interface") %></div>
		<div class="subtitles-options"><%= i18n.__("Subtitles") %></div>
		<div class="more-options"><%= i18n.__("More Options") %></div>
	</div>
	<div class="content">

		<div class="success_alert" style="display:none"><%= i18n.__("Saved") %><span id="checkmark-notify"><div id="stem-notify"></div><div id="kick-notify"></div></span></div>

		<div class="user-interface">
			<div class="dropdown subtitles-language">
				<p><%= i18n.__("Default Language") %>:</p>
				<%
					var langs = "";
					for(var key in App.Localization.allTranslations) {
							key = App.Localization.allTranslations[key];
							if (App.Localization.langcodes[key] !== undefined) {
							langs += "<option "+(Settings.language == key? "selected='selected'":"")+" value='"+key+"'>"+
										App.Localization.langcodes[key].nativeName+"</option>";
						}
					}
				%>
				<select name="language"><%=langs%></select>
				<div class="dropdown-arrow"></div>
			</div>
			<br><br>
			<input class="settings-checkbox" name="moviesShowQuality" id="cb1" type="checkbox" <%=(Settings.moviesShowQuality? "checked='checked'":"")%>>
			<label class="settings-label" for="cb1"><%= i18n.__("Show movie quality on list") %></label>
		</div>

		<div class="subtitles-options">
			<div class="dropdown subtitles-language-default">
				<p><%= i18n.__("Default Subtitle") %>:</p>
				<%
					var sub_langs = "<option "+(Settings.subtitle_language == "none"? "selected='selected'":"")+" value='none'>" +
										i18n.__("Disabled") + "</option>";

					for(var key in App.Localization.langcodes) {
						if (App.Localization.langcodes[key].subtitle !== undefined && App.Localization.langcodes[key].subtitle == true) {
							sub_langs += "<option "+(Settings.subtitle_language == key? "selected='selected'":"")+" value='"+key+"'>"+
											App.Localization.langcodes[key].nativeName+"</option>";
						}
					}
				%>
				<select name="subtitle_language"><%=sub_langs%></select>
				<div class="dropdown-arrow"></div>
			</div>
			<div class="dropdown subtitles-size">
				<p><%= i18n.__("Size") %>:</p>
				<%
					var arr_sizes = ["26px","28px","30px","32px","34px","36px","38px","48px","50px","52px","54px","56px","58px","60px"];
					
					var sub_sizes = "";
					for(var key in arr_sizes) {
						sub_sizes += "<option "+(Settings.subtitle_size == arr_sizes[key]? "selected='selected'":"")+" value='"+arr_sizes[key]+"'>"+arr_sizes[key]+"</option>";
					}
				%>
				<select name="subtitle_size"><%=sub_sizes%></select>
				<div class="dropdown-arrow"></div>	
			</div>
		</div>

		<div class="more-options">
			<p><%= i18n.__("TV Show API Endpoint") + ":" %></p> <input type="text" name="tvshowApiEndpoint" value="<%=Settings.tvshowApiEndpoint%>">
			<br><br>
			<div class="btn-settings rebuild-tvshows-database"><%= i18n.__("Rebuild TV Shows Database") %></div>

			<div class="btn-settings flush-bookmarks"><%= i18n.__("Flush bookmarks database") %></div>

			<div class="btn-settings flush-databases"><%= i18n.__("Flush all databases") %></div>
		</div>
	</div>
</div>