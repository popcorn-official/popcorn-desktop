videojs.options["children"] = {
  mediaLoader: {},
  posterImage: {},
  textTrackDisplay: {},
  loadingSpinner: {},
  //'bigPlayButton': {},
  controlBar: {},
  errorDisplay: {}
};

var inherits = require("util").inherits;

var Player = videojs.getComponent("Player");
var Component = videojs.getComponent("Component");

var Button = videojs.getComponent("Button");
var ErrorDisplay = videojs.getComponent("ErrorDisplay");
var LoadProgressBar = videojs.getComponent("LoadProgressBar");
var MenuItem = videojs.getComponent("MenuItem");
var Tech = videojs.getComponent("Tech");

// Custom hasData function to not error if el==null (vdata error)
videojs.prototype.hasData = function(el) {
  if (!el) {
    return;
  }
  var id = el[videojs.expando];
  return !(!id || videojs.isEmpty(videojs.cache[id]));
};

Player.prototype.debugMouse_ = false;

Player.prototype.handleFullscreenChange = function() {
  console.log("HANDLE FULL SCREEN");
  if (this.isFullscreen()) {
    this.addClass("vjs-fullscreen");
    $(".vjs-text-track").css("font-size", "140%");
    $(".state-info-player").css("font-size", "65px");
  } else {
    this.removeClass("vjs-fullscreen");
    $(".vjs-text-track").css("font-size", "");
    $(".state-info-player").css("font-size", "50px");
  }
};

Player.prototype.handleTechLoadStart = function() {
  if (this.error()) {
    this.error(null);
  }

  videojs.addClass(this.el_, "vjs-has-started");
  this.trigger("volumechange");
};

Player.prototype.listenForUserActivity_ = function() {
  var onActivity,
    onMouseDown,
    mouseInProgress,
    onMouseUp,
    activityCheck,
    inactivityTimeout;

  onActivity = videojs.bind(this, this.reportUserActivity);

  onMouseDown = function(e) {
    onActivity(e);
    clearInterval(mouseInProgress);
    mouseInProgress = setInterval(onActivity, 250);
  };

  onMouseUp = function(e) {
    onActivity(e);
    clearInterval(mouseInProgress);
  };

  this.on("mousedown", onMouseDown);
  this.on("mousemove", onActivity);
  this.on("mouseup", onMouseUp);
  this.on("keydown", onActivity);
  this.on("keyup", onActivity);

  activityCheck = setInterval(
    videojs.bind(this, function() {
      if (this.userActivity_) {
        this.userActivity_ = false;
        this.userActive(true);
        clearTimeout(inactivityTimeout);
        inactivityTimeout = setTimeout(
          videojs.bind(this, function() {
            if (!this.userActivity_) {
              this.userActive(false);
            }
          }),
          2000
        );
      }
    }),
    250
  );

  this.on("dispose", function() {
    clearInterval(activityCheck);
    clearTimeout(inactivityTimeout);
  });
};

Player.prototype.reportUserActivity = function(event) {
  /** DEBUG MOUSE CTRL+D **/
  if (this.debugMouse_) {
    win.debug("");
    win.debug(
      "Event fired at: " +
        videojs.formatTime(this.player_.currentTime(), this.player_.duration())
    );
    win.debug(event);
  }
  if (event !== undefined && event.type === "mousemove") {
    if (event.webkitMovementX === 0 && event.webkitMovementY === 0) {
      return;
    }
  }
  this.userActivity_ = true;
};

Player.prototype.volume = function(percentAsDecimal) {
  var vol;

  if (percentAsDecimal !== undefined) {
    vol = Math.max(0, Math.min(1, parseFloat(percentAsDecimal))); // Force value to between 0 and 1
    this.cache_.volume = vol;
    this.techCall_("setVolume", vol);

    //let's save this bad boy
    AdvSettings.set("playerVolume", vol.toFixed(1));
    App.PlayerView.displayOverlayMsg(
      i18n.__("Volume") + ": " + vol.toFixed(1) * 100 + "%"
    );

    return this;
  }

  // Default to 1 when returning current volume.
  vol = parseFloat(this.techGet_("volume"));
  return isNaN(vol) ? 1 : vol;
};

// Remove videojs key listeners
Button.prototype.onKeyPress = function(event) {
  return;
};

ErrorDisplay.prototype.update = function() {
  //Display our own error
  var suggestedExternal = function() {
    var link = '<a href="http://www.videolan.org/vlc/" class="links">VLC</a>';
    try {
      App.Device.Collection.models.forEach(function(player) {
        link = player.id === "VLC" ? player.id : link;
      });
    } catch (e) {}
    return link;
  };

  if (this.player().error()) {
    $(".vjs-error-display").dblclick(function(event) {
      App.PlayerView.toggleFullscreen();
      event.preventDefault();
    });
    if (
      this.player().error().message ===
        "The media playback was aborted due to a corruption problem or because the video used features your browser did not support." ||
      this.player().error().message ===
        "The media could not be loaded, either because the server or network failed or because the format is not supported."
    ) {
      this.contentEl_.innerHTML = i18n.__(
        "The video playback encountered an issue. Please try an external player like %s to view this content.",
        suggestedExternal()
      );
    } else {
      this.contentEl_.innerHTML = this.localize(this.player().error().message);
    }
  }
};

// This is a custom way of loading subtitles, since we can't use src (CORS blocks it and we can't disable it)
// We fetch them when requested, process them and finally throw a parseCues their way
var TextTrack = function(options) {
  var settings = this.extend(options, {
    kind: "subtitles",
    language: options.language || options.srclang || ""
  });
  var mode = "disabled";
  var default_ = settings.default;

  if (settings.kind === "metadata" || settings.kind === "chapters") {
    mode = "hidden";
  }
  // on IE8 this will be a document element
  // for every other browser this will be a normal object
  // var tt = videojs.TextTrack.call(settings);
  var src = settings.src;
  delete settings.src;
  var tt = TextTrack.super_.call(settings);

  settings.src = src;
  if (settings.src) {
    tt.src = settings.src;
    this.load(settings.src, tt);
  } else {
    tt.loaded_ = true;
  }

  return tt;
};

inherits(TextTrack, videojs.TextTrack);

TextTrack.prototype.constructor = TextTrack;

TextTrack.prototype.load = function(src, tt) {
  // Only load if not loaded yet.
  console.log("test");
  if (this.readyState_ === 0) {
    var this_ = this;
    this.readyState_ = 1;

    var subsParams = function() {
      $("#video_player .vjs-text-track")
        .css("display", "inline-block")
        .drags();
      $("#video_player .vjs-text-track-display").css(
        "font-size",
        Settings.subtitle_size
      );
      if (win.isFullscreen) {
        $(".vjs-text-track").css("font-size", "140%");
      }
      $(".vjs-captions").css("color", Settings.subtitle_color);
      $(".vjs-captions").css("font-family", Settings.subtitle_font);
      if (Settings.subtitle_decoration === "None") {
        $(".vjs-text-track").css("text-shadow", "none");
      } else if (Settings.subtitle_decoration === "Opaque Background") {
        $(".vjs-text-track").css("background", "#000");
      } else if (Settings.subtitle_decoration === "See-through Background") {
        $(".vjs-text-track").css("background", "rgba(0,0,0,.5)");
      }
      if (Settings.subtitles_bold) {
        $(".vjs-text-track").css("font-weight", "bold");
      }
      $(".vjs-text-track")
        .css("z-index", "auto")
        .css("position", "relative")
        .css("top", AdvSettings.get("playerSubPosition"));
    };

    // Fetches a raw subtitle, locally or remotely
    var get_subtitle = function(subtitle_url, callback) {
      // Fetches Locally
      if (fs.existsSync(path.join(subtitle_url))) {
        fs.readFile(subtitle_url, function(error, data) {
          if (!error) {
            callback(data);
          } else {
            win.warn("Failed to read subtitle!", error);
          }
        });
        // Fetches Remotely
      } else {
        request(
          {
            url: subtitle_url,
            encoding: null
          },
          function(error, response, data) {
            if (!error && response.statusCode === 200) {
              callback(data);
            } else {
              win.warn("Failed to download subtitle!", error, response);
            }
          }
        );
      }
    };

    //transcode .ass, .ssa, .txt to SRT
    var convert2srt = function(file, ext, callback) {
      var readline = require("readline"),
        counter = null,
        lastBeginTime,
        //input
        orig = /([^\\]+)$/.exec(file)[1],
        origPath = file.substr(0, file.indexOf(orig)),
        //output
        srt = orig.replace(ext, ".srt"),
        srtPath = Settings.tmpLocation,
        //elements
        dialog,
        begin_time,
        end_time;

      fs.writeFileSync(path.join(srtPath, srt), ""); //create or delete content;
      win.debug("SUB format can be converted:", orig);

      var rl = readline.createInterface({
        input: fs.createReadStream(path.join(origPath, orig)),
        output: process.stdout,
        terminal: false
      });
      rl.on("line", function(line) {
        //detect encoding
        var charset = charsetDetect.detect(line);
        var encoding = charset.encoding;
        var line_, parsedBeginTime, parsedEndTime, parsedDialog;

        //parse SSA
        if (ext === ".ssa" || ext === ".ass") {
          encoding = "utf-8";
          if (line.indexOf("Format:") !== -1) {
            var ssaFormat = line.split(",");

            for (var i = 0; i < ssaFormat.length; i++) {
              switch (ssaFormat[i]) {
                case "Text":
                case " Text":
                  dialog = i;
                  break;
                case "Start":
                case " Start":
                  begin_time = i;
                  break;
                case "End":
                case " End":
                  end_time = i;
                  break;
                default:
              }
            }

            if (dialog && begin_time && end_time) {
              win.debug("SUB formatted in 'ssa'");
            }
            return; //we have the elms spots, move on to the next line
          }

          if (line.indexOf("Dialogue:") === -1) {
            //not a dialog line
            return;
          }

          line_ = line.split(",");

          parsedBeginTime = line_[begin_time];
          parsedEndTime = line_[end_time];
          parsedDialog = line_[dialog];
          parsedDialog = parsedDialog
            .replace("{\\i1}", "<i>")
            .replace("{\\i0}", "</i>"); //italics
          parsedDialog = parsedDialog
            .replace("{\\b1}", "<b>")
            .replace("{\\b0}", "</b>"); //bold
          parsedDialog = parsedDialog.replace("\\N", "\n"); //return to line
          parsedDialog = parsedDialog.replace(/{.*?}/g, ""); //remove leftovers brackets
        }

        //parse TXT
        if (ext === ".txt") {
          line_ = line.split("}");

          var formatSeconds = function(seconds) {
            var date = new Date(1970, 0, 1);
            date.setSeconds(seconds);
            return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
          };

          parsedBeginTime = formatSeconds(line_[0].replace("{", "") / 25);
          parsedEndTime = formatSeconds(line_[1].replace("{", "") / 25);
          parsedDialog = line_[2].replace("|", "\n");
        }

        //SRT needs a number for each subtitle
        counter += 1;

        //keep only the last lang
        if (parsedBeginTime < lastBeginTime) {
          counter = 1;
          fs.writeFileSync(path.join(srtPath, srt), "");
          win.debug("SUB contains multiple tracks, keeping only the last");
        }

        //SRT formatting
        var parsedLine =
          counter +
          "\n" +
          parsedBeginTime +
          " --> " +
          parsedEndTime +
          "\n" +
          parsedDialog;

        fs.appendFileSync(
          path.join(srtPath, srt),
          "\n\n" + parsedLine,
          encoding
        );
        lastBeginTime = parsedBeginTime;
      });

      setTimeout(function() {
        fs.readFile(path.join(srtPath, srt), function(err, dataBuff) {
          if (!err) {
            win.debug("SUB transcoded to SRT:", srt);
            callback(dataBuff);
          } else {
            win.warn("SUB transcoding failed", err);
          }
        });
      }, 2000);
    };

    // Decompress zip
    var decompress = function(dataBuff, callback) {
      try {
        var zip = new AdmZip(dataBuff);
        var zipEntries = zip.getEntries();
        // TODO: Shouldn't we look for only 1 file ???
        zipEntries.forEach(function(zipEntry, key) {
          if (zipEntry.entryName.indexOf(".srt") !== -1) {
            var decompressedData = zip.readFile(zipEntry);
            callback(decompressedData);
          }
        });
      } catch (error) {
        win.warn("Failed to decompress subtitle!", error);
      }
    };

    // Handles charset encoding
    var decode = function(dataBuff, language, callback) {
      var targetEncodingCharset = "utf8";

      var parse = function(strings) {
        strings = strings
          .replace(/\{.*\}/g, "") // {/pos(x,y)}
          .replace(
            /(- |==|sync).*[\s\S].*[\s\S].*[\s\S].*[\s\S].*\.(com|org|net|edu)/gi,
            ""
          ) // various teams
          .replace(
            /[^0-9][\s\S][^0-9\W].*[\s\S].*[\s\S].*opensubtitles.*/gi,
            ""
          ); // opensubs "contact us" ads

        callback(strings);
      };

      var charset = charsetDetect.detect(dataBuff);
      var detectedEncoding = charset.encoding;
      win.debug("SUB charset detected: " + detectedEncoding);
      // Do we need decoding?
      if (
        detectedEncoding &&
        detectedEncoding.toLowerCase().replace("-", "") ===
          targetEncodingCharset
      ) {
        parse(dataBuff.toString("utf-8"));
        // We do
      } else {
        if (!language && Settings.subtitle_language !== "none") {
          language = Settings.subtitle_language;
          win.debug(
            "SUB charset: using subtitles_language setting (" +
              language +
              ") as default"
          );
        }
        var langInfo = App.Localization.langcodes[language] || {};
        win.debug("SUB charset expected:", langInfo.encoding);
        if (
          langInfo.encoding !== undefined &&
          langInfo.encoding.indexOf(detectedEncoding) < 0
        ) {
          // The detected encoding was unexepected to the language, so we'll use the most common
          // encoding for that language instead.
          detectedEncoding = langInfo.encoding[0];
          dataBuff = iconv.encode(
            iconv.decode(dataBuff, detectedEncoding),
            targetEncodingCharset
          );
        } else {
          // fallback to utf8
          win.debug("SUB charset: fallback to utf-8");
          dataBuff = iconv.decode(dataBuff, detectedEncoding);
          detectedEncoding = "UTF-8";
        }
        win.debug("SUB charset used:", detectedEncoding);
        parse(dataBuff.toString("utf-8"));
      }
    };

    var vjsBind = function(data) {
      try {
        this_.parseCues(data);
      } catch (e) {
        win.error("Error reading subtitles timing, file seems corrupted", e);
        subsParams();
        App.vent.trigger(
          "notification:show",
          new App.Model.Notification({
            title: i18n.__(
              "Error reading subtitle timings, file seems corrupted"
            ),
            body: i18n.__("Try another subtitle or drop one in the player"),
            showRestart: false,
            type: "error",
            autoclose: true
          })
        );
      }
    };

    this.on("loaded", function() {
      win.info("Subtitles loaded!");
      subsParams();
    });

    // Get it, Unzip it, Decode it, Send it
    get_subtitle(this.src_, function(dataBuf) {
      if (path.extname(this_.src_) === ".zip") {
        decompress(dataBuf, function(dataBuf) {
          decode(dataBuf, this_.language(), vjsBind);
        });
      } else if (
        path.extname(this_.src_) === ".ass" ||
        path.extname(this_.src_) === ".ssa" ||
        path.extname(this_.src_) === ".txt"
      ) {
        convert2srt(this_.src_, path.extname(this_.src_), function(dataBuf) {
          decode(dataBuf, this_.language(), vjsBind);
        });
      } else {
        decode(dataBuf, this_.language(), vjsBind);
      }
    });
  }
};

videojs.TextTrack = TextTrack;

/**
 * The specific menu item type for selecting a language within a text track kind
 *
 * @constructor
 */
var TextTrackMenuItem = videojs.extend(MenuItem, {
  /** @constructor */
  constructor: function(player, options) {
    var track = (this.track = options["track"]);
    console.log("here");
    // Modify options for parent MenuItem class's init.
    options["label"] = track.label();
    options["selected"] = track.dflt();
    MenuItem.call(this, player, options);

    this.player_.on(
      track.kind() + "trackchange",
      videojs.bind(this, this.update)
    );

    // Popcorn Time Fix
    // Allowing us to send a default language
    if (track.dflt()) {
      this.player_.showTextTrack(this.track.id_, this.track.kind());
    }
  }
});

TextTrackMenuItem.prototype.onClick = function() {
  MenuItem.prototype.onClick.call(this);
  console.log("click");
  this.player_.showTextTrack(this.track.id_, this.track.kind());
};

TextTrackMenuItem.prototype.update = function() {
  console.log("update");
  this.selected(this.track.mode() === 2);
};

videojs.registerComponent("TextTrackMenuItem", TextTrackMenuItem);

// Dispose needs to clear currentTimeInterval to avoid vdata error (https://github.com/videojs/video.js/issues/1484#issuecomment-55245716)
Tech.prototype.dispose = function() {
  // Turn off any manual progress or timeupdate tracking
  if (this.manualProgress) {
    this.manualProgressOff();
  }

  if (this.manualTimeUpdates) {
    this.manualTimeUpdatesOff();
  }

  clearInterval(this.currentTimeInterval);
  Component.prototype.dispose.call(this);
};
