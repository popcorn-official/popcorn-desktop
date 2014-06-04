<div class="settings-container">
	<div class="close"></div>
	<div class="sidebar">
		<div class="title"><%= i18n.__("Settings") %></div>
		<div class="user-interface"><%= i18n.__("User Interface") %></div>
		<div class="quality-options"><%= i18n.__("Quality") %></div>
		<div class="subtitles-options"><%= i18n.__("Subtitles") %></div>
		<div class="trakt-options"><%= i18n.__("Trakt.tv") %></div>
		<div class="more-options"><%= i18n.__("More Options") %></div>
		<div class="advanced-settings"><%= i18n.__("Advanced Settings") %></div>
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
		</div>
		
		<div class="quality-options">
			<input class="settings-checkbox" name="moviesShowQuality" id="cb1" type="checkbox" <%=(Settings.moviesShowQuality? "checked='checked'":"")%>>
			<label class="settings-label" for="cb1"><%= i18n.__("Show movie quality on list") %></label>
			<br><br>
			<div class="dropdown movies-quality">
				<p><%= i18n.__("Only list movies in") %>:</p>
				<select name="movies_quality">
					<option <%=(Settings.movies_quality == "all"? "selected='selected'":"") %> value="all"><%= i18n.__("All") %></option>
					<option <%=(Settings.movies_quality == "1080p"? "selected='selected'":"") %> value="1080p">1080p</option>
					<option <%=(Settings.movies_quality == "720p"? "selected='selected'":"") %> value="720p">720p</option>
				</select>
				<div class="dropdown-arrow"></div>	
			</div>
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

		<div class="trakt-options">
			<%= i18n.__("Enter your Trakt.tv details here to automatically 'scrobble' episodes you watch in Popcorn Time") %>
			<br><br>
			<p><%= i18n.__("Username") + ":" %></p> <input type="text" size = "50" name="traktUsername" value="<%=Settings.traktUsername%>">
			<br><br>
			<p><%= i18n.__("Password") + ":" %></p> <input type="password" size = "50" name="traktPassword" value="<%=Settings.traktPassword === '' ? '' : 'password'%>"> 
			<br><br>
			<%= i18n.__("Popcorn Time will store an encrypted hash of your password in your local database") %>
			<br><br>
			<div class = "btns">
				<div class="btn-settings test-trakt-login" style="margin-top: -10px"><%= i18n.__("Test Login") %></div>
			</div>
			<br><br>
		</div>

		<div class="more-options">
			<p><%= i18n.__("TV Show API Endpoint") + ":" %></p> <input type="text" size = "50" name="tvshowApiEndpoint" value="<%=Settings.tvshowApiEndpoint%>">
		</div>
		<div class="advanced-settings">
			<p><%= i18n.__("Connection Limit") + ":" %></p> <input type="text" size = "20" name="connectionLimit" value="<%=Settings.connectionLimit%>"/>
			<br><br>

			<p><%= i18n.__("DHT Limit") + ":" %></p> <input type="text" size = "20" name="dhtLimit" value="<%=Settings.dhtLimit%>"/>
			<br><br>

			<p><%= i18n.__("Port to stream on") + ":" %></p> <input type="text" size = "20" name="streamPort" value="<%=Settings.streamPort%>"/> <%= i18n.__("0 = Random") %>
			<br><br>

			<!-- Cache Directory -->
			<p><%= i18n.__("Cache Directory") %>: </p>
			<input type="text" placeholder="<%= i18n.__("Cache Directory") %>" id="faketmpLocation" value="<%= Settings.tmpLocation %>" readonly="readonly" size="75" />
			<input type="file" name="tmpLocation" id="tmpLocation" nwdirectory style="display: none;" nwworkingdir="<%= Settings.tmpLocation %>" />
			<br><br>
			<!-- Cache Directory / -->
			
			<input class="settings-checkbox" name="deleteTmpOnClose" id="cb2" type="checkbox" <%=(Settings.deleteTmpOnClose? "checked='checked'":"")%>>

			<label class="settings-label" for="cb2"><%= i18n.__("Clear Tmp Folder after closing app?") %></label>
		</div>
		<div class="btns">
			<div class="btn-settings flush-bookmarks"><%= i18n.__("Flush bookmarks database") %></div>
			<div class="btn-settings flush-subtitles"><%= i18n.__("Flush subtitles cache") %></div>
			<div class="btn-settings flush-databases"><%= i18n.__("Flush all databases") %></div>
			<div class="btn-settings default-settings"><%= i18n.__("Reset to Default Settings") %></div>
		</div>
	</div>
</div>