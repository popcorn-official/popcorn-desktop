<div class="dropup">
    <div class="dropdown-toggle lang-dropdown" data-toggle="dropdown" >
        <span class="lang-name"><%= title %></span>
        <div class="selected-lang flag-icon flag none" title="<%= App.Localization.nativeName(selected) %>"></div>
        <div class="caret"></div>
    </div>
    <div class="dropdown-menu" role="menu">
        <div class="flag-container">
            <% for(var lang in values){ %>
                <% if(Settings.multipleExtSubtitles) { %>
                    <% if(lang.indexOf('|')!==-1 && lang.substr(0,2) !== Settings.subtitle_language) continue; %>
                <% } else { %>
                    <% if(lang.indexOf('|')!==-1) continue; %>
                <% } %>
                <% if(lang !== 'none') { %>
                    <div class="flag-icon flag <%= lang.substr(0,2) %> tooltipped" data-toggle="tooltip" data-placement="top" data-lang="<%= lang %>" title="<%= App.Localization.nativeName(lang.substr(0,2)) + ' ' + lang.substr(3) %>"></div>
                <% } else { %>
                    <div class="flag-icon flag <%= lang %> tooltipped" data-toggle="tooltip" data-placement="top" data-lang="<%= lang %>" title="<%= App.Localization.nativeName(lang) %>"></div>
                <% } %>
            <% } %>
        </div>
    </div>
</div>
