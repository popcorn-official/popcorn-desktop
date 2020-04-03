<div class="sdow-quality">
    <% _.each(sortedTorrents, function(torrent, key) { %>
        <% if (!torrent) { %>
        <div class="disabled"><%=key %></div>
        <% } else { %>
        <div title="<%= Common.fileSize(torrent.size) %>" class="qselect"><%=key %></div>
        <% } %>
    <% }) %>
</div>
