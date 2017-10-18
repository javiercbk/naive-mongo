const { Aggregator } = require('../mingo');


const wrapAggregate = (col, oper, cb) => cb(null, new Aggregator([oper]).run(col));

const wrapInCallback = (func, oper) => (col, cb) => {
  func(col, oper, cb);
};

/**
 * Aggregator for defining filter using mongoDB aggregation pipeline syntax
 *
 * @param {Object[]} operators an Array of pipeline operators
 * @constructor
 */
class AsyncAggregator {
  constructor(operators) {
    this.__operators = operators;
  }

  /**
   * Asynchronically apply the pipeline operations over the collection
   * by order of the sequence added
   *
   * @param collection an array of objects to process
   * @param query the `Query` object to use as context
   * @param {Object<string, function>} moreOperations additional operators object.
   * Each property is an additional operation and they must be functions that
   * execute the operation. The function is given the collection, the operator
   * and a callback function that receives the new collection.
   * @param {Function} callback to be called with the collection
   */
  run(collection, query, moreOperations = {}, callback) {
    let moreOperationsNames = [];
    if (moreOperations) {
      if (typeof moreOperations === 'object') {
        moreOperationsNames = Object.keys(moreOperations);
      } else if (typeof moreOperations === 'function') {
        callback = moreOperations;
      }
    }
    if (!callback || typeof callback !== 'function') {
      throw new Error('No callback provided');
    }
    if (this.__operators.length > 0) {
      // run aggregation pipeline
      const operationCallbacks = [];
      try {
        this.__operators.forEach((operator) => {
          let func;
          let key = Object.keys(operator);
          [key] = key;
          if (moreOperationsNames.indexOf(key) >= 0) {
            func = wrapInCallback(moreOperations[key], operator[key]);
          } else {
            func = wrapInCallback(wrapAggregate, operator);
          }
          operationCallbacks.push(func);
        });
        this._exhaustOperations(collection, operationCallbacks, callback, 0);
      } catch (err) {
        callback(err);
      }
    } else {
      callback(collection);
    }
  }

  _exhaustOperations(collection, operationCallbacks, callback, i) {
    if (operationCallbacks.length > i) {
      const func = operationCallbacks[i];
      func(collection, (err, newCollection) => {
        if (err) {
          callback(err);
        } else {
          this._exhaustOperations(newCollection, operationCallbacks, callback, i + 1);
        }
      });
    } else {
      callback(null, collection);
    }
  }
}

module.exports = AsyncAggregator;
