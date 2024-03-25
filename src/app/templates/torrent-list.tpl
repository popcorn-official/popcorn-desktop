<table>
    <%_.each(torrents, function(torrent, k) { %>
    <tr class="item-row" data-key="<%=k %>">
        <td class="provider tooltipped<%= Settings.seriesUITransparency ? '' : ' transpOff' %>" <% if (torrent.source) { %>title="<%=torrent.source.split('//').pop().split('/')[0] %>" <% } else { %>title="<%=torrent.provider.toLowerCase() %>" style="cursor:default" <% } %>data-toggle="tooltip" data-container="body" data-placement="left"><img data-href="<%=torrent.source %>" src="<%=torrent.icon %>" <% if (!torrent.source) { %>style="cursor:default" <% } %>onerror="this.onerror=null; this.style.display='none'; this.parentElement.style.top='0'; this.parentElement.classList.add('fas', 'fa-link')" onload="this.onerror=null; this.onload=null;"/></td>
        <td class="ellipsis item-play<%= Settings.seriesUITransparency ? '' : ' transpOff' %>"><span data-titleholder="<%=torrent.title.replaceAll('.', '.\u200B') %>" class="item-play tooltipped" data-toggle="tooltip" data-container="body" data-placement="top" onmouseenter="if (this.offsetWidth < this.scrollWidth) { $(this).attr('data-original-title', $(this).attr('data-titleholder')); } else { $(this).attr('data-original-title', ''); }"><%=torrent.title %></span></td>
        <td class="info item-play tooltipped<%= Settings.seriesUITransparency ? '' : ' transpOff' %>" title="<%= i18n.__('Seeds') %> &nbsp;/&nbsp; <%= i18n.__('Peers') %>" data-toggle="tooltip" data-container="body" data-placement="top"><%=torrent.seed || torrent.seeds || 0 %> / <%=torrent.peer || torrent.peers || 0 %></td>
        <% if (torrent.quality) { %><td class="info item-play<%= Settings.seriesUITransparency ? '' : ' transpOff' %>"><%=torrent.quality %></td><% } %>
        <% if (torrent.filesize) { %><td class="info item-play<%= Settings.seriesUITransparency ? '' : ' transpOff' %>"><%=torrent.filesize %></td><% } %>
        <% if (Settings.activateSeedbox) { %><td class="action item-download tooltipped<%= Settings.seriesUITransparency ? '' : ' transpOff' %>" title="<%= i18n.__('Download') %>" data-toggle="tooltip" data-container="body" data-placement="top"><i class="fa fa-download item-download"></i></td><% } %>
    </tr>
    <% }); %>
</table>
