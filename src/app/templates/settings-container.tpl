<div class="settings-container">
    <div class="fa fa-times close-icon"></div>
    <div class="success_alert" style="display:none"><%= i18n.__("Saved") %>&nbsp;<span id="checkmark-notify"><div id="stem-notify"></div><div id="kick-notify"></div></span></div>

    <section id="title">
        <div class="title"><%= i18n.__("Settings") %></div>
        <div class="content">
            <span>
                <i class="far fa-keyboard keyboard tooltipped" data-toggle="tooltip" data-placement="bottom" title="<%= i18n.__("Keyboard Shortcuts") %>"></i>
                <i class="fa fa-question-circle help tooltipped" data-toggle="tooltip" data-placement="bottom" title="<%= i18n.__("Help Section") %>"></i>
                <input id="show-advanced-settings" class="settings-checkbox" name="showAdvancedSettings" type="checkbox" <%=(Settings.showAdvancedSettings? "checked":"")%>>
                <label class="settings-label" for="show-advanced-settings"><%= i18n.__("Show advanced settings") %></label>
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
                                langs += "<option "+(Settings.language == key? "selected='selected'":"")+" value='"+key+"'>"+ App.Localization.langcodes[key].nativeName+"</option>";
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
                            var arr_screens = [];
                            Settings.moviesTabEnable ? arr_screens.push("Movies") : null;
                            Settings.seriesTabEnable ? arr_screens.push("TV Series") : null;
                            Settings.animeTabEnable ? arr_screens.push("Anime") : null;
                            arr_screens.push("Favorites");
                            Settings.activateWatchlist ? arr_screens.push("Watchlist") : null;
                            Settings.activateTorrentCollection ? arr_screens.push("Torrent-collection") : null;
                            Settings.activateSeedbox ? arr_screens.push("Seedbox") : null;
                            arr_screens.push("Last Open");
                            var selct_start_screen = "";
                            for(var key in arr_screens) {
                                selct_start_screen += "<option "+(Settings.start_screen == arr_screens[key]? "selected='selected'":"")+" value='"+arr_screens[key]+"'>"+i18n.__(arr_screens[key].replace("Torrent-collection", "Torrent Collection"))+"</option>";
                            }
                        %>
                    <select name="start_screen"><%=selct_start_screen%></select>
                    <div class="dropdown-arrow"></div>
                </div>
            </span>
            <span>
                <p><%= i18n.__("Tabs") %></p>
                &nbsp;&nbsp;
                <input class="settings-checkbox" name="moviesTabEnable" id="moviesTabEnable" type="checkbox" <%=(Settings.moviesTabEnable? "checked='checked'":"")%>>
                <label class="settings-label" for="moviesTabEnable"><%= i18n.__("Movies") %></label>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <input class="settings-checkbox" name="seriesTabEnable" id="seriesTabEnable" type="checkbox" <%=(Settings.seriesTabEnable? "checked='checked'":"")%>>
                <label class="settings-label" for="seriesTabEnable"><%= i18n.__("Series") %></label>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <input class="settings-checkbox" name="animeTabEnable" id="animeTabEnable" type="checkbox" <%=(Settings.animeTabEnable? "checked='checked'":"")%>>
                <label class="settings-label" for="animeTabEnable"><%= i18n.__("Anime") %></label>
            </span>
            <span class="advanced">
                <input class="settings-checkbox" name="coversShowRating" id="coversShowRating" type="checkbox" <%=(Settings.coversShowRating? "checked='checked'":"")%>>
                <label class="settings-label" for="coversShowRating"><%= i18n.__("Show rating over covers") %></label>
            </span>
            <span class="advanced">
                <input class="settings-checkbox" name="moviesShowQuality" id="moviesShowQuality" type="checkbox" <%=(Settings.moviesShowQuality? "checked='checked'":"")%>>
                <label class="settings-label" for="moviesShowQuality"><%= i18n.__("Show movie quality on list") %></label>
            </span>
            <% if (Settings.activateTorrentCollection) { %>
            <span class="advanced">
                <input class="settings-checkbox" name="torColSearchMore" id="torColSearchMore" type="checkbox" <%=(Settings.torColSearchMore? "checked='checked'":"")%>>
                <label class="settings-label" for="torColSearchMore"><%= i18n.__("Show 'Search on Torrent Collection' in search") %></label>
            </span>
            <% } %>
            <% if (Settings.activateSeedbox) { %>
            <span class="advanced">
                <input class="settings-checkbox" name="showSeedboxOnDlInit" id="showSeedboxOnDlInit" type="checkbox" <%=(Settings.showSeedboxOnDlInit? "checked='checked'":"")%>>
                <label class="settings-label" for="showSeedboxOnDlInit"><%= i18n.__("Show the Seedbox when adding a new download") %></label>
            </span>
            <% } %>
            <span class="advanced">
                <div class="dropdown defaultFilters">
                    <p><%= i18n.__("Default Filters") %></p>
                        <%
                            var filter_type = {
                                "default": "Default",
                                "custom": "Custom",
                                "remember": "Remember"
                            };
                            var select_default_filter = "";
                            for(var key in filter_type) {
                                select_default_filter += "<option "+(Settings.defaultFilters == key? "selected='selected'":"")+" value='"+key+"'>"+i18n.__(filter_type[key])+"</option>";
                            }
                        %>
                    <select name="defaultFilters"><%=select_default_filter%></select>
                    <div class="dropdown-arrow"></div>&nbsp;
                    <% if (Settings.defaultFilters === 'custom') { %>&nbsp;<i class="set-current-filter fa fa-pen tooltipped" data-toggle="tooltip" data-placement="auto" title="<%= i18n.__("Set Filters") %>"></i><% } %>
                    <% if (Settings.defaultFilters === 'custom' || Settings.defaultFilters === 'remember') { %><i class="reset-current-filter fa fa-redo tooltipped" data-toggle="tooltip" data-placement="auto" title="<%= i18n.__("Reset Filters") %>"></i><i style="padding-right:80px">&nbsp;</i><% } %>
                </div>
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
            <span class="advanced">
                <div class="dropdown tv_detail_jump_to">
                    <p><%= i18n.__("Series detail opens to") %></p>
                        <%
                            var tv_detail_jump_to = {
                                "next": "Next episode",
                                "firstUnwatched": "First unwatched episode"
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
            <span class="advanced">
                <div class="dropdown poster_size">
                   <p><%= i18n.__("Poster Size") %></p>
                        <%
                            var pos_type = {"134": "100%", "154": "113%", "174": "125%", "194": "138%", "214": "150%", "234": "163%", "254": "175%", "274": "188%", "294": "200%"};
                            var pos_sizes = "";
                            for(var key in pos_type) {
                                pos_sizes += "<option "+(Settings.postersWidth == key? "selected='selected'":"")+" value='"+key+"'>"+i18n.__(pos_type[key])+"</option>";
                            }
                        %>
                    <select name="poster_size"><%=pos_sizes%></select>
                    <div class="dropdown-arrow"></div>
                </div>
            </span>
            <span class="advanced">
                <p><%= i18n.__("UI Scaling") %></p>
                <input id="bigPicture" type="text" size="5" name="bigPicture" value="<%=Settings.bigPicture%>%" autocomplete="off"/>&nbsp;&nbsp;&nbsp;<em><%= i18n.__("25% - 400%") %></em>
            </span>
            <span class="advanced">
                <input class="settings-checkbox" name="nativeWindowFrame" id="nativeWindowFrame" type="checkbox" <%=(Settings.nativeWindowFrame? "checked='checked'":"")%>>
                <label class="settings-label" for="nativeWindowFrame"><%= i18n.__("Native window frame") %></label>
            </span>
            <span class="advanced">
                <input class="settings-checkbox" name="alwaysOnTop" id="alwaysOnTop" type="checkbox" <%=(Settings.alwaysOnTop? "checked='checked'":"")%>>
                <label class="settings-label" for="alwaysOnTop"><%= i18n.__("Always On Top") %></label>
            </span>
            <span class="advanced">
                <input class="settings-checkbox" name="minimizeToTray" id="minimizeToTray" type="checkbox" <%=(Settings.minimizeToTray? "checked='checked'":"")%>>
                <label class="settings-label" for="minimizeToTray"><%= i18n.__("Minimize to Tray") %></label>
            </span>
        </div>
    </section>

    <section id="localisation">
        <div class="title"><%= i18n.__("Localisation") %></div>
        <div class="content">
            <span>
                <div class="dropdown subtitles-language">
                    <p><%= i18n.__("Preferred Content Language") %></p>
                    <%
                        var langs = "<option "+(Settings.contentLanguage == ""? "selected='selected'":"")+" value=''>"+i18n.__("Same as interface")+"</option>";
                        for(var key in App.Localization.allTranslations) {
                            key = App.Localization.allTranslations[key];
                            if (App.Localization.langcodes[key] !== undefined) {
                                langs += "<option "+(Settings.contentLanguage == key? "selected='selected'":"")+" value='"+key+"'>"+ App.Localization.langcodes[key].nativeName+"</option>";
                            }
                        }
                    %>
                    <select name="contentLanguage"><%=langs%></select>
                    <div class="dropdown-arrow"></div>
                </div>
            </span>
            <span>
                <input class="settings-checkbox" name="contentLangOnly" id="contentLangOnly" type="checkbox" <%=(Settings.contentLangOnly? "checked='checked'":"")%>>
                <label class="settings-label" for="contentLangOnly" id="contentLangOnly"><%= i18n.__("Only show content available in the preferred language") %> </label>
            </span>
            <span>
                <div class="dropdown translateTitle">
                    <p><%= i18n.__("Title translation") %></p>
                    <select name="translateTitle">
                        <option <%=(Settings.translateTitle == "translated-origin"? "selected='selected'":"") %> value="translated-origin"><%= i18n.__("Translated - Original") %></option>
                        <option <%=(Settings.translateTitle == "origin-translated"? "selected='selected'":"") %> value="origin-translated"><%= i18n.__("Original - Translated") %></option>
                        <option <%=(Settings.translateTitle == "translated"? "selected='selected'":"") %> value="translated"><%= i18n.__("Translated only") %></option>
                        <option <%=(Settings.translateTitle == "origin"? "selected='selected'":"") %> value="origin"><%= i18n.__("Original only") %></option>
                    </select>
                    <div class="dropdown-arrow"></div>
                </div>
            </span>
            <span>
                <input class="settings-checkbox" name="translateEpisodes" id="translateEpisodes" type="checkbox" <%=(Settings.translateEpisodes? "checked='checked'":"")%>>
                <label class="settings-label" for="translateEpisodes"><%= i18n.__("Translate Episode Titles") %></label>
            </span>
            <span>
                <input class="settings-checkbox" name="translateSynopsis" id="translateSynopsis" type="checkbox" <%=(Settings.translateSynopsis? "checked='checked'":"")%>>
                <label class="settings-label" for="translateSynopsis"><%= i18n.__("Translate Synopsis") %></label>
            </span>
            <span>
                <input class="settings-checkbox" name="translatePosters" id="translatePosters" type="checkbox" <%=(Settings.translatePosters? "checked='checked'":"")%>>
                <label class="settings-label" for="translatePosters"><%= i18n.__("Translate Posters") %></label>
            </span>
            <span id="translation_info">
                <em>* <%= i18n.__("Translations depend on availability. Some options also might not be supported by all API servers") %></em>
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
                                sub_langs += "<option "+(Settings.subtitle_language == key? "selected='selected'":"")+" value='"+key+"'>"+ App.Localization.langcodes[key].nativeName+"</option>";
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
            <span>
                <input class="settings-checkbox" name="multipleExtSubtitles" id="multipleExtSubtitles" type="checkbox" <%=(Settings.multipleExtSubtitles? "checked='checked'":"")%>>
                <label class="settings-label" for="multipleExtSubtitles"><%= i18n.__("Show all available subtitles for default language in flag menu") %></label>
            </span>
        </div>
    </section>

    <section id="playback">
        <div class="title"><%= i18n.__("Playback") %></div>
        <div class="content">
            <span>
                <input class="settings-checkbox" name="alwaysFullscreen" id="alwaysFullscreen" type="checkbox" <%=(Settings.alwaysFullscreen? "checked='checked'":"")%>>
                <label class="settings-label" for="alwaysFullscreen"><%= i18n.__("Always start playing in fullscreen") %></label>
            </span>
            <span>
                <input class="settings-checkbox" name="playNextEpisodeAuto" id="playNextEpisodeAuto" type="checkbox" <%=(Settings.playNextEpisodeAuto? "checked='checked'":"")%>>
                <label class="settings-label" for="playNextEpisodeAuto"><%= i18n.__("Play next episode automatically") %></label>
            </span>
        </div>
    </section>

    <% if (App.Trakt) { %>
    <section id="trakt-tv">
        <div class="title">Trakt.tv</div>
        <div class="content">
            <div class="trakt-options<%= App.Trakt.authenticated ? " authenticated" : "" %>">
                <% if (App.Trakt.authenticated) { %>
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
                            <i class="fa fa-sync">&nbsp;&nbsp;</i>
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

    <section id="opensubtitles">
        <div class="title">OpenSubtitles</div>
        <div class="content">
            <div class="opensubtitles-options">
                <% if (Settings.opensubtitlesAuthenticated) { %>
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
                <input class="settings-checkbox" name="activateWatchlist" id="activateWatchlist" type="checkbox" <%=(Settings.activateWatchlist? "checked='checked'":"")%>>
                <label class="settings-label" for="activateWatchlist"><%= i18n.__("Watchlist") %></label>
            </span>
            <span>
                <input class="settings-checkbox" name="activateTorrentCollection" id="activateTorrentCollection" type="checkbox" <%=(Settings.activateTorrentCollection? "checked='checked'":"")%>>
                <label class="settings-label" for="activateTorrentCollection"><%= i18n.__("Torrent Collection") %></label>
            </span>
            <span>
                <input class="settings-checkbox" name="activateSeedbox" id="activateSeedbox" type="checkbox" <%=(Settings.activateSeedbox? "checked='checked'":"")%>>
                <label class="settings-label" for="activateSeedbox"><%= i18n.__("Seedbox") %></label>
            </span>
            <span>
                <input class="settings-checkbox" name="activateTempf" id="activateTempf" type="checkbox" <%=(Settings.activateTempf? "checked='checked'":"")%>>
                <label class="settings-label" for="activateTempf"><%= i18n.__("Cache Folder Button") %></label>
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
<% if (Settings.httpApiEnabled) { %>
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
                <input id="httpApiUsername" type="text" name="httpApiUsername" value="<%=Settings.httpApiUsername%>">
            </span>
            <span>
                <p><%= i18n.__("HTTP API Password") %></p>
                <input id="httpApiPassword" type="text" name="httpApiPassword" value="<%=Settings.httpApiPassword%>">
            </span>
            <div class="btns advanced database">
                <div class="btn-settings database qr-code">
                    <i class="fa fa-qrcode">&nbsp;&nbsp;</i>
                    <%= i18n.__("Generate Pairing QR code") %>
                </div>
            </div>
            <div id="qrcode-overlay" class="modal-overlay"></div>
            <div id="qrcode-modal" class="modal-content">
                <span class="modal-close fa-stack fa-1x" id="qrcode-close">
                    <i class="fa fa-circle-thin fa-stack-2x" style="margin-top: -2px;"></i>
                    <i class="fa fa-times fa-stack-1x" style="margin-top: -2px;"></i>
                </span>
                <canvas id="qrcode" width="200" height="200"></canvas>
            </div><!-- /.modal -->
<% } %>
        </div>
    </section>

    <section id="apiserver">
        <div class="title"><%= i18n.__("API Server(s)") %></div>
        <div class="content">
            <span>
                <div class="opensubtitles-options">
                    <p><%= i18n.__("Movies API Server") %></p>
                    <input type="text" size="50" id="customMoviesServer" name="customMoviesServer" list="moviesServers" value="<%= Settings.customMoviesServer %>" placeholder="<%= Settings.providers.movie.uri[0].split('apiURL=').pop().split('/,')[0] %>&nbsp;&nbsp;(default)">
                    <datalist id="moviesServers">
                        <% if (Settings.customServers && Settings.customServers.movie) {
                            for (var i = 0; i < Settings.customServers.movie.length; ++i) {
                        %>
                        <option value="<%= Settings.customServers.movie[i] %>">
                        <% }} %>
                    </datalist>
                    <div class="loading-spinner" style="display: none"></div>
                    <div class="valid-tick" style="display: none"></div>
                    <div class="invalid-cross" style="display: none"></div>
                </div>
            </span>
            <span>
                <div class="opensubtitles-options">
                    <p><%= i18n.__("Series API Server") %></p>
                    <input type="text" size="50" id="customSeriesServer" name="customSeriesServer" list="seriesServers" value="<%= Settings.customSeriesServer %>" placeholder="<%= Settings.providers.tvshow.uri[0].split('apiURL=').pop().split('/,')[0] %>&nbsp;&nbsp;(default)">
                    <datalist id="seriesServers">
                        <% if (Settings.customServers && Settings.customServers.tvshow) {
                            for (var i = 0; i < Settings.customServers.tvshow.length; ++i) {
                        %>
                        <option value="<%= Settings.customServers.tvshow[i] %>">
                        <% }} %>
                    </datalist>
                    <div class="loading-spinner" style="display: none"></div>
                    <div class="valid-tick" style="display: none"></div>
                    <div class="invalid-cross" style="display: none"></div>
                </div>
            </span>
            <span>
                <div class="opensubtitles-options">
                    <p><%= i18n.__("Anime API Server") %></p>
                    <input type="text" size="50" id="customAnimeServer" name="customAnimeServer" list="animeServers" value="<%= Settings.customAnimeServer %>" placeholder="<%= Settings.providers.anime.uri[0].split('apiURL=').pop().split('/,')[0] %>&nbsp;&nbsp;(default)">
                    <datalist id="animeServers">
                        <% if (Settings.customServers && Settings.customServers.anime) {
                            for (var i = 0; i < Settings.customServers.anime.length; ++i) {
                        %>
                        <option value="<%= Settings.customServers.anime[i] %>">
                        <% }} %>
                    </datalist>
                    <div class="loading-spinner" style="display: none"></div>
                    <div class="valid-tick" style="display: none"></div>
                    <div class="invalid-cross" style="display: none"></div>
                </div>
            </span>
        </div>
    </section>

    <section id="connection" class="advanced">
        <div class="title"><%= i18n.__("Connection") %></div>
        <div class="content">
            <% if (Settings.tvshow) { %>
            <span>
                <p><%= i18n.__("TV Show API Endpoint") %></p>
                    <input id="tvshow" type="text" size="50" name="tvshow" value="<%=Settings.tvshow[0].url%>">
                    <% if (Settings.tvshow.length <= 1) { %>
                    &nbsp;&nbsp;<i class="reset-tvshow fa fa-undo tooltipped" data-toggle="tooltip" data-placement="auto" title="<%= i18n.__('Reset to Default Settings') %>"></i>
                    <% } %>
            </span>
            <% } %>
            <% if (Settings.activateSeedbox) { %>
            <span>
                <p><%= i18n.__("Active Torrents Limit") %></p>
                <input id="maxActiveTorrents" type="number" name="maxActiveTorrents" value="<%=Settings.maxActiveTorrents%>" autocomplete="off"/>
            </span>
            <% } %>
            <span>
                <p><%= i18n.__("Connection Limit") %></p>
                <input id="connectionLimit" type="text" size="20" name="connectionLimit" value="<%=Settings.connectionLimit%>" autocomplete="off"/>
            </span>
            <span>
                <p><%= i18n.__("Max. Down / Up Speed") %></p>
                <input id="downloadLimit" type="text" size="7" name="downloadLimit" placeholder="Unlimited" value="<%=Settings.downloadLimit%>" autocomplete="off"/>
                <input id="uploadLimit" type="text" size="7" name="uploadLimit" placeholder="Unlimited" value="<%=Settings.uploadLimit%>" autocomplete="off"/>&nbsp;&nbsp;
                <%
                    var limit_mult = {
                        "1024": "KB/s",
                        "1048576": "MB/s"
                    };
                    var select_default_mult = "";
                    for(var key in limit_mult) {
                        select_default_mult += "<option "+(Settings.maxLimitMult == key? "selected='selected'":"")+" value='"+key+"'>"+i18n.__(limit_mult[key])+"</option>";
                    }
                %>
                <select name="maxLimitMult"><%=select_default_mult%></select>
                <span class="dropdown-arrow"></span>
            </span>
            <span id="overallRatio">
                <p><%= i18n.__("Overall Ratio") %></p>
                <% var overallRatio = function () {
                    var ratio = (Settings.totalUploaded / Settings.totalDownloaded).toFixed(2);
                    isNaN(ratio) ? ratio = i18n.__("None") : ratio;
                    return ratio;
                   }
                %>
                <input type="text" size="20" name="overallRatio" value="<%= overallRatio() %>">&nbsp;&nbsp;&nbsp;<em><%= Common.fileSize(Settings.totalDownloaded) %><i class="fa fa-arrow-circle-down"></i><%= Common.fileSize(Settings.totalUploaded) %><i class="fa fa-arrow-circle-up"></i></em>
            </span>
            <span>
                <p><%= i18n.__("Port to stream on") %></p>
                <input id="streamPort" type="text" size="20" name="streamPort" value="<%=Settings.streamPort%>"/>&nbsp;&nbsp;&nbsp;<em><%= i18n.__("0 = Random") %></em>
            </span>
            <% if (Settings.activateSeedbox && (!Settings.deleteTmpOnClose || Settings.separateDownloadsDir)) { %>
            <span>
                <input class="settings-checkbox" name="continueSeedingOnStart" id="continueSeedingOnStart" type="checkbox" <%=(Settings.continueSeedingOnStart? "checked='checked'":"")%>>
                <label class="settings-label" for="continueSeedingOnStart"><%= i18n.__("Resume seeding after restarting the app?") %></label>
            </span>
            <% } %>
            <span>
                <input class="settings-checkbox" name="protocolEncryption" id="protocolEncryption" type="checkbox" <%=(Settings.protocolEncryption? "checked='checked'":"")%>>
                <label class="settings-label" for="protocolEncryption" id="protocolEnc"><%= i18n.__("Enable Protocol Encryption") %></label>
                <em><i class="fas fa-exclamation-circle">&nbsp;&nbsp;</i><%= i18n.__("Allows connecting to peers that use PE/MSE. Will in most cases increase the number of connectable peers but might also result in increased CPU usage") %></em>
            </span>
            <span>
                <input class="settings-checkbox" name="vpnEnabled" id="vpnEnabled" type="checkbox" <%=(Settings.vpnEnabled? "checked='checked'":"")%>>
                <label class="settings-label" for="vpnEnabled"><%= i18n.__("Enable VPN") %></label>
            </span>
            <span>
                <div class="opensubtitles-options">
                    <p><%= i18n.__("Proxy Server") %></p>
                    <input type="text" size="50" id="proxyServer" name="proxyServer" value="<%= Settings.proxyServer %>" placeholder="host:port (127.0.0.1:9050 or 127.0.0.1:4447)">
                    <div class="loading-spinner" style="display: none"></div>
                    <div class="valid-tick" style="display: none"></div>
                    <div class="invalid-cross" style="display: none"></div>
                </div>
            </span>
        </div>
    </section>

    <section id="cache" class="advanced">
        <div class="title"><%= i18n.__("Cache") %></div>
        <div class="content">
            <span>
                <p><%= i18n.__("Cache Directory") %></p>
                <input type="text" placeholder="<%= i18n.__("Cache Directory") %>" id="faketmpLocation" value="<%= Settings.tmpLocation %>" readonly="readonly" size="65" />
                <i class="open-tmp-folder fa fa-folder-open tooltipped" data-toggle="tooltip" data-placement="auto" title="<%= i18n.__("Open Cache Directory") %>"></i>
                <input type="file" name="tmpLocation" id="tmpLocation" nwdirectory style="display: none;" nwworkingdir="<%= Settings.tmpLocation %>" />
            </span>
            <span>
                <input class="settings-checkbox" name="deleteTmpOnClose" id="deleteTmpOnClose" type="checkbox" <%=(Settings.deleteTmpOnClose? "checked='checked'":"")%>>
                <label class="settings-label" for="deleteTmpOnClose"><%= i18n.__("Clear Cache Folder after closing the app?") %></label>
            </span>
            <% if (Settings.activateSeedbox) { %>
            <span>
                <div class="dropdown del-seedbox-cache">
                    <p><%= i18n.__("Delete related cache when removing from Seedbox") %>&nbsp;&nbsp;</p>
                        <%
                            var arr_del_cache = ['always', 'never', 'ask'];
                            var selct_del_cache = "";
                            for(var key in arr_del_cache) {
                                selct_del_cache += "<option "+(Settings.delSeedboxCache == arr_del_cache[key]? "selected='selected'":"")+" value='"+arr_del_cache[key]+"'>"+i18n.__(arr_del_cache[key].capitalizeEach().replace("Ask", "Ask me every time"))+"</option>";
                            }
                        %>
                    <select name="delSeedboxCache"><%=selct_del_cache%></select>
                    <div class="dropdown-arrow"></div>
                </div>
            </span>
            <span>
                <input class="settings-checkbox" name="separateDownloadsDir" id="separateDownloadsDir" type="checkbox" <%=(Settings.separateDownloadsDir? "checked='checked'":"")%>>
                <label class="settings-label" for="separateDownloadsDir" id="downloadsDir"><%= i18n.__("Separate directory for Downloads") %></label>
                <em><i class="fas fa-exclamation-circle">&nbsp;&nbsp;</i><%= i18n.__("Enabling will prevent the sharing of cache between the Watch Now and Download functions") %></em>
            </span>
            <% } %>
            <% if (Settings.activateSeedbox && Settings.separateDownloadsDir) { %>
            <span>
                <p><%= i18n.__("Downloads Directory") %></p>
                <input type="text" placeholder="<%= i18n.__("Downloads Directory") %>" id="fakedownloadsLocation" value="<%= Settings.downloadsLocation %>" readonly="readonly" size="65" />
                <i class="open-downloads-folder fa fa-folder-open tooltipped" data-toggle="tooltip" data-placement="auto" title="<%= i18n.__("Open Downloads Directory") %>"></i>
                <input type="file" name="downloadsLocation" id="downloadsLocation" nwdirectory style="display: none;" nwworkingdir="<%= Settings.downloadsLocation %>" />
            </span>
            <% } %>
        </div>
    </section>

    <section id="database" class="advanced">
        <div class="title"><%= i18n.__("Database") %></div>
        <div class="content">
            <span>
                <p><%= i18n.__("Database Directory") %></p>
                <input type="text" placeholder="<%= i18n.__("Database Directory") %>" id="fakedatabaseLocation" value="<%= Settings.databaseLocation %>" readonly="readonly" size="65" />
                <i class="open-database-folder fa fa-folder-open tooltipped" data-toggle="tooltip" data-placement="auto" title="<%= i18n.__("Open Database Directory") %>"></i>
                <input type="file" name="fakedatabaseLocation" id="fakedatabaseLocation" nwdirectory style="display: none;" nwworkingdir="<%= Settings.databaseLocation %>" />
            </span>
            <div class="btns advanced database import-database">
                <!-- Button trigger modal -->
                <div class="btn-settings database import-db">
                    <label class="import-database" title="<%= i18n.__("Select data types to import") %>"><%= i18n.__("Import Database") %>&nbsp;</label>
                    <i class="fa fa-level-down-alt">&nbsp;</i>
                </div><!-- / btn -->
                <div id="importdb-overlay" class="modal-overlay"></div>
                <div id="importdb-modal" class="modal-content">
                    <span class="modal-close fa-stack fa-1x" id="importdb-close">
                        <i class="fa fa-circle-thin fa-stack-2x" style="margin-top: -2px;"></i>
                        <i class="fa fa-times fa-stack-1x" style="margin-top: -2px;"></i>
                    </span>
                    <span>
                        <%= i18n.__("Please select which data types you want to import ?") %>
                    </span>
                    <span>
                        <input class="settings-checkbox" name="import-watched" id="import-watched" type="checkbox" checked='checked'>
                        <label class="settings-label" for="import-watched"><%= i18n.__("Watched items") %></label>
                    </span>
                    <span>
                        <input class="settings-checkbox" name="import-bookmarks" id="import-bookmarks" type="checkbox" checked='checked'>
                        <label class="settings-label" for="import-bookmarks"><%= i18n.__("Bookmarked items") %></label>
                    </span>
                    <span>
                        <input class="settings-checkbox" name="import-settings" id="import-settings" type="checkbox" checked='checked'>
                        <label class="settings-label" for="import-settings"><%= i18n.__("Settings") %></label>
                    </span>
                    <div class="btn-settings btn-block database">
                        <label class="import-database" for="importdatabase"  title="<%= i18n.__("Open File to Import") %>"><%= i18n.__("Import Database") %>&nbsp;</label>
                        <i class="fa fa-level-down-alt">&nbsp;</i>
                        <input type="file" id="importdatabase" accept=".zip" style="display:none">
                    </div>
                </div><!-- /.modal -->
                <div class="btn-settings database export-database">
                    <label class="export-database" for="exportdatabase" title="<%= i18n.__("Browse Directory to save to") %>" ><%= i18n.__("Export Database") %>&nbsp;</label>
                    <i class="fa fa-level-up-alt">&nbsp;</i>
                    <input type="file" id="exportdatabase" style="display:none" nwdirectory>
                </div>
            </div>
        </div>
    </section>

    <section id="miscellaneous">
        <div class="title"><%= i18n.__("Miscellaneous") %></div>
        <div class="content">
            <span class="advanced">
                <input class="settings-checkbox" name="events" id="events" type="checkbox" <%=(Settings.events? "checked='checked'":"")%>>
                <label class="settings-label" for="events"><%= i18n.__("Celebrate various events") %></label>
            </span>
            <span>
                <input class="settings-checkbox" name="automaticUpdating" id="automaticUpdating" type="checkbox" <%=(Settings.automaticUpdating? "checked='checked'":"")%>>
                <label class="settings-label" for="automaticUpdating"><%= i18n.__("Activate automatic updating") %></label>
            </span>
            <span class="advanced">
                <input class="settings-checkbox" name="UpdateSeed" id="UpdateSeed" type="checkbox" <%=(Settings.UpdateSeed? "checked='checked'":"")%>>
                <label class="settings-label" for="UpdateSeed"><%= i18n.__("Activate Update seeding") %></label>
            </span>
        </div>
    </section>

    <div class="btns">
        <div class="btn-settings rebuild-bookmarks"><i class="fa fa-redo">&nbsp;&nbsp;</i><%= i18n.__("Rebuild bookmarks database") %></div>
        <div class="btn-settings flush-bookmarks"><i class="fa fa-trash">&nbsp;&nbsp;</i><%= i18n.__("Flush bookmarks database") %></div>
        <div class="btn-settings flush-databases"><i class="fa fa-trash">&nbsp;&nbsp;</i><%= i18n.__("Flush all databases") %></div>
        <div class="btn-settings default-settings"><i class="fa fa-redo">&nbsp;&nbsp;</i><%= i18n.__("Reset to Default Settings") %></div>
    </div>

</div>
