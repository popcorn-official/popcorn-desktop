/** Global variables **/
var _ = require('underscore'),
  async = require('async'),
  inherits = require('util').inherits,
  // Machine readable
  os = require('os'),
  dayjs = require('dayjs'),
  crypt = require('crypto'),
  semver = require('semver'),
  // Files
  fs = require('fs'),
  path = require('path'),
  mkdirp = require('mkdirp'),
  rimraf = require('rimraf'),
  jsonFileEditor = require('edit-json-file'),
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
  URI = require('urijs'),
  Trakt = require('trakt.tv'),
  // Torrent engines
  WebTorrent = require('webtorrent'),
  torrentCollection = require('torrentcollection6'),
  // NodeJS
  child = require('child_process'),
  // package.json
  pkJson = nw.App.manifest,
  // supported external players list
  extPlayerlst = '',
  // setting default filters status
  curSetDefaultFilters = false;

dayjs.extend(require('dayjs/plugin/relativeTime'));
dayjs.extend(require('dayjs/plugin/localizedFormat'));
