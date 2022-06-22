<table>
    <%_.each(torrents, function(torrent, k) { %>
    <tr data-key="<%=k %>">
        <td class="provider"><img data-href="<%=torrent.source %>" src="<%=torrent.icon %>" alt="<%=torrent.provider %>"/></td>
        <td class="ellipsis"><span title="<%=torrent.title %>" class="item-play tooltipped" data-toggle="tooltip" data-container="body" data-placement="top"><%=torrent.title %></span></td>
        <td class="info"><%=torrent.seed || torrent.seeds || 0 %>/<%=torrent.peer || torrent.peers || 0 %></td>
        <td class="info"><%=torrent.quality %></td>
        <td class="info"><%=torrent.filesize %></td>
        <% if (Settings.activateSeedbox) { %>
        <td class="action"><i class="fa fa-download item-download"></i></td>
        <% } %>
        <td class="action"><i class="fa fa-play item-play"></i></td>
    </tr>
    <% }); %>
</table>
