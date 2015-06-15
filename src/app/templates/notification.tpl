<div class="notification <%= typeof hidden === 'boolean' && hidden ? 'hidden' : '' %> <%= type %>">
  <h1><%= title %></h1>
  <p><%= body %></p>

  <% if (showClose) { %>
    <i class="fa fa-times close"></i>
  <% } %>

  <% if (buttons.length) { %>
    <div class="btn-grp">
    <% buttons.forEach(function(button, index){  %>
      <div class="btn <%= button.class %> action-button-<%= index %>"><%= button.title %></div>
    <% }) %>
  <% } %>

</div>
