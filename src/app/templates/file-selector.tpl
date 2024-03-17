<div class="file-selector-container">
    <div class="file-selector-backdrop"></div>
    <div class="file-selector-backdrop-overlay"<% if ($('.sh-backdrop')[0]) {switch(Settings.seriesUITransparency) { case '': %> style="opacity:1"<%; break; case 'vlow': %> style="opacity:0.9"<%; break; case 'low': %> style="opacity:0.8"<%; break; case 'high': %> style="opacity:0.6"<%; break; case 'vhigh': %> style="opacity:0.5"<%; break; default: %><%}} if (localFile) { %> style="opacity:1 !important"<%}%>></div>
    <div class="fa fa-times close-icon"></div>

    <div class="title"><%=i18n.__('Please select a file to play')%></div>
    <div class="content">
        <ul class="file-list">
            <% _.each(files, function(file, index) { 
                    if (file.display !== false) { %>
                <li class="file-item" data-index="<%=file.index%>" data-file="<%=file.path%>">
                    <% if (Settings.activateSeedbox && !localFile) { %>
                    <i class="fa fa-download item-download tooltipped" title="<%=i18n.__('Download')%>" data-placement="top" data-container="body"></i>
                    <span style="margin-right: 12px"><% } else { %><span><% } %><%=Common.fileSize(file.length) %></span>
                    <a class="tooltipped" data-titleholder="<%= file.name.replaceAll('.', '.\u200B') %>" data-placement="top" data-container="body" onmouseenter="if (this.offsetWidth < this.scrollWidth) { $(this).attr('data-original-title', $(this).attr('data-titleholder')); } else { $(this).attr('data-original-title', ''); }"><%=file.name %></a>
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
