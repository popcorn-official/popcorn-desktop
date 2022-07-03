<table>
    <%_.each(torrents, function(torrent, k) { %>
    <tr class="item-row" data-key="<%=k %>">
        <td class="provider tooltipped" title="<%=torrent.source.split('//').pop().split('/')[0] %>" data-toggle="tooltip" data-container="body" data-placement="left"><img data-href="<%=torrent.source %>" src="<%=torrent.icon %>" onerror="this.style.display='none'; this.parentElement.style.top='0'; this.parentElement.classList.add('fas', 'fa-link')"/></td>
        <td class="ellipsis item-play"><span title="<%=torrent.title %>" class="item-play tooltipped" data-toggle="tooltip" data-container="body" data-placement="top"><%=torrent.title %></span></td>
        <td class="info item-play tooltipped" title="<%= i18n.__('Seeds') %> / <%= i18n.__('Peers') %>" data-toggle="tooltip" data-container="body" data-placement="top"><%=torrent.seed || torrent.seeds || 0 %> / <%=torrent.peer || torrent.peers || 0 %></td>
        <td class="info item-play"><%=torrent.quality %></td>
        <td class="info item-play"><%=torrent.filesize %></td>
        <% if (Settings.activateSeedbox) { %>
        <td class="action tooltipped" title="<%= i18n.__('Download') %>" data-toggle="tooltip" data-container="body" data-placement="top"><i class="fa fa-download item-download"></i></td>
        <% } %>
    </tr>
    <% }); %>
</table>
