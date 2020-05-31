<div class="settings-container">
    <div class="fa fa-times close-icon"></div>
    <div class="success_alert" style="display:none"><%= i18n.__("Saved") %>&nbsp;<span id="checkmark-notify"><div id="stem-notify"></div><div id="kick-notify"></div></span></div>

    <section id="title">
        <div class="title"><%= i18n.__("Settings") %></div>
        <div class="content">
            <span>
                <i class="fa fa-keyboard-o keyboard tooltipped" data-toggle="tooltip" data-placement="bottom" title="<%= i18n.__("Keyboard Shortcuts") %>"></i>
                <i class="fa fa-question-circle help tooltipped" data-toggle="tooltip" data-placement="bottom" title="<%= i18n.__("Help Section") %>"></i>
                <input id="show-advanced-settings" class="settings-checkbox" name="showAdvancedSettings" type="checkbox" <%=(Settings.showAdvancedSettings? "checked":"")%>>
                <label class="settings-label" for="show-advanced-settings"><%= i18n.__("Show advanced settings") %></label>
            </span>
        </div>
    </section>

    <section id="apiserver" class="advanced">
        <div class="title"><%= i18n.__("Server") %></div>
        <div class="content">
            <span>
                <div class="opensubtitles-options">
                    <p><%= i18n.__("Custom API Server") %></p>
                    <input type="text" size="100" id="apiServer" name="apiServer" value="<%= Settings.apiServer %>"
                           placeholder="http(s)://server.com/ (support .onion and .i2p urls)">
                    <div class="loading-spinner" style="display: none"></div>
                    <div class="valid-tick" style="display: none"></div>
                    <div class="invalid-cross" style="display: none"></div>
                </div>
            </span>
            <span>
                <div class="opensubtitles-options">
                    <p><%= i18n.__("Proxy Server") %></p>
                    <input type="text" size="50" id="proxyServer" name="proxyServer" value="<%= Settings.proxyServer %>"
                           placeholder="host:port (127.0.0.1:9050 or 127.0.0.1:4447)">
                    <div class="loading-spinner" style="display: none"></div>
                    <div class="valid-tick" style="display: none"></div>
                    <div class="invalid-cross" style="display: none"></div>
                </div>
            </span>
        </div>
    </section>

    <section id="user-interface">
        <div class="title"><%= i18n.__("User Interface") %></div>
        <div class="content">
            <span>
                <div class="dropdown subtitles-language">
                    <p><%= i18n.__("Default Language") %></p>
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
            </span>

            <span>
                <div class="dropdown pct-theme">
                    <p><%= i18n.__("Theme") %></p>
                    <%
                        var themes = "";
                        var theme_files = fs.readdirSync('./src/app/themes/');
                        for (var i in theme_files) {
                            if (theme_files[i].indexOf('_theme') > -1) {
                                themes += "<option " + (Settings.theme == theme_files[i].slice(0, -4)? "selected='selected'" : "") + " value='" + theme_files[i].slice(0, -4) + "'>" +
                                theme_files[i].slice(0, -10).split('_').join(' '); + "</option>";
                            }
                            if (theme_files[i] === 'third_party') {
                                var third_party_files = fs.readdirSync('./src/app/themes/third_party');
                                for (var k in third_party_files) {
                                    if (third_party_files[k].indexOf('_theme') > -1) {
                                        themes += "<option " + (Settings.theme == 'third_party\/' + third_party_files[k].slice(0, -4)? "selected='selected'" : "") + " value='" + 'third_party\/' + third_party_files[k].slice(0, -4) + "'>" +
                                        third_party_files[k].slice(0, -10).split('_').join(' '); + "</option>";
                                    }
                                }
                            }
                        }
                    %>
                    <select name="theme"><%=themes%></select>
                    <div class="dropdown-arrow"></div>
                </div>
            </span>

            <span class="advanced">
                <div class="dropdown start-screen">
                    <p><%= i18n.__("Start Screen") %></p>
                        <%
                            var arr_screens = ["Movies","TV Series","Anime","Indie","Favorites", "Watchlist", "Last Open"];

                            var selct_start_screen = "";
                            for(var key in arr_screens) {
                                selct_start_screen += "<option "+(Settings.start_screen == arr_screens[key]? "selected='selected'":"")+" value='"+arr_screens[key]+"'>"+i18n.__(arr_screens[key])+"</option>";
                            }
                        %>
                    <select name="start_screen"><%=selct_start_screen%></select>
                    <div class="dropdown-arrow"></div>
                </div>
            </span>

            <span class="advanced">
                <input class="settings-checkbox" name="translateSynopsis" id="translateSynopsis" type="checkbox" <%=(Settings.translateSynopsis? "checked='checked'":"")%>>
                <label class="settings-label" for="translateSynopsis"><%= i18n.__("Translate Synopsis") %></label>
            </span>
            <span class="advanced">
                <input class="settings-checkbox" name="coversShowRating" id="coversShowRating" type="checkbox" <%=(Settings.coversShowRating? "checked='checked'":"")%>>
                <label class="settings-label" for="coversShowRating"><%= i18n.__("Show rating over covers") %></label>
            </span>
            <span class="advanced">
                <input class="settings-checkbox" name="alwaysOnTop" id="alwaysOnTop" type="checkbox" <%=(Settings.alwaysOnTop? "checked='checked'":"")%>>
                <label class="settings-label" for="alwaysOnTop"><%= i18n.__("Always On Top") %></label>
            </span>

            <span class="advanced">
                <input class="settings-checkbox" name="animeTabDisable" id="animeTabDisable" type="checkbox" <%=(Settings.animeTabDisable ? "checked='checked'":"")%>>
                <label class="settings-label" for="animeTabDisable"><%= i18n.__("Disable Anime Tab") %></label>
            </span>
            <span class="advanced">
                <input class="settings-checkbox" name="indieTabDisable" id="indieTabDisable" type="checkbox" <%=(Settings.indieTabDisable ? "checked='checked'":"")%>>
                <label class="settings-label" for="indieTabDisable"><%= i18n.__("Disable Indie Tab") %></label>
            </span>

            <span class="advanced">
                <input class="settings-checkbox" name="rememberFilters" id="rememberFilters" type="checkbox" <%=(Settings.rememberFilters? "checked='checked'":"")%>>
                <label class="settings-label" for="rememberFilters"><%= i18n.__("Remember Filters") %></label>
            </span>

            <span class="advanced">
                <div class="dropdown watchedCovers">
                    <p><%= i18n.__("Watched Items") %></p>
                        <%
                            var watch_type = {
                                "none": "Show",
                                "fade": "Fade",
                                "hide": "Hide"
                            };

                            var select_watched_cover = "";
                            for(var key in watch_type) {
                                select_watched_cover += "<option "+(Settings.watchedCovers == key? "selected='selected'":"")+" value='"+key+"'>"+i18n.__(watch_type[key])+"</option>";
                            }
                        %>
                    <select name="watchedCovers"><%=select_watched_cover%></select>
                    <div class="dropdown-arrow"></div>
                </div>
            </span>

        </div>
    </section>

    <section id="subtitles">
        <div class="title"><%= i18n.__("Subtitles") %></div>
        <div class="content">
            <span>
                <div class="dropdown subtitles-language-default">
                    <p><%= i18n.__("Default Subtitle") %></p>
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
            </span>

            <span class="advanced">
                <div class="dropdown subtitles-font">
                    <p><%= i18n.__("Font") %></p>
                    <%
                        var arr_fonts = [
                            {name:"AljazeeraMedExtOf", id:"aljazeera"},
                            {name:"Deja Vu Sans", id:"dejavusans"},
                            {name:"Droid Sans", id:"droidsans"},
                            {name:"Comic Sans MS", id:"comic"},
                            {name:"Georgia", id:"georgia"},
                            {name:"Geneva", id:"geneva"},
                            {name:"Helvetica", id:"helvetica"},
                            {name:"Khalid Art", id:"khalid"},
                            {name:"Lato", id:"lato"},
                            {name:"Montserrat", id:"montserrat"},
                            {name:"OpenDyslexic", id:"opendyslexic"},
                            {name:"Open Sans", id:"opensans"},
                            {name:"PT Sans",id:"pts"},
                            {name:"Tahoma", id:"tahoma"},
                            {name:"Trebuchet MS", id:"trebuc"},
                            {name:"Roboto",id:"roboto"},
                            {name:"Ubuntu", id:"ubuntu"},
                            {name:"Verdana", id:"verdana"},
                        ];

                        var font_folder = path.resolve({
                            win32:  "/Windows/fonts",
                            darwin: "/Library/Fonts",
                            linux:  "/usr/share/fonts"
                        }[process.platform]);

                        var files = [];
                        var recursive = function (dir) {
                            if (fs.statSync(dir).isDirectory()) {
                                fs.readdirSync(dir).forEach(function (name) {
                                    var newdir = path.join(dir, name);
                                    recursive(newdir);
                                });
                            } else {
                                files.push(dir);
                            }
                        };
                        try {
                            recursive(font_folder);
                        } catch (e) {}
                        var avail_fonts = ["Arial"];

                        for (var i in arr_fonts) {
                            for (var key in files) {
                                var found = files[key].toLowerCase();
                                var toFind = arr_fonts[i].id;
                                if (found.indexOf(toFind) != -1) {
                                    avail_fonts.push(arr_fonts[i].name);
                                    break;
                                }
                            }
                        }

                        var sub_fonts = "";
                        for (var key in avail_fonts) {
                            sub_fonts += "<option "+(Settings.subtitle_font == avail_fonts[key]+",Arial"? "selected='selected'":"")+" value='"+avail_fonts[key]+",Arial'>"+avail_fonts[key]+"</option>";
                        }
                    %>
                    <select name="subtitle_font"><%=sub_fonts%></select>
                    <div class="dropdown-arrow"></div>
                </div>
            </span>

            <span class="advanced">
                <div class="dropdown subtitles-decoration">
                    <p><%= i18n.__("Decoration") %></p>
                    <%
                        var arr_deco = ["None", "Outline", "Opaque Background", "See-through Background"];

                        var sub_deco = "";
                        for(var key in arr_deco) {
                            sub_deco += "<option "+(Settings.subtitle_decoration == arr_deco[key]? "selected='selected'":"")+" value='"+arr_deco[key]+"'>"+i18n.__(arr_deco[key])+"</option>";
                        }
                    %>
                    <select name="subtitle_decoration"><%=sub_deco%></select>
                    <div class="dropdown-arrow"></div>
                </div>
            </span>

            <span>
                <div class="dropdown subtitles-size">
                    <p><%= i18n.__("Size") %></p>
                    <%
                        var arr_sizes = ["20px","22px","24px","26px","28px","30px","32px","34px","36px","38px","40px","42px","44px","46px","48px","50px","52px","54px","56px","58px","60px"];

                        var sub_sizes = "";
                        for(var key in arr_sizes) {
                            sub_sizes += "<option "+(Settings.subtitle_size == arr_sizes[key]? "selected='selected'":"")+" value='"+arr_sizes[key]+"'>"+arr_sizes[key]+"</option>";
                        }
                    %>
                    <select name="subtitle_size"><%=sub_sizes%></select>
                    <div class="dropdown-arrow"></div>
                </div>
            </span>

            <span class="advanced">
                <div class="subtitles-custom">
                    <p><%= i18n.__("Color") %></p>
                    <input class="colorsub" id="subtitles_color" type="color" size="7" name="subtitle_color" value="<%=Settings.subtitle_color%>" list="subs_colors">
                        <datalist id="subs_colors">
                            <option>#ffffff</option>
                            <option>#ffff00</option>
                            <option>#ff0000</option>
                            <option>#ff00ff</option>
                            <option>#00ffff</option>
                            <option>#00ff00</option>
                        </datalist>
                </div>
            </span>
            <span class="advanced">
                <input class="settings-checkbox" name="subtitles_bold" id="subsbold" type="checkbox" <%=(Settings.subtitles_bold? "checked='checked'":"")%>>
                <label class="settings-label" for="subsbold"><%= i18n.__("Bold") %></label>
            </span>

        </div>
    </section>

    <section id="quality" class="advanced">
        <div class="title"><%= i18n.__("Quality") %></div>
        <div class="content">
            <span>
                <div class="dropdown movies-quality">
                    <p><%= i18n.__("Only list movies in") %></p>
                    <select name="movies_quality">
                        <option <%=(Settings.movies_quality == "all"? "selected='selected'":"") %> value="all"><%= i18n.__("All") %></option>
                        <option <%=(Settings.movies_quality == "1080p"? "selected='selected'":"") %> value="1080p">1080p</option>
                        <option <%=(Settings.movies_quality == "720p"? "selected='selected'":"") %> value="720p">720p</option>
                    </select>
                    <div class="dropdown-arrow"></div>
                </div>
            </span>
            <span>
                <input class="settings-checkbox" name="moviesShowQuality" id="moviesShowQuality" type="checkbox" <%=(Settings.moviesShowQuality? "checked='checked'":"")%>>
                <label class="settings-label" for="moviesShowQuality"><%= i18n.__("Show movie quality on list") %></label>
            </span>
        </div>
    </section>
    <section id="playback">
        <div class="title"><%= i18n.__("Playback") %></div>
        <div class="content">
            <span class="advanced">
                <input class="settings-checkbox" name="alwaysFullscreen" id="alwaysFullscreen" type="checkbox" <%=(Settings.alwaysFullscreen? "checked='checked'":"")%>>
                <label class="settings-label" for="alwaysFullscreen"><%= i18n.__("Always start playing in fullscreen") %></label>
            </span>
            <span>
                <input class="settings-checkbox" name="playNextEpisodeAuto" id="playNextEpisodeAuto" type="checkbox" <%=(Settings.playNextEpisodeAuto? "checked='checked'":"")%>>
                <label class="settings-label" for="playNextEpisodeAuto"><%= i18n.__("Play next episode automatically") %></label>
            </span>

        </div>
    </section>

    <% if(App.Trakt) { %>
    <section id="trakt-tv">
        <div class="title">Trakt.tv</div>
        <div class="content">
            <div class="trakt-options<%= App.Trakt.authenticated ? " authenticated" : "" %>">
                <% if(App.Trakt.authenticated) { %>
                    <span>
                        <%= i18n.__("You are currently connected to %s", "Trakt.tv") %>.
                        <a id="unauthTrakt" class="unauthtext" href="#"><%= i18n.__("Disconnect account") %></a>
                    </span>
                    <span>
                        <input class="settings-checkbox" name="traktSyncOnStart" id="traktSyncOnStart" type="checkbox" <%=(Settings.traktSyncOnStart? "checked='checked'":"")%>>
                        <label class="settings-label" for="traktSyncOnStart"><%= i18n.__("Automatically Sync on Start") %></label>
                    </span>
                    <span>
                        <input class="settings-checkbox" name="traktPlayback" id="traktPlayback" type="checkbox" <%=(Settings.traktPlayback? "checked='checked'":"")%>>
                        <label class="settings-label" for="traktPlayback"><%= i18n.__("Resume Playback") %></label>
                    </span>
                    <span class="advanced">
                        <div class="btn-settings syncTrakt" id="syncTrakt">
                            <i class="fa fa-refresh">&nbsp;&nbsp;</i>
                            <%= i18n.__("Sync With Trakt") %>
                        </div>
                    </span>
                <% } else { %>
                    <span>
                        <%= i18n.__("Connect to %s to automatically 'scrobble' episodes you watch in %s", "Trakt.tv", Settings.projectName) %>
                    </span>
                    <span>
                        <div class="btn-settings syncTrakt" id="authTrakt">
                            <i class="fa fa-user">&nbsp;&nbsp;</i>
                            <%= i18n.__("Connect To %s", "Trakt") %>
                        </div>
                        <div id="authTraktCode" style="display:none">
                            <%= i18n.__("Code:")%>
                            <input type="text" size="20" readonly/>
                        </div>
                    </span>
                <% } %>
            </div>
        </div>
    </section>
    <% } %>

    <% if(App.TVShowTime) { %>
	<section id="tvshowtime">
		<div class="title">TVShow Time</div>
		<div class="content">
			<div class="tvshowtime-options <%= App.TVShowTime.authenticated ? " authenticated" : "" %>">
				<% if(App.TVShowTime.authenticated) { %>
                    <span>
                        <%= i18n.__("You are currently connected to %s", "TVShow Time") %>.
                        <a id="disconnect-tvst" class="unauthtext" href="#"><%= i18n.__("Disconnect account") %></a>
                    </span>
				<% } else { %>
                    <span>
                        <div class="btn-settings" id="connect-with-tvst">
                            <i class="fa fa-user">&nbsp;&nbsp;</i>
                            <%= i18n.__("Connect To %s", "TVShow Time") %>
                        </div>
                        <div class="tvst-loading-spinner" style="display: none"></div>
                    </span>
				<% } %>
			</div>
		</div>
	</section>
    <% } %>

    <section id="opensubtitles">
        <div class="title">OpenSubtitles</div>
        <div class="content">
            <div class="opensubtitles-options">
                <% if(Settings.opensubtitlesAuthenticated) { %>
                    <span>
                        <%= i18n.__("You are currently connected to %s", "OpenSubtitles") %>.
                        <a id="unauthOpensubtitles" class="unauthtext" href="#"><%= i18n.__("Disconnect account") %></a>
                    </span>
                <% } else { %>
					<span>
						<p><%= i18n.__("Username") %></p>
						<input type="text" size="50" id="opensubtitlesUsername" name="opensubtitlesUsername">
                        <div class="loading-spinner" style="display: none"></div>
                        <div class="valid-tick" style="display: none"></div>
                        <div class="invalid-cross" style="display: none"></div>
					</span>
					<span>
						<p><%= i18n.__("Password") %></p>
						<input type="password" size="50" id="opensubtitlesPassword" name="opensubtitlesPassword">
					</span>
                    <div class="btns database">
                        <div class="btn-settings database" id="authOpensubtitles">
                            <i class="fa fa-user">&nbsp;&nbsp;</i>
                            <%= i18n.__("Connect To %s", "OpenSubtitles") %>
                        </div>
                        <a class="btn-settings database links" href="https://www.opensubtitles.org/newuser" role="button">
                            <i class="fa fa-user-plus">&nbsp;&nbsp;</i><%= i18n.__("Create account") %>
                        </a>
                    </div>                    
					<span>
						<em><%= i18n.__("* %s stores an encrypted hash of your password in your local database", Settings.projectName) %></em>
					</span>
                <% } %>
                <span class="advanced">
                    <input class="settings-checkbox" name="opensubtitlesAutoUpload" id="opensubtitlesAutoUpload" type="checkbox" <%=(Settings.opensubtitlesAutoUpload? "checked='checked'":"")%>>
                    <label class="settings-label" for="opensubtitlesAutoUpload"><%= i18n.__("Automatic Subtitle Uploading") %></label>
                </span>
            </div>
        </div>
    </section>

    <section id="features">
        <div class="title"><%= i18n.__("Features") %></div>
        <div class="content">
            <span>
                <input class="settings-checkbox" name="activateTorrentCollection" id="activateTorrentCollection" type="checkbox" <%=(Settings.activateTorrentCollection? "checked='checked'":"")%>>
                <label class="settings-label" for="activateTorrentCollection"><%= i18n.__("Torrent Collection") %></label>
            </span>
            <span>
                <input class="settings-checkbox" name="activateWatchlist" id="activateWatchlist" type="checkbox" <%=(Settings.activateWatchlist? "checked='checked'":"")%>>
                <label class="settings-label" for="activateWatchlist"><%= i18n.__("Watchlist") %></label>
            </span>
            <span>
                <input class="settings-checkbox" name="activateRandomize" id="activateRandomize" type="checkbox" <%=(Settings.activateRandomize? "checked='checked'":"")%>>
                <label class="settings-label" for="activateRandomize"><%= i18n.__("Randomize Button for Movies") %></label>
            </span>
        </div>
    </section>

    <section id="remote-control" class="advanced">
        <div class="title"><%= i18n.__("Remote Control") %></div>
        <div class="content">
            <span>
                <input class="settings-checkbox" name="httpApiEnabled" id="httpApiEnabled" type="checkbox" <%=(Settings.httpApiEnabled ? "checked='checked'":"")%>>
                <label class="settings-label" for="httpApiEnabled"><%= i18n.__("Enable remote control") %></label>
            </span>
            <span>
                <p><%= i18n.__("Local IP Address") %></p>
                <input type="text" id="settingsIpAddr" value="<%= Settings.ipAddress %>" readonly="readonly" size="20" />
            </span>
            <span>
                <p><%= i18n.__("HTTP API Port") %></p>
                <input id="httpApiPort" type="number" size="5" name="httpApiPort" value="<%=Settings.httpApiPort%>">
            </span>
            <span>
                <p><%= i18n.__("HTTP API Username") %></p>
                <input id="httpApiUsername" type="text" size="50" name="httpApiUsername" value="<%=Settings.httpApiUsername%>">
            </span>
            <span>
                <p><%= i18n.__("HTTP API Password") %></p>
                <input id="httpApiPassword" type="text" size="50" name="httpApiPassword" value="<%=Settings.httpApiPassword%>">
            </span>
            <div class="btns advanced database">
                <div class="btn-settings database qr-code">
                    <i class="fa fa-qrcode">&nbsp;&nbsp;</i>
                    <%= i18n.__("Generate Pairing QR code") %>
                </div>
            </div>
            <div id="qrcode-overlay"></div>
            <div id="qrcode-modal">
                <span class="fa-stack fa-1x" id="qrcode-close">
                    <i class="fa fa-circle-thin fa-stack-2x" style="margin-top: -2px;"></i>
                    <i class="fa fa-times fa-stack-1x" style="margin-top: -2px;"></i>
                </span>
                <canvas id="qrcode" width="200" height="200"></canvas>
            </div><!-- /.modal -->
        </div>
    </section>

    <section id="connection" class="advanced">
        <div class="title"><%= i18n.__("Connection") %></div>
        <div class="content">
            <% if(Settings.tvshow) { %>
            <span>
                <p><%= i18n.__("TV Show API Endpoint") %></p>
                    <input id="tvshow" type="text" size="50" name="tvshow" value="<%=Settings.tvshow[0].url%>">
                    <% if (Settings.tvshow.length <= 1) { %>
                    &nbsp;&nbsp;<i class="reset-tvshow fa fa-undo tooltipped" data-toggle="tooltip" data-placement="auto" title="<%= i18n.__('Reset to Default Settings') %>"></i>
                    <% } %>
            </span>
            <% } %>
            <span>
                <p><%= i18n.__("Connection Limit") %></p>
                <input id="connectionLimit" type="text" size="20" name="connectionLimit" value="<%=Settings.connectionLimit%>"/>
            </span>
            <span>
                <p><%= i18n.__("Port to stream on") %></p>
                <input id="streamPort" type="text" size="20" name="streamPort" value="<%=Settings.streamPort%>"/>&nbsp;&nbsp;<em><%= i18n.__("0 = Random") %></em>
            </span>
            <span id="overallRatio">
                <p><%= i18n.__("Overall Ratio") %></p>
                <% var overallRatio = function () {
                    var ratio = (Settings.totalUploaded / Settings.totalDownloaded).toFixed(2);
                    isNaN(ratio) ? ratio = i18n.__("None") : ratio;
                    return ratio;
                   }
                %>
                <input type="text" size="20" name="overallRatio" value="<%= overallRatio() %>">&nbsp;&nbsp;<em><%= Common.fileSize(Settings.totalDownloaded) %><i class="fa fa-arrow-circle-down"></i><%= Common.fileSize(Settings.totalUploaded) %><i class="fa fa-arrow-circle-up"></i></em>
            </span>
            <span>
                <input class="settings-checkbox" name="vpnEnabled" id="vpnEnabled" type="checkbox" <%=(Settings.vpnEnabled? "checked='checked'":"")%>>
                <label class="settings-label" for="vpnEnabled"><%= i18n.__("Enable VPN") %></label>
            </span>

        </div>
    </section>

    <section id="cache" class="advanced">
        <div class="title"><%= i18n.__("Cache Directory") %></div>
        <div class="content">
            <span>
                <p><%= i18n.__("Cache Directory") %></p>
                <input type="text" placeholder="<%= i18n.__("Cache Directory") %>" id="faketmpLocation" value="<%= Settings.tmpLocation %>" readonly="readonly" size="65" />
                <i class="open-tmp-folder fa fa-folder-open-o tooltipped" data-toggle="tooltip" data-placement="auto" title="<%= i18n.__("Open Cache Directory") %>"></i>
                <input type="file" name="tmpLocation" id="tmpLocation" nwdirectory style="display: none;" nwworkingdir="<%= Settings.tmpLocation %>" />
            </span>
            <span>
                <input class="settings-checkbox" name="deleteTmpOnClose" id="deleteTmpOnClose" type="checkbox" <%=(Settings.deleteTmpOnClose? "checked='checked'":"")%>>
                <label class="settings-label" for="deleteTmpOnClose"><%= i18n.__("Clear Tmp Folder after closing app?") %></label>
            </span>
            <span>
                <input class="settings-checkbox" name="continueSeedingOnStart" id="continueSeedingOnStart" type="checkbox" <%=(Settings.continueSeedingOnStart? "checked='checked'":"")%>>
                <label class="settings-label" for="continueSeedingOnStart"><%= i18n.__("Continue seeding torrents after restart app?") %></label>
            </span>
            <span>
                <p><%= i18n.__("Maximum number of active torrents") %></p>
                <input id="maxActiveTorrents" type="number" name="maxActiveTorrents" value="<%=Settings.maxActiveTorrents%>"/>
            </span>
        </div>
    </section>

    <section id="database" class="advanced">
        <div class="title"><%= i18n.__("Database") %></div>
        <div class="content">
            <span>
                <p><%= i18n.__("Database Directory") %></p>
                <input type="text" placeholder="<%= i18n.__("Database Directory") %>" id="fakedatabaseLocation" value="<%= Settings.databaseLocation %>" readonly="readonly" size="65" />
                <i class="open-database-folder fa fa-folder-open-o tooltipped" data-toggle="tooltip" data-placement="auto" title="<%= i18n.__("Open Database Directory") %>"></i>
                <input type="file" name="fakedatabaseLocation" id="fakedatabaseLocation" nwdirectory style="display: none;" nwworkingdir="<%= Settings.databaseLocation %>" />
            </span>
            <div class="btns advanced database import-database">
              <div class="btn-settings database">
                <label class="import-database" for="importdatabase"  title="<%= i18n.__("Open File to Import") %>"><%= i18n.__("Import Database") %></label>
                <i class="fa fa-level-down">&nbsp;&nbsp;</i>
                <input type="file" id="importdatabase"  accept=".zip" style="display:none">
              </div>
              <div class="btn-settings database export-database">
                <label class="export-database" for="exportdatabase" title="<%= i18n.__("Browse Directoy to save to") %>" ><%= i18n.__("Export Database") %></label>
                <i class="fa fa-level-up">&nbsp;&nbsp;</i>
                <input type="file" id="exportdatabase" style="display:none" nwdirectory>
                        </div>

            </div>
        </div>
    </section>
    <section id="miscellaneous" class="advanced">
        <div class="title"><%= i18n.__("Miscellaneous") %></div>
        <div class="content">
            <span >
                <div class="dropdown tv_detail_jump_to">
                    <p><%= i18n.__("When Opening TV Series Detail Jump To") %></p>
                        <%
                            var tv_detail_jump_to = {
                                "firstUnwatched": "First Unwatched Episode",
                                "next": "Next Episode In Series"
                            };

                            var selected_tv_detail_jump = "";
                            for(var key in tv_detail_jump_to) {
                                selected_tv_detail_jump += "<option "+(Settings.tv_detail_jump_to == key? "selected='selected'":"")+" value='"+key+"'>"+i18n.__(tv_detail_jump_to[key])+"</option>";
                            }
                        %>
                    <select name="tv_detail_jump_to"><%=selected_tv_detail_jump%></select>
                    <div class="dropdown-arrow"></div>
                </div>
            </span>
            <span>
                <input class="settings-checkbox" name="automaticUpdating" id="automaticUpdating" type="checkbox" <%=(Settings.automaticUpdating? "checked='checked'":"")%>>
                <label class="settings-label" for="automaticUpdating"><%= i18n.__("Activate automatic updating") %></label>
            </span>
            <span>
                <input class="settings-checkbox" name="UpdateSeed" id="UpdateSeed" type="checkbox" <%=(Settings.UpdateSeed? "checked='checked'":"")%>>
                <label class="settings-label" for="UpdateSeed"><%= i18n.__("Activate Update seeding") %></label>
            </span>
            <span>
                <input class="settings-checkbox" name="events" id="events" type="checkbox" <%=(Settings.events? "checked='checked'":"")%>>
                <label class="settings-label" for="events"><%= i18n.__("Celebrate various events") %></label>
            </span>
            <span>
                <input class="settings-checkbox" name="minimizeToTray" id="minimizeToTray" type="checkbox" <%=(Settings.minimizeToTray? "checked='checked'":"")%>>
                <label class="settings-label" for="minimizeToTray"><%= i18n.__("Minimize to Tray") %></label>
            </span>
            <span>
                <input class="settings-checkbox" name="bigPicture" id="bigPicture" type="checkbox" <%=(Settings.bigPicture? "checked='checked'":"")%>>
                <label class="settings-label" for="bigPicture"><%= i18n.__("Big Picture Mode") %></label>
            </span>
        </div>
    </section>
    <div class="btns">
        <div class="btn-settings flush-bookmarks advanced"><%= i18n.__("Flush bookmarks database") %></div>
        <div class="btn-settings flush-subtitles advanced"><%= i18n.__("Flush subtitles cache") %></div>
        <div class="btn-settings flush-databases"><%= i18n.__("Flush all databases") %></div>
        <div class="btn-settings default-settings"><%= i18n.__("Reset to Default Settings") %></div>
    </div>

</div>
