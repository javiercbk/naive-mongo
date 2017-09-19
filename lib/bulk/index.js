/* eslint-disable no-unused-vars, prefer-rest-params */
const Promise = require('bluebird');

const BulkWriteResult = require('./bulk-write-result');
const FindOperation = require('./find-operation');

class BulkOperation {
  constructor(collection) {
    this.collection = collection;
    this.operations = [];
    this.result = new BulkWriteResult();
  }

  get length() {
    return this.operations.length;
  }

  execute(options, callback) {
    let properCallback;
    if (arguments && arguments.length) {
      properCallback = arguments[arguments - 1];
      if (typeof properCallback !== 'function') {
        properCallback = null;
      }
    }
    return Promise.map(this.operations, (operation) => {

    }, { concurrency: 1 }).then(() => {
      if (properCallback) {
        properCallback(null, this.result);
      }
    }).catch((err) => {
      this.results.ok = 0;
      if (properCallback) {
        properCallback(err, this.result);
      }
      throw err;
    });
  }

  find(selector) {
    const findOperation = new FindOperation(this.collection, this.selector, this.result);
    this.operations.push({
      name: 'find',
      param: findOperation,
    });
  }

  insert(doc) {
    this.operations.push({
      name: 'insert',
      param: doc,
    });
  }

  __processOperations(ordered) {
    return Promise.map(this.operations, o => this._buildOperationPromise(o), { concurrency: 1 });
  }

  _buildOperationPromise(operation) {
    if (operation.name === 'find') {
      return operation.execute();
    }
    return this.collection.insert(operation.param).then((newDoc) => {
      this.result.__insertedDocs.push(newDoc);
      this.result.nInserted++;
      this.result.__lastOp = newDoc;
    });
  }
}

module.exports = BulkOperation;
