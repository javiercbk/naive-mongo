/* eslint-disable no-unused-vars, prefer-rest-params */
const _ = require('lodash');
const mingo = require('mingo');
const bson = require('bson');

const BulkOperation = require('./bulk');
const UpdateExecutor = require('./operations/update-executor');

const Cursor = require('./cursor');

const { deleteOperationResult, promiseOrCallback, wrapCall } = require('./collection-utils');

const NotImplemented = () => {
  throw Error('Not Implemented. PR welcome!');
};

const __delete = (self, toDelete) => {
  const toDeleteLen = toDelete.length;
  if (toDeleteLen) {
    const ids = toDelete.map(o => o._id.toString());
    _.remove(self._data, (o) => {
      ids.indexOf(o._id.toString());
    });
  }
  return deleteOperationResult(toDeleteLen);
};

const sortCursor = (sort, cursor) => {
  if (sort && sort.length) {
    const sortObject = sort.map((s) => {
      const key = s[0];
      const val = s[1];
      const obj = {};
      obj[key] = val;
      return obj;
    }).reduce((prev, cur) => Object.assign({}, prev, cur), {});
    cursor.sort(sortObject);
  }
};

const _findIndex = (data, obj) => data.findIndex(o => o._id.toString() === obj._id.toString());

const _buildCursor = (data, filter, options) => {
  const properOptions = typeof options === 'object' ? options : {};
  const mingoQuery = new mingo.Query(filter);
  if (properOptions.limit) {
    mingoQuery.limit(properOptions.limit);
  }
  if (properOptions.sort) {
    mingoQuery.sort(properOptions.sort);
  }
  if (properOptions.skip) {
    mingoQuery.skip(properOptions.skip);
  }
  return mingoQuery.find(data);
};

const _indexesByQuery = (data, filter, options) => {
  const cursor = _buildCursor(data, filter, options);
  const all = cursor.all();
  return all.map(d => _findIndex(data, d));
};

const _indexByQuery = (data, filter, options) => {
  const cursor = _buildCursor(data, filter, options);
  const first = cursor.first();
  if (first) {
    return _findIndex(data, first);
  }
  return -1;
};

class Collection {
  constructor(db, name) {
    this.db = db;
    this.name = name;
    this._data = [];
  }

  get collectionName() { return this.name; }
  get hit() { return NotImplemented(); }
  get name() { return this._name; }
  set name(name) { this._name = name; }
  get namespace() { return `${this.db.databaseName}.${this.name}`; }
  get writeConcern() { return NotImplemented(); }
  aggregate(pipeline, options, callback) {
    const self = this;
    return wrapCall(() => {
      const agg = new mingo.Aggregator(pipeline, options);
      return agg.run(self._data);
    }, arguments);
  }
  bulkWrite() {
    /*
    { insertOne: { document: { a: 1 } } }
  { updateOne: { filter: {a:2}, update: {$set: {a:2}}, upsert:true } }
  { updateMany: { filter: {a:2}, update: {$set: {a:2}}, upsert:true } }
  { deleteOne: { filter: {c:1} } }
  { deleteMany: { filter: {c:1} } }
  { replaceOne: { filter: {c:3}, replacement: {c:4}, upsert:true}}
    */
    return NotImplemented();
  }
  count(query, options, callback) {
    const self = this;
    const q = {};
    if (typeof query === 'object') {
      Object.assign(q, query);
    }
    return wrapCall(() => {
      const mingoQuery = new mingo.Query(q, options);
      const cursor = mingoQuery.find(self._data);
      return cursor.count();
    }, arguments);
  }
  createIndex() {
    return wrapCall(() => ({ ok: 1 }), arguments);
  }
  createIndexes() {
    return wrapCall(() => ({ ok: 1 }), arguments);
  }
  deleteMany(query, options, callback) {
    const self = this;
    return wrapCall(() => {
      const mingoQuery = new mingo.Query(query, options);
      const cursor = mingoQuery.find(self._data);
      const toDelete = cursor.all();
      return __delete(self, toDelete);
    }, arguments);
  }
  deleteOne(query, options, callback) {
    const self = this;
    return wrapCall(() => {
      const mingoQuery = new mingo.Query(query, options);
      const cursor = mingoQuery.find(self._data);
      const toDelete = cursor.first();
      return __delete(self, toDelete);
    }, arguments);
  }
  distinct() {
    return NotImplemented();
  }
  drop() {
    this._data.length = 0;
    return wrapCall(() => ({ ok: 1 }), arguments);
  }
  dropIndex() {
    return wrapCall(() => ({ ok: 1 }), arguments);
  }
  dropIndexes() {
    return wrapCall(() => ({ ok: 1 }), arguments);
  }
  ensureIndex() {
    return wrapCall(() => ({ ok: 1 }), arguments);
  }
  find(query) {
    return new Cursor(this._data, query);
  }
  findAndModify(query, sort, doc, options, callback) {
    const properOptions = typeof options === 'object' ? options : {};
    return wrapCall(() => {
      const mingoQuery = new mingo.Query(query);
      const cursor = mingoQuery.find(this._data);
      sortCursor(sort, cursor);
      const found = _.cloneDeep(cursor.first());
      if (found) {
        const index = _findIndex(this._data, found);
        if (properOptions.remove) {
          this._data.splice(index, 1);
          return {
            value: found,
            ok: 1,
          };
        }
        return this.updateOne({ _id: found._id }, doc).then((result) => {
          if (!properOptions.remove && properOptions.new) {
            return {
              value: result.__updateResult,
              ok: 1,
            };
          }
          return {
            value: found,
            ok: 1,
          };
        });
      } else if (properOptions.upsert) {
        return this.insert({}).then((result) => {
          const newId = result.insertedIds[0];
          return this.updateOne({ _id: newId }, doc).then(updateOneResult => ({
            value: updateOneResult.__updateResult,
            ok: 1,
          }));
        });
      }
    }, arguments);
  }
  findAndRemove(query, sort, options, callback) {
    return wrapCall(() => {
      const mingoQuery = new mingo.Query(query);
      const cursor = mingoQuery.find(this._data);
      sortCursor(sort, cursor);
      const found = cursor.first();
      if (found) {
        const index = _findIndex(this._data, found);
        this._data.splice(index, 1);
        return {
          value: found,
          ok: 1,
          lastErrorObject: null,
        };
      }
    }, arguments);
  }
  findOne(query, options, callback) {
    return wrapCall(() => {
      const index = _indexByQuery(this._data, query, options);
      if (index === -1) {
        return null;
      }
      return this._data[index];
    }, arguments);
  }
  findOneAndDelete(filter, options, callback) {
    return wrapCall(() => {
      const index = _indexByQuery(this._data, filter, options);
      return this._data.splice(index, 1);
    }, arguments);
  }
  findOneAndReplace(filter, replacement, options, callback) {
    return wrapCall(() => {
      const upsert = _.get(options, 'upsert', false);
      const index = _indexByQuery(this._data, filter, options);
      const replaced = this._data[index];
      this._data[index] = replacement;
      return {
        value: replaced,
        ok: 1,
        lastErrorObject: null,
      };
    }, arguments);
  }
  findOneAndUpdate(filter, update, options, callback) {
    return wrapCall(() => {
      const upsert = _.get(options, 'upsert', false);
      const returnOriginal = _.get(options, 'returnOriginal', false);
      const index = _indexByQuery(this._data, filter, options);
      if (index === -1) {
        if (upsert) {
          const updateExecutor = new UpdateExecutor(update, true);
          const newDocument = updateExecutor.applyUpdate({});
          this._data.push(newDocument);
          return {
            value: newDocument,
            ok: 1,
          };
        }
        return {
          ok: 0,
          lastErrorObject: new Error('Document not found'),
        };
      }
      const toUpdate = this._data[index];
      const updateExecutor = new UpdateExecutor(update, false);
      const updatedDocument = updateExecutor.applyUpdate(toUpdate);
      this._data[index] = updatedDocument;
      return {
        value: returnOriginal ? toUpdate : updatedDocument,
        ok: 1,
      };
    }, arguments);
  }
  geoHaystackSearch(x, y, options, callback) {
    return NotImplemented();
  }
  geoNear(x, y, options, callback) {
    return NotImplemented();
  }
  group(keys, condition, initial, reduce, finalize, command, options, callback) {
    return NotImplemented();
  }
  indexes(callback) {
    return NotImplemented();
  }
  indexExists(indexes, callback) {
    return NotImplemented();
  }
  indexInformation(options, callback) {
    return NotImplemented();
  }
  initializeOrderedBulkOp(options, callback) {
    return new BulkOperation(this, options, callback);
  }
  initializeUnorderedBulkOp(options) {
    return new BulkOperation(this, options);
  }
  insert(docs, options, callback) {
    const forceServerObjectId = _.get(options, 'forceServerObjectId', false);
    return wrapCall(() => {
      let allDocs;
      let isSingle = false;
      if (!Array.isArray(docs)) {
        allDocs = [docs];
        isSingle = true;
      } else {
        allDocs = docs;
      }
      const toInsert = allDocs.map((doc) => {
        const d = _.cloneDeep(doc);
        if (!doc._id || forceServerObjectId) {
          d._id = new bson.ObjectID();
        }
        return d;
      });
      toInsert.forEach((doc) => {
        this._data.push(doc);
      });
      return {
        insertedCount: toInsert.length,
        ops: isSingle ? toInsert[0] : toInsert,
        insertedIds: toInsert.map(d => d._id),
        connection: this,
        result: {
          ok: 1,
          n: toInsert.length,
        },
      };
    }, arguments);
  }
  insertMany(docs, options, callback) {
    return this.insert(...arguments);
  }
  insertOne(doc, options, callback) {
    return this.insert(...arguments);
  }
  isCapped(callback) {
    return wrapCall(() => false, arguments);
  }
  listIndexes(options) {
    return NotImplemented();
  }
  mapReduce(map, reduce, options, callback) {
    return NotImplemented();
  }
  options(callback) {
    return wrapCall(() => [], arguments);
  }
  parallelCollectionScan(options, callback) {
    return NotImplemented();
  }
  reIndex(callback) {
    return wrapCall(() => false, arguments);
  }
  remove(selector, options, callback) {
    return wrapCall(() => {
      const docs = _buildCursor(this._data, selector, options).all();
      docs.forEach((doc) => {
        const index = _findIndex(this._data, doc);
        this._data.splice(index, 1);
      });
      return {
        ops: docs,
        connection: this,
        result: {
          ok: 1,
        },
      };
    }, arguments);
  }
  rename(newName, options, callback) {
    return wrapCall(() => this, arguments);
  }
  replaceOne(filter, doc, options, callback) {
    return this.findOneAndReplace(...arguments);
  }

  save(doc, options, callback) {
    return this.insert(...arguments);
  }

  stats(options, callback) {
    return wrapCall(() => [], arguments);
  }

  update(selector, document, options, callback) {
    const multi = _.get(options, 'multi', false);
    let properCallback = arguments[arguments.length - 1];
    if (typeof properCallback !== 'function') {
      properCallback = null;
    }
    const onResolve = (result) => {
      const oldUpdate = {
        ops: result,
        result: result.result,
      };
      if (properCallback) {
        properCallback(oldUpdate);
      }
      return oldUpdate;
    };
    if (multi) {
      return this.updateMany(selector, document, options).then(onResolve);
    }
    return this.updateOne(selector, document, options, callback).then(onResolve);
  }

  updateMany(filter, update, options, callback) {
    return wrapCall(() => {
      const upsert = _.get(options, 'upsert', false);
      const mingoQuery = new mingo.Query(filter);
      const allDocumentsToUpdate = mingoQuery.find(this._data).all();
      if (allDocumentsToUpdate.length) {
        allDocumentsToUpdate.forEach((doc) => {
          const updateExecutor = new UpdateExecutor(update, false);
          const newDocument = updateExecutor.applyUpdate(doc);
          const index = _findIndex(this._data, doc);
          this._data[index] = newDocument;
        });
        return {
          result: {
            n: allDocumentsToUpdate.length,
            ok: 1,
          },
          connection: this,
          matchedCount: allDocumentsToUpdate.length,
          modifiedCount: allDocumentsToUpdate.length,
          upsertedCount: 0,
        };
      } else if (upsert) {
        const updateExecutor = new UpdateExecutor(update, true);
        const newDocument = updateExecutor.applyUpdate({});
        this._data.push(newDocument);
        return {
          result: {
            n: 1,
            ok: 1,
          },
          connection: this,
          matchedCount: 0,
          modifiedCount: 0,
          upsertedCount: 1,
          upsertedId: {
            _id: newDocument._id,
          },
        };
      }
      return {
        result: {
          ok: 0,
          lastErrorObject: new Error('Document not found'),
        },
      };
    }, arguments);
  }

  updateOne(filter, update, options, callback) {
    return wrapCall(() => {
      const upsert = _.get(options, 'upsert', false);
      const mingoQuery = new mingo.Query(filter);
      const doc = mingoQuery.find(this._data).first();
      if (doc) {
        const updateExecutor = new UpdateExecutor(update, false);
        const newDocument = updateExecutor.applyUpdate(doc);
        const index = _findIndex(this._data, doc);
        this._data[index] = newDocument;
        return {
          result: {
            n: 1,
            ok: 1,
          },
          connection: this,
          matchedCount: 1,
          modifiedCount: 1,
          upsertedCount: 0,
          __updateResult: newDocument,
        };
      } else if (upsert) {
        const updateExecutor = new UpdateExecutor(update, true);
        const newDocument = updateExecutor.applyUpdate({});
        this._data.push(newDocument);
        return {
          result: {
            n: 1,
            ok: 1,
          },
          connection: this,
          matchedCount: 0,
          modifiedCount: 0,
          upsertedCount: 1,
          upsertedId: {
            _id: newDocument._id,
          },
        };
      }
      return {
        result: {
          ok: 0,
          lastErrorObject: new Error('Document not found'),
        },
      };
    }, arguments);
  }
}

module.exports = Collection;
