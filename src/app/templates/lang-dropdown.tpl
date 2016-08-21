<div class="dropdown-container">
    <div class="dropdown-title">
        <%= title %>
        <div class="selected-lang flag-icon flag none" title="<%= App.Localization.nativeName(selected) %>"></div>
        <div class="dropdown-arrow"></div>
    </div>
    <div class="flag-container">
        <% for(var lang in values){ %>
        <div class="flag-icon flag <%= lang %>" data-lang="<%= lang %>" title="<%= App.Localization.nativeName(lang) %>"></div>
        <% } %>
    </div>
</div>
