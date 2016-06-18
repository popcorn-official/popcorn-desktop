<div class="dropdown-container">
    <div class="dropdown">
        <%= title %>
        <div class="selected-lang flag-icon flag none" title="<%= App.Localization.nativeName(selected) %>"></div>
        <div class="dropdown-arrow"></div>
    </div>
    <div class="flag-container">
        <div class="flag-icon flag none" data-lang="none" title="<%= i18n.__('Disable') %>"></div>
        <% for(var lang in values){ %>
        <div class="flag-icon flag <%= lang %>" data-lang="<%= lang %>" title="<%= App.Localization.nativeName(lang) %>"></div>
        <% } %>
    </div>
</div>
