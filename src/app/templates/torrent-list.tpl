<table>
    <%_.each(torrents, function(torrent, k) { %>
    <tr data-key="<%=k %>">
        <td class="provider"><img data-href="<%=torrent.source %>" src="/src/app/images/icon.png" alt="<%=torrent.provider %>"/></td>
        <td title="<%=torrent.title %>" class="ellipsis"><span><%=torrent.title %></span></td>
        <td class="info"><%=torrent.seed || torrent.seeds %>/<%=torrent.peer || torrent.peers %></td>
        <td class="info"><%=torrent.quality %></td>
        <td class="info"><%=torrent.filesize %></td>
        <% if (Settings.activateSeedbox) { %>
        <td class="action"><i class="fa fa-download item-download"></i></td>
        <% } %>
        <td class="action"><i class="fa fa-play item-play"></i></td>
    </tr>
    <% }); %>
</table>
