const urlparse = require('url').parse;
const Db = require('./db.js');

const servers = {};

const MongoClient = function () {
  this.connect = MongoClient.connect;
};

MongoClient.connect = function (url, options, callback) {
  let properCallback = callback;
  if (typeof options === 'function') {
    properCallback = options;
  }
  url = urlparse(url);
  const server = servers[url.host] || (servers[url.host] = { databases: {} });
  const dbname = url.pathname.replace(/^\//, '');
  return new Db(dbname, server).open(properCallback);
};

module.exports = MongoClient;
