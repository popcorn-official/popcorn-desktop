/** Global variables **/
var _ = require('underscore'),
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
  // Torrent engines
  WebTorrent = require('webtorrent'),
  torrentCollection = require('torrentcollection2'),
  // VPN
  VPNht = require('@vpnht/sdk'),
  // NodeJS
  child = require('child_process');
