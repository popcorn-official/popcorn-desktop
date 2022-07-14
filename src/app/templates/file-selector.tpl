<div class="file-selector-container">
    <div class="fa fa-times close-icon"></div>

    <div class="title"><%=i18n.__('Please select a file to play')%></div>
    <div class="content">
        <ul class="file-list">
            <% _.each(files, function(file, index) { 
                    if (file.display !== false) { %>
                <li class="file-item" data-index="<%=file.index%>" data-file="<%=file.path%>">
                    <a><%=file.name %></a>
                    <% if (Settings.activateSeedbox) { %>
                    <i class="fa fa-download item-download"></i>
                    <span style="margin-right: 70px"><% } else { %><span><% } %><%=Common.fileSize(file.length) %></span>
                </li>
            <% }}); %>
        </ul>
    </div>

    <div class="fakeskan"></div>

    <% if (Settings.activateTorrentCollection) { %>
       <div class="button store-torrent"></div>
    <% } %>

    <div id="player-chooser2"></div>
</div>
