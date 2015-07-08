<div class="keyboard-container">
    <div class="fa fa-times close-icon"></div>
    <div class="overlay-content"></div>
    <div class="content">
        <h1><%= i18n.__("Keyboard Shortcuts") %></h1>
        <hr>
        <div class="keyboard-outer">
        <div class="fix-float">
            <table class="keyboard-table">
                <tbody>
                    <tr>
                        <th></th>
                        <th><%= i18n.__("Global shortcuts") %></th>
                    </tr>
                    <tr>
                        <td><span class="key">?</span>/<span class="key">/</span></td>
                        <td><%= i18n.__("Open this screen") %></td>
                    </tr>
                    <tr>
                        <td><span class="key control"><%= i18n.__("ctrl") %></span>+<span class="key">,</span></td>
                        <td><%= i18n.__("Open Settings") %></td>
                    </tr>
                    <tr>
                        <td><span class="key">`</span>/<span class="key">B</span></td>
                        <td><%= i18n.__("Open Favorites") %></td>
                    </tr>
                    <tr>
                        <td><span class="key">I</span></td>
                        <td><%= i18n.__("Open About") %></td>
                    </tr>
                    <tr>
                        <td><span class="key control">TAB</span></td>
                        <td><%= i18n.__("Switch to next tab") %></td>
                    </tr>
                    <tr>
                        <td><span class="key shiftleft"><%= i18n.__("shift") %></span>+<span class="key control">TAB</span></td>
                        <td><%= i18n.__("Switch to previous tab") %></td>
                    </tr>
                    <tr>
                        <td><span class="key control"><%= i18n.__("ctrl") %></span>+<span class="key">1</span><%= i18n.__("through") %></span><span class="key control"><%= i18n.__("ctrl") %></span>+<span class="key">3</span></td>
                        <td><%= i18n.__("Switch to corresponding tab") %></td>
                    </tr>
                    <tr>
                        <td><span class="key enter"><%= i18n.__("enter") %></span>/<span class="key spacebar"><%= i18n.__("space") %></span></td></td>
                        <td><%= i18n.__("Open Item Details") %></td>
                    </tr>
                    <tr>
                        <td><span class="key control"><%= i18n.__("ctrl") %></span>+<span class="key">+</span></td>
                        <td><%= i18n.__("Enlarge Covers") %></td>
                    </tr>
                    <tr>
                        <td><span class="key control"><%= i18n.__("ctrl") %></span>+<span class="key">-</span></td>
                        <td><%= i18n.__("Reduce Covers") %></td>
                    </tr>
                    <tr>
                        <td><span class="key">F</span></td>
                        <td><%= i18n.__("Add Item to Favorites") %></td>
                    </tr>
                    <tr>
                        <td><span class="key">W</span></td>
                        <td><%= i18n.__("Mark as Seen") %></td>
                    </tr>
                    <tr>
                        <td><span class="key control"><%= i18n.__("ctrl") %></span>+<span class="key control">ALT</span>+<span class="key">F</span></td>
                        <td><%= i18n.__("Toggle Fullscreen") %></td>
                    </tr>
                    <tr>
                        <td><span class="key shiftleft"><%= i18n.__("shift") %></span>+<span class="key">B</span></td>
                        <td><%= i18n.__("Big Picture Mode") %></td>
                    </tr>
                    <tr>
                        <td><span class="key control"><%= i18n.__("ctrl") %></span>+<span class="key">F</span></td>
                        <td><%= i18n.__("Search") %></td>
                    </tr>
                </tbody>
                <tbody>
                    <tr>
                        <th></th>
                        <th><%= i18n.__("Movie Detail") %></th>
                    </tr>
                    <tr>
                        <td><span class="key">Q</span></td>
                        <td><%= i18n.__("Toggle Quality") %></td>
                    </tr>
                    <tr>
                        <td><span class="key">F</span></td>
                        <td><%= i18n.__("Add Item to Favorites") %></td>
                    </tr>
                    <tr>
                        <td><span class="key enter"><%= i18n.__("enter") %></span>/<span class="key spacebar"><%= i18n.__("space") %></span></td></td>
                        <td><%= i18n.__("Play Movie") %></td>
                    </tr>
                </tbody>

                <tbody>
                    <tr>
                        <th></th>
                        <th><%= i18n.__("TV Show Detail") %></th>
                    </tr>
                    <tr>
                        <td><span class="key">Q</span></td>
                        <td><%= i18n.__("Toggle Quality") %></td>
                    </tr>
                    <tr>
                        <td><span class="key">F</span></td>
                        <td><%= i18n.__("Add Item to Favorites") %></td>
                    </tr>
                    <tr>
                        <td><span class="key">W</span></td>
                        <td><%= i18n.__("Toggle Watched") %></td>
                    </tr>
                    <tr>
                        <td><span class="key arrow">&#8595;</span></td>
                        <td><%= i18n.__("Select Next Episode") %></td>
                    </tr>
                    <tr>
                        <td><span class="key arrow">&#8593;</span></td>
                        <td><%= i18n.__("Select Previous Episode") %></td>
                    </tr>
                    <tr>
                        <td><span class="key control"><%= i18n.__("ctrl") %></span>+<span class="key arrow">&#8595;</span></td>
                        <td><%= i18n.__("Select Next Season") %></td>
                    </tr>
                    <tr>
                        <td><span class="key control"><%= i18n.__("ctrl") %></span>+<span class="key arrow">&#8593;</span></td>
                        <td><%= i18n.__("Select Previous Season") %></td>
                    </tr>
                    <tr>
                        <td><span class="key enter"><%= i18n.__("enter") %></span>/<span class="key spacebar"><%= i18n.__("space") %></span></td>
                        <td><%= i18n.__("Play Episode") %></td>
                    </tr>
                </tbody>

                    <tr><th></th><td></td></tr><!-- this empty entry is for small screens -->
                </tbody>
            </table>
            <table class="keyboard-table last">
                <tbody>
                    <tr>
                        <th></th>
                        <th><%= i18n.__("Video Player") %></th>
                    </tr>
                    <tr>
                        <td><span class="key">f</span></td>
                        <td><%= i18n.__("Toggle Fullscreen") %></td>
                    </tr>
                    <tr>
                        <td><span class="key esc"><%= i18n.__("esc") %></span></td>
                        <td><%= i18n.__("Exit Fullscreen") %></td>
                    </tr>
                    <tr>
                        <td><span class="key spacebar"><%= i18n.__("space") %></span>/<span class="key">p</span></td>
                        <td><%= i18n.__("Play/Pause") %></td>
                    </tr>
                    <tr>
                        <td><span class="key arrow">&#8594;</span></td>
                        <td><%= i18n.__("Seek Forward") %> 10s</td>
                    </tr>
                    <tr>
                        <td><span class="key shiftleft"><%= i18n.__("shift") %></span>+<span class="key arrow">&#8594;</span></td>
                        <td><%= i18n.__("Seek Forward") %> 1 min</td>
                    </tr>
                    <tr>
                        <td><span class="key control"><%= i18n.__("ctrl") %></span>+<span class="key arrow">&#8594;</span></td>
                        <td><%= i18n.__("Seek Forward") %> 10 mins</td>
                    </tr>
                    <tr>
                        <td><span class="key arrow">&#8592;</span></td>
                        <td><%= i18n.__("Seek Backward") %> 10s</td>
                    </tr>
                    <tr>
                        <td><span class="key shiftleft"><%= i18n.__("shift") %></span>+<span class="key arrow">&#8592;</span></td>
                        <td><%= i18n.__("Seek Backward") %> 1 min</td>
                    </tr>
                    <tr>
                        <td><span class="key control"><%= i18n.__("ctrl") %></span>+<span class="key arrow">&#8592;</span></td>
                        <td><%= i18n.__("Seek Backward") %> 10 mins</td>
                    </tr>
                    <tr>
                        <td><span class="key arrow">&#8593;</span></td>
                        <td><%= i18n.__("Increase Volume") %> 10%</td>
                    </tr>
                    <tr>
                        <td><span class="key shiftleft"><%= i18n.__("shift") %></span>+<span class="key arrow">&#8593;</span></td>
                        <td><%= i18n.__("Increase Volume") %> 50%</td>
                    </tr>
                    <tr>
                        <td><span class="key control"><%= i18n.__("ctrl") %></span>+<span class="key arrow">&#8593;</span></td>
                        <td><%= i18n.__("Set Volume to") %> 100%</td>
                    </tr>
                    <tr>
                        <td><span class="key arrow">&#8595;</span></td>
                        <td><%= i18n.__("Decrease Volume") %> 10%</td>
                    </tr>
                    <tr>
                        <td><span class="key shiftleft"><%= i18n.__("shift") %></span>+<span class="key arrow">&#8595;</span></td>
                        <td><%= i18n.__("Decrease Volume") %> 50%</td>
                    </tr>
                    <tr>
                        <td><span class="key control"><%= i18n.__("ctrl") %></span>+<span class="key arrow">&#8595;</span></td>
                        <td><%= i18n.__("Set Volume to") %> 0%</td>
                    </tr>
                    <tr>
                        <td><span class="key">m</span></td>
                        <td><%= i18n.__("Toggle Mute") %></td>
                    </tr>
                    <tr>
                        <td><span class="key">h</span></td>
                        <td><%= i18n.__("Offset Subtitles by") %> +0.1s</td>
                    </tr>
                    <tr>
                        <td><span class="key shiftleft"><%= i18n.__("shift") %></span>+<span class="key">h</span></td>
                        <td><%= i18n.__("Offset Subtitles by") %> +1s</td>
                    </tr>
                    <tr>
                        <td><span class="key control"><%= i18n.__("ctrl") %></span>+<span class="key">h</span></td>
                        <td><%= i18n.__("Offset Subtitles by") %> +5s</td>
                    </tr>
                    <tr>
                        <td><span class="key">g</span></td>
                        <td><%= i18n.__("Offset Subtitles by") %> -0.1s</td>
                    </tr>
                    <tr>
                        <td><span class="key shiftleft"><%= i18n.__("shift") %></span>+<span class="key">g</span></td>
                        <td><%= i18n.__("Offset Subtitles by") %> -1s</td>
                    </tr>
                    <tr>
                        <td><span class="key control"><%= i18n.__("ctrl") %></span>+<span class="key">g</span></td>
                        <td><%= i18n.__("Offset Subtitles by") %> -5s</td>
                    </tr>
                    <tr>
                        <td><span class="key">l</span></td>
                        <td><%= i18n.__('Increase playback rate by %s', '0.1x') %></td>
                    </tr>
                    <tr>
                        <td><span class="key">j</span></td>
                        <td><%= i18n.__('Decrease playback rate by %s', '0.1x') %></td>
                    </tr>
                    <tr>
                        <td><span class="key shiftleft"><%= i18n.__("shift") %></span>+<span class="key">j</span></td>
                        <td><%= i18n.__('Set playback rate to %s', '0.5x') %></td>
                    </tr>
                    <tr>
                        <td><span class="key">k</span></td>
                        <td><%= i18n.__('Set playback rate to %s', '1x') %></td>
                    </tr>
                    <tr>
                        <td><span class="key shiftleft"><%= i18n.__("shift") %></span>+<span class="key">l</span></td>
                        <td><%= i18n.__('Set playback rate to %s', '2x') %></td>
                    </tr>
                    <tr>
                        <td><span class="key control"><%= i18n.__("ctrl") %></span>+<span class="key">l</span></td>
                        <td><%= i18n.__('Set playback rate to %s', '4x') %></td>
                    </tr>
                    <tr>
                        <td><span class="key">u</span></td>
                        <td><%= i18n.__("Show Stream URL") %></td>
                    </tr>
                    <tr>
                        <td><span class="key">1</span></td>
                        <td><%= i18n.__("Set player window to video resolution") %></td>
                    </tr>
                    <tr>
                        <td><span class="key">2</span></td>
                        <td><%= i18n.__("Set player window to double of video resolution") %></td>
                    </tr>
                    <tr>
                        <td><span class="key">0</span></td>
                        <td><%= i18n.__("Set player window to half of video resolution") %></td>
                    </tr>
                </tbody>
            </table>
        </div>
        </div>
    </div>
</div>
