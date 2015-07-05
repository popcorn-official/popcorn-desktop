<img class="icon-begin" src="/src/app/images/icon.png">
<img class="init-icon-title" src="/src/app/images/popcorn-time-logo.svg">
<div class="init-geek-line">
    <%= i18n.__("Made with") %> <span style="color:#e74c3c;">&#10084;</span> <%= i18n.__("by a bunch of geeks from All Around The World") %>
</div>
<div class="text-begin">
    <div class="init-text"><%= i18n.__("Initializing PopcornTime. Please Wait...") %></div>
    <div class="init-progressbar">
        <div id="initbar-contents"></div>
    </div>
    <div id="init-status" class="init-status"></div>

    <p id='cancel-block' style="margin-top:20px;display:none">
            <a href='#' style='color:#fff;font-weight:bold;' class='cancel'><%= i18n.__("Cancel") %></a>
    </p>

</div>

<p id='waiting-block'>
    <a href='#' class='fixApp'><%= i18n.__("Loading stuck ? Click here !") %></a>
</p>