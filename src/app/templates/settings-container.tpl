<div class="settings-container">
    <div class="fa fa-times close-icon"></div>
    <div class="success_alert" style="display:none"><%= i18n.__("Saved") %>&nbsp;<span id="checkmark-notify"><div id="stem-notify"></div><div id="kick-notify"></div></span></div>

    <section id="title">
        <div class="title"><%= i18n.__("Settings") %></div>
        <div class="content">
            <span>
                <i class="far fa-keyboard keyboard tooltipped" data-toggle="tooltip" data-placement="bottom" title="<%= i18n.__("Keyboard Shortcuts") %>"></i>
                <i class="fa fa-info-circle about tooltipped" data-toggle="tooltip" data-placement="bottom" title="<%= i18n.__("About") %>"></i>
                <i class="fa fa-question-circle help tooltipped" data-toggle="tooltip" data-placement="bottom" title="<%= i18n.__("FAQ") %>"></i>
            </span>
        </div>
    </section>

    <section id="user-interface">
        <div class="title"><%= i18n.__("User Interface") %></div>
        <div class="content">
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
            <span>
                <div class="dropdown start-screen">
                    <p><%= i18n.__("Start Screen") %></p>
                        <%
                            var arr_screens = [];
                            Settings.moviesTabEnable ? arr_screens.push("Movies") : null;
                            Settings.seriesTabEnable ? arr_screens.push("TV Series") : null;
                            Settings.animeTabEnable ? arr_screens.push("Anime") : null;
                            Settings.favoritesTabEnable ? arr_screens.push("Favorites") : null;
                            Settings.watchedTabEnable ? arr_screens.push("Watched") : null;
                            Settings.activateWatchlist && App.Trakt.authenticated ? arr_screens.push("Watchlist") : null;
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
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <input class="settings-checkbox" name="favoritesTabEnable" id="favoritesTabEnable" type="checkbox" <%=(Settings.favoritesTabEnable? "checked='checked'":"")%>>
                <label class="settings-label" for="favoritesTabEnable"><%= i18n.__("Favorites") %></label>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                <input class="settings-checkbox" name="watchedTabEnable" id="watchedTabEnable" type="checkbox" <%=(Settings.watchedTabEnable? "checked='checked'":"")%>>
                <label class="settings-label" for="watchedTabEnable"><%= i18n.__("Watched") %></label>
            </span>
            <span>
                <input class="settings-checkbox" name="coversShowRating" id="coversShowRating" type="checkbox" <%=(Settings.coversShowRating? "checked='checked'":"")%>>
                <label class="settings-label" for="coversShowRating"><%= i18n.__("Show rating over covers") %></label>
            </span>
            <span>
                <input class="settings-checkbox" name="alwaysShowBookmarks" id="alwaysShowBookmarks" type="checkbox" <%=(Settings.alwaysShowBookmarks? "checked='checked'":"")%>>
                <label class="settings-label" for="alwaysShowBookmarks"><%= i18n.__("Always show bookmark over covers") %></label>
            </span>
            <% if (Settings.activateSeedbox) { %>
            <span>
                <input class="settings-checkbox" name="showSeedboxOnDlInit" id="showSeedboxOnDlInit" type="checkbox" <%=(Settings.showSeedboxOnDlInit? "checked='checked'":"")%>>
                <label class="settings-label" for="showSeedboxOnDlInit"><%= i18n.__("Show the Seedbox when a new download is added") %></label>
            </span>
            <% } %>
            <span>
                <input class="settings-checkbox" name="expandedSearch" id="expandedSearch" type="checkbox" <%=(Settings.expandedSearch? "checked='checked'":"")%>>
                <label class="settings-label" for="expandedSearch"><%= i18n.__("Search field always expanded") %></label>
            </span>
            <span>
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
                    <% if (Settings.defaultFilters === 'custom' || Settings.defaultFilters === 'remember') { %><i class="reset-current-filter fa fa-rotate-right tooltipped" data-toggle="tooltip" data-placement="auto" title="<%= i18n.__("Reset Filters") %>"></i><i style="padding-right:80px">&nbsp;</i><% } %>
                </div>
            </span>
            <span>
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
            <span>
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
            <span>
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
            <span>
                <p><%= i18n.__("UI Scaling") %></p>
                <input id="bigPicture" type="text" size="5" name="bigPicture" value="<%=Settings.bigPicture%>%" autocomplete="off"/>&nbsp;&nbsp;&nbsp;<em><%= i18n.__("25% - 400%") %></em>
            </span>
            <span>
                <div class="dropdown UITransparency">
                    <p><%= i18n.__("UI Transparency") %></p>
                    <label><%= i18n.__("Movies") %></label>
                        <%
                            var transpm_type = {"1": "Disabled", "0.90": "Very Low", "0.75": "Low", "0.65": "Medium", "0.55": "High", "0.40": "Very High"};
                            var transpm_sizes = "";
                            for(var key in transpm_type) {
                                transpm_sizes += "<option "+(Settings.moviesUITransparency == key? "selected='selected'":"")+" value='"+key+"'>"+i18n.__(transpm_type[key])+"</option>";
                            }
                        %>
                    <select name="moviesUITransparency"><%=transpm_sizes%></select>
                    <div class="dropdown-arrow"></div>
                    <label><%= i18n.__("Series") %></label>
                        <%
                            var transps_type = {"": "Disabled", "vlow": "Very Low", "low": "Low", "medium": "Medium", "high": "High", "vhigh": "Very High"};
                            var transps_sizes = "";
                            for(var key in transps_type) {
                                transps_sizes += "<option "+(Settings.seriesUITransparency == key? "selected='selected'":"")+" value='"+key+"'>"+i18n.__(transps_type[key])+"</option>";
                            }
                        %>
                    <select name="seriesUITransparency"><%=transps_sizes%></select>
                    <div class="dropdown-arrow"></div>
                </div>
            </span>
            <span>
                <input class="settings-checkbox" name="nativeWindowFrame" id="nativeWindowFrame" type="checkbox" <%=(Settings.nativeWindowFrame? "checked='checked'":"")%>>
                <label class="settings-label" for="nativeWindowFrame"><%= i18n.__("Native window frame") %></label>
            </span>
            <span>
                <input class="settings-checkbox" name="alwaysOnTop" id="alwaysOnTop" type="checkbox" <%=(Settings.alwaysOnTop? "checked='checked'":"")%>>
                <label class="settings-label" for="alwaysOnTop"><%= i18n.__("Always On Top") %></label>
            </span>
            <span>
                <input class="settings-checkbox" name="minimizeToTray" id="minimizeToTray" type="checkbox" <%=(Settings.minimizeToTray? "checked='checked'":"")%>>
                <label class="settings-label" for="minimizeToTray"><%= i18n.__("Minimize to Tray") %></label>
            </span>
            <span>
                <input class="settings-checkbox" name="events" id="events" type="checkbox" <%=(Settings.events? "checked='checked'":"")%>>
                <label class="settings-label" for="events"><%= i18n.__("Celebrate various events") %></label>
            </span>
        </div>
    </section>

    <section id="localisation">
        <div class="title"><%= i18n.__("Language") %></div>
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
                <div class="dropdown subtitles-language">
                    <p><%= i18n.__("Default Content Language") %></p>
                    <%
                        var langs = "<option "+(Settings.contentLanguage == ""? "selected='selected'":"")+" value=''>"+i18n.__("Same as Default Language")+"</option>";
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
                <input class="settings-checkbox" name="contentLangOnly" id="contentLangOnly" type="checkbox" <%=(Settings.contentLangOnly? "checked='checked'":"")%>>
                <label class="settings-label" for="contentLangOnly" id="contentLangOnly"><%= i18n.__("Only show content available in this language") %> </label>
            </span>
            <span>
                <div class="dropdown translateTitle">
                    <p><%= i18n.__("Title translation") %></p>
                    <select name="translateTitle">
                        <option <%=(Settings.translateTitle == "origin"? "selected='selected'":"") %> value="origin"><%= i18n.__("Original only") %></option>
                        <option <%=(Settings.translateTitle == "origin-translated"? "selected='selected'":"") %> value="origin-translated"><%= i18n.__("Original - Translated") %></option>
                        <option <%=(Settings.translateTitle == "translated-origin"? "selected='selected'":"") %> value="translated-origin"><%= i18n.__("Translated - Original") %></option>
                        <option <%=(Settings.translateTitle == "translated"? "selected='selected'":"") %> value="translated"><%= i18n.__("Translated only") %></option>
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
            <div class="opensubtitles-options">
                <% if (Settings.opensubtitlesAuthenticated) { %>
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
                    <span>
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
                    <span>
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
                    <span>
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
                    <span>
                        <input class="settings-checkbox" name="subtitles_bold" id="subsbold" type="checkbox" <%=(Settings.subtitles_bold? "checked='checked'":"")%>>
                        <label class="settings-label" for="subsbold"><%= i18n.__("Bold") %></label>
                    </span>
                    <span>
                        <input class="settings-checkbox" name="multipleExtSubtitles" id="multipleExtSubtitles" type="checkbox" <%=(Settings.multipleExtSubtitles? "checked='checked'":"")%>>
                        <label class="settings-label" for="multipleExtSubtitles"><%= i18n.__("Show all available subtitles for default language in flag menu") %></label>
                    </span>
                    <span>
                        <em>* <%= i18n.__("You are currently connected to %s", "OpenSubtitles.org") %>.
                        <a id="unauthOpensubtitles" class="unauthtext" href="#"><%= i18n.__("Disconnect account") %></a></em>
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
                        <input type="password" size="50" id="opensubtitlesPassword" name="opensubtitlesPassword" placeholder="* <%= i18n.__('Stored in local database as encrypted MD5 hash') %>"><br>
                    </span>
                    <span>
                        <em>* <a class="syncOpensubtitles" id="authOpensubtitles" href="#"><%= i18n.__("Connect to %s", "OpenSubtitles.org") %></a>
                        <%= i18n.__("to automatically fetch subtitles for movies and episodes you watch in %s", Settings.projectName) %>&nbsp;&nbsp;
                        (<a class="createOpensubtitles" href="#"><%= i18n.__("Create an account") %></a>)</em>
                    </span>
                <% } %>
            </div>
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
                <% if (Settings.playNextEpisodeAuto) { %>
                &nbsp;&nbsp;&nbsp;<input id="preloadNextEpisodeTime" type="number" min="0" max="99999" name="preloadNextEpisodeTime" value="<%=Settings.preloadNextEpisodeTime%>" autocomplete="off"/>&nbsp;&nbsp;&nbsp;<em><%= i18n.__("minute(s) remaining before preloading next episode") %>,&nbsp;&nbsp;&nbsp;<%= i18n.__("0 = Disable preloading") %></em>
                <% } %>
            </span>
            <span>
                <input class="settings-checkbox" name="audioPassthrough" id="audioPassthrough" type="checkbox" <%=(Settings.audioPassthrough? "checked='checked'":"")%>>
                <label class="settings-label" for="audioPassthrough"><%= i18n.__("Allow Audio Passthrough") %></label>
            </span>
        </div>
    </section>

    <section id="features">
        <div class="title"><%= i18n.__("Features") %></div>
        <div class="content">
            <span>
                <input class="settings-checkbox" name="activateWatchlist" id="activateWatchlist" type="checkbox" <%=(Settings.activateWatchlist && App.Trakt.authenticated? "checked='checked'":"")%>>
                <label class="settings-label" for="activateWatchlist"><%= i18n.__("Watchlist") %></label>
                <div class="trakt-options<%= App.Trakt.authenticated ? " authenticated" : "" %>">
                    <% if (App.Trakt.authenticated) { %>
                        <span>
                            <em>* <%= i18n.__("You are currently connected to %s", "Trakt.tv") %>.&nbsp;&nbsp;
                            <a id="unauthTrakt" class="unauthtext" href="#"><%= i18n.__("Disconnect account") %></a>&nbsp;|
                            <a id="syncTrakt" class="syncTrakt" href="#"><%= i18n.__("Sync now") %></a></em>
                        </span>
                    <% } else { %>
                        <span id="authTraktSp">
                            <em>* <a class="syncTrakt" id="authTrakt" href="#"><%= i18n.__("Connect to %s", "Trakt.tv") %></a>
                            <%= i18n.__("to automatically 'scrobble' episodes you watch in %s", Settings.projectName) %></em>
                        </span>
                        </span>
                            <div id="authTraktCode" style="display:none;">
                                <%= i18n.__("Code:")%>
                                <input type="text" size="20" readonly/>
                                <i class="fa fa-times closeTraktCode"></i>
                            </div>
                        </span>
                    <% } %>
                </div>
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

    <section id="remote-control">
        <div class="title"><%= i18n.__("Remote Control") %></div>
        <div class="content">
            <span>
                <input class="settings-checkbox" name="httpApiEnabled" id="httpApiEnabled" type="checkbox" <%=(Settings.httpApiEnabled ? "checked='checked'":"")%>>
                <label class="settings-label" for="httpApiEnabled"><%= i18n.__("Enable remote control") %></label>
                <% if (Settings.httpApiEnabled) { %>
                <i class="fa fa-qrcode qr-code tooltipped" title="<%= i18n.__('Generate Pairing QR code') %>"></i>
                <% } %>
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
            <div id="qrcode-overlay" class="modal-overlay"></div>
            <div id="qrcode-modal" class="modal-content">
                <span class="modal-close fa-stack fa-1x" id="qrcode-close">
                    <i class="fa fa-circle-thin fa-stack-2x" style="margin-top: -2px;"></i>
                    <i class="fa fa-times fa-stack-1x" style="margin-top: -2px;"></i>
                </span>
                <canvas id="qrcode" width="200" height="200"></canvas>
            </div>
            <% } %>
        </div>
    </section>

    <section id="apiserver">
        <div class="title"><%= i18n.__("API Server(s)") %></div>
        <div class="content">
            <span>
                <div class="opensubtitles-options">
                    <p><%= i18n.__("Movies API Server(s)") %></p>
                    <input type="text" size="61" id="customMoviesServer" name="customMoviesServer" list="moviesServers" value="<%= encodeURI(Settings.customMoviesServer ? Settings.customMoviesServer : (Settings.dhtEnable && Settings.dhtInfo ? Settings.dhtInfo.server : Settings.providers.movie.uri[0].split('=')[1])) %>">
                    <datalist id="moviesServers">
                        <% var movieServList = [Settings.providers.movie.uri[0].split('=')[1]];
                           Settings.customServers && Settings.customServers.movie ? movieServList = movieServList.concat(Settings.customServers.movie) : null;
                           Settings.dhtInfo ? movieServList = movieServList.concat([Settings.dhtInfo.server]) : null;
                           for (var i = 0; i < movieServList.length; ++i) {
                        %>
                        <option value="<%= encodeURI(movieServList[i]).replace(/%20/g, ' ') %>">
                        <% } %>
                    </datalist>
                </div>
            </span>
            <span>
                <div class="opensubtitles-options">
                    <p><%= i18n.__("Series API Server(s)") %></p>
                    <input type="text" size="61" id="customSeriesServer" name="customSeriesServer" list="seriesServers" value="<%= encodeURI(Settings.customSeriesServer ? Settings.customSeriesServer : (Settings.dhtEnable && Settings.dhtInfo ? Settings.dhtInfo.server : Settings.providers.tvshow.uri[0].split('=')[1])) %>">
                    <datalist id="seriesServers">
                        <% var seriesServList = [Settings.providers.tvshow.uri[0].split('=')[1]];
                           Settings.customServers && Settings.customServers.tvshow ? seriesServList = seriesServList.concat(Settings.customServers.tvshow) : null;
                           Settings.dhtInfo ? seriesServList = seriesServList.concat([Settings.dhtInfo.server]) : null;
                           for (var i = 0; i < seriesServList.length; ++i) {
                        %>
                        <option value="<%= encodeURI(seriesServList[i]).replace(/%20/g, ' ') %>">
                        <% } %>
                    </datalist>
                </div>
            </span>
            <span>
                <div class="opensubtitles-options">
                    <p><%= i18n.__("Anime API Server(s)") %></p>
                    <input type="text" size="61" id="customAnimeServer" name="customAnimeServer" list="animeServers" value="<%= encodeURI(Settings.customAnimeServer ? Settings.customAnimeServer : (Settings.dhtEnable && Settings.dhtInfo ? Settings.dhtInfo.server : Settings.providers.anime.uri[0].split('=')[1])) %>">
                    <datalist id="animeServers">
                        <% var animeServList = [Settings.providers.anime.uri[0].split('=')[1]];
                           Settings.customServers && Settings.customServers.anime ? animeServList = animeServList.concat(Settings.customServers.anime) : null;
                           Settings.dhtInfo ? animeServList = animeServList.concat([Settings.dhtInfo.server]) : null;
                           for (var i = 0; i < animeServList.length; ++i) {
                        %>
                        <option value="<%= encodeURI(animeServList[i]).replace(/%20/g, ' ') %>">
                        <% } %>
                    </datalist>
                </div>
            </span>
            <span id="apiserver_info">
                <em>* <%= i18n.__("You can add multiple API Servers separated with a , from which it will select randomly (*for load balancing) until it finds the first available") %></em>
            </span>
            <span>
                <input class="settings-checkbox" name="dhtEnable" id="dhtEnable" type="checkbox" <%=(Settings.dhtEnable? "checked='checked'":"")%>>
                <label class="settings-label" for="dhtEnable"><%= i18n.__("Automatically update the API Server URLs") %></label>
                <i class="update-dht fa fa-rotate tooltipped" data-toggle="tooltip" data-placement="auto" title="<%= i18n.__("Check for updates") %>"></i>
            </span>
        </div>
    </section>

    <section id="connection">
        <div class="title"><%= i18n.__("Connection") %></div>
        <div class="content">
            <% if (Settings.activateSeedbox) { %>
            <span>
                <p><%= i18n.__("Active Torrents Limit") %></p>
                <input id="maxActiveTorrents" type="number" name="maxActiveTorrents" value="<%=Settings.maxActiveTorrents%>" autocomplete="off"/>
            </span>
            <% } %>
            <span>
                <p><%= i18n.__("Connection Limit") %></p>
                <input id="connectionLimit" type="number" name="connectionLimit" value="<%=Settings.connectionLimit%>" autocomplete="off"/>
            </span>
            <span>
                <p><%= i18n.__("DHT UDP Requests Limit") %></p>
                <input id="maxUdpReqLimit" type="number" name="maxUdpReqLimit" value="<%=Settings.maxUdpReqLimit%>" autocomplete="off"/>
            </span>
            <span>
                <p><%= i18n.__("Max. Down / Up Speed") %></p>
                <input id="downloadLimit" type="number" min="0" max="9999999" name="downloadLimit" placeholder="Unlimited" value="<%=Settings.downloadLimit%>" autocomplete="off"/>
                <input id="uploadLimit" type="number" min="0" max="9999999" name="uploadLimit" placeholder="Unlimited" value="<%=Settings.uploadLimit%>" autocomplete="off"/>&nbsp;&nbsp;
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
                <input id="streamPort" type="number" name="streamPort" value="<%=Settings.streamPort%>"/>&nbsp;&nbsp;&nbsp;<em><%= i18n.__("0 = Random") %></em>
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
                <div class="opensubtitles-options">
                    <p><%= i18n.__("Proxy Server") %></p>
                    <input type="text" size="50" id="proxyServer" name="proxyServer" value="<%= encodeURI(Settings.proxyServer) %>" placeholder="host:port (127.0.0.1:9050 or 127.0.0.1:4447)">
                    <div class="loading-spinner" style="display: none"></div>
                    <div class="valid-tick" style="display: none"></div>
                    <div class="invalid-cross" style="display: none"></div>
                </div>
            </span>
        </div>
    </section>

    <section id="cache">
        <div class="title"><%= i18n.__("Cache") %></div>
        <div class="content">
            <span>
                <p><%= i18n.__("Cache Directory") %></p>
                <input type="text" placeholder="<%= i18n.__("Cache Directory") %>" id="faketmpLocation" value="<%= Settings.tmpLocation %>" readonly="readonly" size="61" />
                <i class="open-tmp-folder fa fa-box-archive tooltipped" data-toggle="tooltip" data-placement="auto" title="<%= i18n.__("Open Cache Directory") %>"></i>
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
                <input type="text" placeholder="<%= i18n.__("Downloads Directory") %>" id="fakedownloadsLocation" value="<%= Settings.downloadsLocation %>" readonly="readonly" size="61" />
                <i class="open-downloads-folder fa fa-box-archive tooltipped" data-toggle="tooltip" data-placement="auto" title="<%= i18n.__("Open Downloads Directory") %>"></i>
                <input type="file" name="downloadsLocation" id="downloadsLocation" nwdirectory style="display: none;" nwworkingdir="<%= Settings.downloadsLocation %>" />
            </span>
            <% } %>
        </div>
    </section>

    <section id="database">
        <div class="title"><%= i18n.__("Database") %></div>
        <div class="content">
            <span>
                <p><%= i18n.__("Database Directory") %></p>
                <input type="text" placeholder="<%= i18n.__("Database Directory") %>" id="fakedatabaseLocation" value="<%= Settings.databaseLocation %>" readonly="readonly" size="61" />
                <label><i class="fa fa-down-long database import-db tooltipped" title="<%= i18n.__("Import Database") %>"></i></label>
                <label for="exportdatabase"><i class="fa fa-up-long database export-database tooltipped" title="<%= i18n.__("Export Database") %>"></i></label>
                <input type="file" id="exportdatabase" style="display:none" nwdirectory>
                <i class="open-database-folder fa fa-database tooltipped" data-toggle="tooltip" data-placement="auto" title="<%= i18n.__("Open Database Directory") %>"></i>
                <input type="file" name="fakedatabaseLocation" id="fakedatabaseLocation" nwdirectory style="display: none;" nwworkingdir="<%= Settings.databaseLocation %>" />
            </span>
            <div class="btns database import-database">
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
                        <input class="settings-checkbox" name="import-torcol" id="import-torcol" type="checkbox" checked='checked'>
                        <label class="settings-label" for="import-torcol"><%= i18n.__("Saved Torrents") %></label>
                    </span>
                    <span>
                        <input class="settings-checkbox" name="import-settings" id="import-settings" type="checkbox" checked='checked'>
                        <label class="settings-label" for="import-settings"><%= i18n.__("Settings") %></label>
                    </span>
                    <div class="btn-settings btn-block database">
                        <label class="import-database" for="importdatabase"  title="<%= i18n.__("Open File to Import") %>"><%= i18n.__("Import Database") %>&nbsp;</label>
                        <i class="fa fa-down-long">&nbsp;</i>
                        <input type="file" id="importdatabase" accept=".zip" style="display:none">
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section id="miscellaneous">
        <div class="title"><%= i18n.__("Updates") %></div>
        <div class="content">
            <span>
                <input class="settings-checkbox" name="updateNotification" id="updateNotification" type="checkbox" <%=(Settings.updateNotification? "checked='checked'":"")%>>
                <label class="settings-label" for="updateNotification"><%= i18n.__("Show a notification when a new version is available") %></label>
                <i class="update-app fa fa-rotate tooltipped" data-toggle="tooltip" data-placement="auto" title="<%= i18n.__("Check for updates") %>"></i>
            </span>
        </div>
    </section>

    <div class="btns">
        <div class="btn-settings rebuild-bookmarks">&nbsp;<i class="fa fa-wrench">&nbsp;&nbsp;&nbsp;</i><%= i18n.__("Rebuild bookmarks database") %>&nbsp;</div>
        <div class="btn-settings flush-bookmarks">&nbsp;<i class="fa fa-trash">&nbsp;&nbsp;&nbsp;</i><%= i18n.__("Flush bookmarks database") %>&nbsp;</div>
        <div class="btn-settings flush-watched">&nbsp;<i class="fa fa-trash">&nbsp;&nbsp;&nbsp;</i><%= i18n.__("Flush watched database") %>&nbsp;</div>
        <div class="btn-settings default-settings">&nbsp;<i class="fa fa-rotate-right">&nbsp;&nbsp;&nbsp;</i><%= i18n.__("Reset to Default Settings") %>&nbsp;</div>
        <div class="btn-settings flush-databases">&nbsp;<i class="fa fa-rotate-right">&nbsp;&nbsp;&nbsp;</i><%= i18n.__("Reset all") %>&nbsp;&nbsp;</div>
    </div>

</div>
