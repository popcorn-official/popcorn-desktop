<div class="fa fa-times close-icon"></div>
<h1><%= title %></h1>
<h3><%= description %></h3>
<ul>
    <% for(var i = 0; i < changeLog.length; i++) { %>
    <li><%= changeLog[i] %></li>
    <% } %>
</ul>