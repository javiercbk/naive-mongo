/* eslint-disable no-unused-vars, prefer-rest-params */
const _ = require('lodash');
const mingo = require('mingo');

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

class Collection {
  constructor(db, name) {
    this.db = db;
    this.name = name;
    this._data = [];
  }

  get collectionName() { return this.name; }
  get hit() { return NotImplemented(); }
  get name() { return this.name; }
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
    return wrapCall(() => {
      const mingoQuery = new mingo.Query(query, options);
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
    const mingoQuery = new mingo.Query(query);
    return new Cursor(mingoQuery.find(this._data));
  }
  findAndModify(query, sort, doc, options, callback) {
    const properOptions = typeof options === 'object' ? options : {};
    return wrapCall(() => {
      const mingoQuery = new mingo.Query(query);
      const cursor = mingoQuery.find(this._data);
      sortCursor(sort, cursor);
      const found = _.cloneDeep(cursor.first());
      if (found) {
        const index = this._data.findIndex(o => o._id.toString() === found._id.toString());
        if (properOptions.remove) {
          this._data.splice(index, 1);
          return {
            result: found,
          };
        }
        return this.updateOne({ _id: found._id }, doc).then((result) => {
          if (!properOptions.remove && properOptions.new) {
            return result;
          }
          return found;
        });
      } else if (properOptions.upsert) {
        return this.insert({}).then((result) => {
          const newId = result.result.insertedIds[0];
          return this.updateOne({ _id: newId }, doc);
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
        const index = this._data.findIndex(o => o._id.toString() === found._id.toString());
        this._data.splice(index, 1);
        return {
          result: found,
        };
      }
    });
  }
  findOne(query, options, callback)
}

module.exports = Collection;
