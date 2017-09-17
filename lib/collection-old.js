var _ = require('lodash');
var ObjectId = require('mongodb').ObjectID;
var debug = require('debug')('mongo-mock:collection');
var asyncish = require('../').asyncish;
var cursor = require('./cursor.js');
var BulkOperation = require('./bulk');

var sift = require('../sift.js');

function addToSet (array, other) {
  other = _.isArray(other) ? other : [other];

  var index = -1,
      length = array.length,
      othIndex = -1,
      othLength = other.length,
      result = Array(length);

  while (++index < length) {
    result[index] = array[index];
  }
  while (++othIndex < othLength) {
    if (_.indexOf(array, other[othIndex]) < 0) {
      result.push(other[othIndex]);
    }
  }
  return result;
};

module.exports = function Collection(db, state) {
  var name = state.name;
  var pk = state.pkFactory || ObjectId;
  debug('initializing instance of `%s` with %s documents', name, state.documents? state.documents.length : undefined);

  var interface = {
    get collectionName(){ return name; },
    get hit(){ NotImplemented() },
    get name(){ return name; },
    get namespace(){ return db.databaseName+'.'+name; },
    get writeConcern(){ NotImplemented() },

    aggregate: NotImplemented,
    bulkWrite: NotImplemented,
    count: function() {
      var opts = find_options(arguments);
      return this.find(opts.query || {}, opts).count(opts.callback);
    },
    createIndex: function (keys, options, callback) {
      return db.createIndex(name, keys, options, callback);
    },
    createIndexes: NotImplemented,
    deleteMany: function (filter, options, callback) {
      callback = arguments[arguments.length-1];

      debug('deleteMany %j', filter);

      asyncish(function() {
        var docs = _.remove(state.documents||[], filter);
        if(docs.length) {
          if (debug.enabled) debug("removed: " + docs.map(function (doc) { return doc._id; }));
          state.persist();
        }
        callback(null, {result:{n:docs.length, ok: 1}, deletedCount:docs.length, connection:db});
      });
      if(typeof callback!=='function') {
        return new Promise(function (resolve,reject) {
          callback = function (e, r) { e? reject(e) : resolve(r) };
        })
      }
    },
    deleteOne: function (filter, options, callback) {
      callback = arguments[arguments.length-1];

      debug('deleteOne %j', filter);

      asyncish(function() {
        var deletionIndex = _.findIndex(state.documents||[], filter);
        var docs = deletionIndex === -1 ? [] : state.documents.splice(deletionIndex, 1);

        if(deletionIndex > -1) {
          if (debug.enabled) debug("removed: " + docs.map(function (doc) { return doc._id; }));
          state.persist();
        }
        callback(null, {result:{n:docs.length, ok: 1}, deletedCount:docs.length, connection:db});
      });
      if(typeof callback!=='function') {
        return new Promise(function (resolve,reject) {
          callback = function (e, r) { e? reject(e) : resolve(r) };
        })
      }
    },
    distinct: NotImplemented,
    drop: NotImplemented,
    dropIndex: NotImplemented,
    dropIndexes: NotImplemented,
    ensureIndex: function (fieldOrSpec, options, callback) { throw Error('deprecated'); },
    find: function () {
      var opts = find_options(arguments);
      debug('find %j callback=%s', opts, typeof opts.callback);

      var crsr = cursor(state.documents, opts);

      if(!opts.callback)
        return crsr;

      asyncish(function () {
        opts.callback(null, crsr);
      });
    },
    findAndModify: function(query, sort, update, options, callback) {
      const opts = {};
      if (typeof options === 'function') {
        callback = options;
      } else {
        Object.assign(opts, options, { sort: sort });
      }
      return this.findOneAndUpdate(query, update, opts, callback);
    },
    findAndRemove: NotImplemented,
    findOne: function () {
      var opts = find_options(arguments);
      debug('findOne %j callback=%s', opts, typeof opts.callback);

      var crsr = cursor(state.documents, opts);

      if(!opts.callback)
        return crsr.next();

      crsr.next().then(function (doc) {
        opts.callback(null, doc);
      });
    },
    findOneAndDelete: NotImplemented,
    findOneAndReplace: NotImplemented,
    findOneAndUpdate: function (filter, update, options, callback) {
      var self = this;
      var opts = options;
      if (typeof options === 'function') {
        callback = options;
        opts = {};
      }
      var insertNew = function (q, dbUpdate) {
        var newId;
        return self.insert(q)
        .then(function (dbInsert) {
          newId = dbInsert.ops[0]._id;
          return self.updateOne({ _id: newId }, dbUpdate);
        }).then(function () {
          return self.findOne({ _id: newId }).then(function (obj) {
            return obj;
          });
        });
      };
      asyncish(function () {
        self.findOne(filter, options)
        .then(function (object) {
          if (!object) {
            if (!opts.upsert) {
              return null;
            }
            return insertNew(filter, update);
          }
          return self.updateOne(filter, update)
          .then(function() {
            if (opts.returnOriginal === false) {
              return self.findOne({ _id: object._id });
            } else {
              return object;
            }
          })
        }).then(function(result) {
          callback(null, {
            value: result,
            lastErrorObject: null,
            ok: 1,
          });
        }).catch(function(err) {
          callback(err);
        });
      });
      if(typeof callback!=='function') {
        return new Promise(function (resolve,reject) {
          callback = function (e, r) { e? reject(e) : resolve(r) };
        })
      }
    },
    geoHaystackSearch: NotImplemented,
    geoNear: NotImplemented,
    group: NotImplemented,
    indexExists: NotImplemented,
    indexInformation: function (options, callback) {
      return db.indexInformation(name, options, callback);
    },
    indexes: NotImplemented,
    initializeOrderedBulkOp: function(options, callback) {
      return new BulkOperation(this);
    },
    initializeUnorderedBulkOp: function(options, callback) {
      return new BulkOperation(this);
    },
    insert: function(docs, options, callback) {
      debug('insert %j', docs);
      callback = arguments[arguments.length-1];
      //if(callback===options) options = {};//ignored when mocking
      if(!Array.isArray(docs))
        docs = [docs];
      if(name==='system.indexes') return interface.createIndexes(docs, callback)

      //make copies to break refs to the persisted docs
      docs = _.cloneDeep(docs, cloneObjectIDs);

      //The observed behavior of `db` is that documents
      // are committed until the first error. No information
      // about the successful inserts are return :/
      asyncish(function () {
        for (var i = 0; i < docs.length; i++) {
          var doc = docs[i];
          if(!doc._id) {
            doc._id = pk();
          } else if (doc._id._bsontype === 'ObjectID'){
            // parse mongoose id
            doc._id = pk(doc._id.id);
          }

          var conflict = state.findConflict(doc);
          if(conflict) {
            state.persist();
            return callback(conflict);
          }
          if(!state.documents) {
            state.documents = [doc];
          } else {
            state.documents.push(doc);
          }
        }

        state.persist();
        callback(null, {
          result: {ok:1,n:docs.length},
          connection: {},
          ops: _.cloneDeep(docs, cloneObjectIDs)
        });
      });
      if(typeof callback!=='function') {
        return new Promise(function (resolve,reject) {
          callback = function (e, r) { e? reject(e) : resolve(r) };
        })
      }
    },
    get insertMany() { return this.insert; },
    get insertOne() { return this.insert; },
    isCapped: NotImplemented,
    listIndexes: NotImplemented,
    mapReduce: NotImplemented,
    options: NotImplemented,
    parallelCollectionScan: NotImplemented,
    persist: function () {
      //this is one of the very few functions that are unique
      // to the `mock-mongo` interface. It causes a collection
      // to be materialized and the data to be persisted to disk.
      state.persist();
    },
    reIndex: NotImplemented,
    remove: function (selector, options, callback) {
      callback = arguments[arguments.length-1];

      debug('remove %j', selector);

      asyncish(function() {
        var docs = _.remove(state.documents||[], selector);
        if(docs.length) {
          if (debug.enabled) debug("removed: " + docs.map(function (doc) { return doc._id; }));
          state.persist();
        }
        callback(null, {result:{n:docs.length}, ops:docs, connection:db});
      });
      if(typeof callback!=='function') {
        return new Promise(function (resolve,reject) {
          callback = function (e, r) { e? reject(e) : resolve(r) };
        })
      }
    },
    rename: NotImplemented,
    replaceOne: function(selector, data, options, callback) {
      var self = this;
      callback = arguments[arguments.length-1];
      if(typeof options!=='object') options = {};
      var response = { acknowledged : true, matchedCount: 0, modifiedCount: 0 };
      var action = (options.upsert?"upsert: ":"update: ");
      debug('%s.%s %j', name, action, selector);

      asyncish(function() {
        self.findOne(selector, function(err, found) {
          var nextStep;
          if (err) {
            callback(err);
          } else if (found) {
            nextStep = function (_id) {
              return function (cb) {
                self.deleteOne({ _id: _id }, function (err) {
                  cb(err, _id);
                });
              };
            }(found._id);
          } else {
            nextStep = function (cb) {
              cb();
            };
          }
          nextStep(function (err, _id) {
            if (err) {
              callback(err);
            } else {
              if (_id) {
                data._id = _id;
              }
              self.insert(data, callback);
            }
          });
        });
      });

      if(typeof callback!=='function') {
        return new Promise(function (resolve,reject) {
          callback = function (e, r) { e? reject(e) : resolve(r) };
        })
      }
    },
    save: NotImplemented,
    stats: NotImplemented,
    update: function (selector, data, options, callback) {
      callback = arguments[arguments.length-1];
      if(typeof options!=='object') options = {};
      var response = {
        connection:db,
        result: {
          ok: 1,
          n: 0,
          nModified: 0,
        },
        matchedCount: 0,
        modifiedCount: 0,
        upsertedCount: 0,
        upsertedId: [],
      };
      var action = (options.upsert?"upsert: ":"update: ");
      debug('%s.%s %j', name, action, selector);

      asyncish(function() {
        var docs = (options.multi? sift : first)(selector, state.documents||[]) || [];
        if(!Array.isArray(docs)) docs = [docs];
        debug('%s.%s %j', name, action, docs);

        if(!docs.length && options.upsert) {
          var cloned = _.cloneDeep(data.$setOnInsert || data.$set || data, cloneObjectIDs);
          cloned._id = selector._id || pk();

          debug('%s.%s checking for index conflict', name, action);
          var conflict = state.findConflict(cloned);
          if(conflict) {
            debug('conflict found %j', conflict);
            return callback(conflict);
          }

          if(!state.documents) state.documents = [cloned];
          else state.documents.push(cloned);

          response.result.n = 1;
          response.result.ok = 1;
          response.result.nModified = 0;
          response.matchedCount= 0;
          response.modifiedCount = 0;
          response.upsertedCount = 1;
          response.upsertedId = [cloned._id];
        }
        else {
          debug('%s.%s checking for index conflicts', name, action);
          for (var i = 0; i < docs.length; i++) {
            var original = docs[i];
            if (_.has(data, '$addToSet')) {
              _.forEach(data.$addToSet, function (values, key) {
                original[key] = addToSet(original[key] || [], values);
              });
              delete data.$addToSet;
            }
            if (_.has(data, '$inc')) {
              _.forEach(data.$inc, function (incValue, key) {
                _.set(original, key, _.get(original, key, 0) + incValue);
              });
              delete data.$inc;
            }
            if (_.has(data, '$pushAll')) {
              _.forEach(data.$pushAll, function (values, key) {
                original[key] = addToSet(original[key] || [], values);
              });
              delete data.$pushAll;
            }
            var updated = _.extend({}, original);
            if (data.$set) {
              Object.keys(data.$set).forEach((key) => {
                _.set(updated, key, _.get(data.$set, key));
              });
            }
            if (data.$push) {
              Object.keys(data.$push).forEach((key) => {
                const prop = _.get(updated, key);
                if (Array.isArray(data.$push[key])) {
                  _.get(updated, key).push(...data.$push[key]);
                } else {
                  _.get(updated, key).push(data.$push[key]);
                }
              });
            }
            var conflict = state.findConflict(updated, original);
            if(conflict) {
              debug('conflict found %j', conflict);
              return callback(conflict);
            }
            _.merge(original, data.$set || {});
          }
          response.result.n = docs.length;
          response.result.ok = 1;
          response.result.nModified = docs.length;
          response.result.ops = [cloned];
          response.matchedCount= docs.length;
          response.modifiedCount = docs.length;
          response.upsertedCount = 0;
          response.upsertedId = [];
        }

        state.persist();
        callback(null, response);
      });

      if(typeof callback!=='function') {
        return new Promise(function (resolve,reject) {
          callback = function (e, r) { e? reject(e) : resolve(r) };
        })
      }
    },
    updateMany: function (selector, data, options, callback) {
      var opts = options || {};
      opts.multi = true;
      return this.update(selector, data, opts, callback);
    },
    updateOne: function (selector, data, options, callback) {
      var opts = options || {};
      opts.multi = false;
      return this.update(selector, data, opts, callback);
    },
    toJSON: function () {
      return state;
    }
  };
  interface.removeOne = interface.deleteOne;
  interface.removeMany = interface.deleteMany;
  interface.dropAllIndexes = interface.dropIndexes;
  return interface;
};
function NotImplemented(){
  throw Error('Not Implemented');
}
function cloneObjectIDs(value) {
  if (value instanceof ObjectId) {
    return ObjectId(value);
  } else if (value && value._bsontype === 'ObjectID') {
    return ObjectId(value.id);
  }
}
function first(query, collection) {
  return collection[sift.indexOf(query, collection)];
}

function find_options(args) {
  if(!args) args = [];
  var signature = Array.prototype.map.call(args, function(arg){ return Array.isArray(arg)? "array" : typeof arg }).join();
  var options = {
    query: args[0],
    fields: args[1],
    skip: 0,
    limit: 0,
    callback: /function$/.test(signature)? args[args.length-1] : undefined
  };
  switch(signature) {
    //callback?
    case "":
    case "undefined":
    case "function":
      options.query = {};
      options.fields = {};
      break;
    //selector, callback?,
    case "object":
    case "object,function":
      options.fields = {};
      break;
    //selector, fields, callback?
    //selector, options, callback?
    case "object,object":
    case "object,undefined,function":
    case "object,object,function":
      //sniff for a 1 or -1 to detect fields object
      if(!args[1] || Math.abs(args[1][0])===1) {
        options.fields = args[1];
      }
      else {
        if(args[1].skip) options.skip = args[1].skip;
        if(args[1].limit) options.limit = args[1].limit;
        if(args[1].fields) options.fields = args[1].fields;
      }
      break;
    //selector, fields, options, callback?
    case "object,object,object":
    case "object,object,object,function":
      if(args[2].skip) options.skip = args[2].skip;
      if(args[2].limit) options.limit = args[2].limit;
      if(args[2].fields) options.fields = args[2].fields;
      break;
    //selector, fields, skip, limit, timeout, callback?
    case "object,object,number,number,number":
    case "object,object,number,number,number,function":
      options.timeout = args[4];
    //selector, fields, skip, limit, callback?
    case "object,object,number,number":
    case "object,object,number,number,function":
      options.skip = args[2];
      options.limit = args[3];
      //if(typeof args[4]==="number") options.timeout = args[4];
      break;
    default:
      throw new Error("unknown signature: "+ signature);
  }
  return options;
}
