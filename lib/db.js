/* eslint-disable no-unused-vars */
const { EventEmitter } = require('events');

const Collection = require('./collection');

const NotImplemented = () => {
  throw Error('Not Implemented. PR welcome!');
};

class Db extends EventEmitter {
  constructor(dbname) {
    super();
    const badguy = /[ .$/\\]/.exec(dbname);
    if (badguy) {
      throw new Error(`database names cannot contain the character "${badguy[0]}"'`);
    }
    this.dbname = dbname;
    this.__collections = {};
  }

  get databaseName() { return this.dbname; }

  addUser() {
    return NotImplemented();
  }
  admin() {
    return NotImplemented();
  }
  authenticate() {
    return NotImplemented();
  }
  close(force, callback) {
    this.emit('close');
    this.removeAllListeners('close');
    if (callback) {
      callback();
    } else {
      return Promise.resolve();
    }
  }
  collection(name, options, callback) {
    if (!this.__collections[name]) {
      this.__collections[name] = new Collection(this, name);
    }
    const col = this.__collections[name];
    if (callback) {
      callback(null, col);
    } else {
      return col;
    }
  }
  collections() {
    return NotImplemented();
  }
  command() {
    return NotImplemented();
  }
  createCollection(name, options, callback) {
    return NotImplemented();
  }
  createIndex(name, keys, options, callback) {
    return NotImplemented();
  }
  db() {
    return NotImplemented();
  }
  dropCollection() {
    return NotImplemented();
  }
  dropDatabase() {
    return NotImplemented();
  }
  ensureIndex() {
    return NotImplemented();
  }
  eval() {
    return NotImplemented();
  }
  executeDbAdminCommand() {
    return NotImplemented();
  }
  indexInformation(name, options, callback) {
    return NotImplemented();
  }
  listCollections(filter, options) {
    return NotImplemented();
  }
  logout() {
    return NotImplemented();
  }
  open(callback) {
    if (callback) {
      callback(null, this);
    } else {
      return Promise.resolve(this);
    }
  }
  removeUser() {
    return NotImplemented();
  }
  renameCollection() {
    return NotImplemented();
  }
  stats() {
    return NotImplemented();
  }
  toJSON() {
    return NotImplemented();
  }
}

module.exports = Db;
