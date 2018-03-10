/** Global variables **/
var
    _ = require('underscore'),
    async = require('async'),
    inherits = require('util').inherits,
    Q = require('q'),

    // Machine readable
    os = require('os'),
    moment = require('moment'),
    crypt = require('crypto'),
    semver = require('semver'),

    // Files
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    rimraf = require('rimraf'),

    // Compression
    tar = require('tar'),
    AdmZip = require('adm-zip'),
    zlib = require('zlib'),

    // Encoding/Decoding
    charsetDetect = require('jschardet'),
    iconv = require('iconv-lite'),

    // GUI
    win = nw.Window.get(),
    data_path = nw.App.dataPath,
    i18n = require('i18n'),

    // Connectivity
    url = require('url'),
    tls = require('tls'),
    http = require('http'),
    request = require('request'),

    // Web
    querystring = require('querystring'),
    URI = require('urijs'),
    Trakt = require('trakt.tv'),
    trakt = new Trakt({
      client_id: '647c69e4ed1ad13393bf6edd9d8f9fb6fe9faf405b44320a6b71ab960b4540a2',
      client_secret: 'f55b0a53c63af683588b47f6de94226b7572a6f83f40bd44c58a7c83fe1f2cb1',
      plugins: ['ondeck', 'matcher', 'images'],
      options: {
        images: {
          smallerImages: true,
          fanartApiKey: 'a3c13d3f5a36201ae3951707f342fd08',
          tvdbApiKey: '80A769280C71D83B',
          tmdbApiKey: '1a83b1ecd56e3ac0e509b553b68c77a9'
               }
           }
       }),

    // Torrent engines
    WebTorrent = require('webtorrent'),
    torrentCollection = require('TorrentCollection'),

    // NodeJS
    child = require('child_process');
