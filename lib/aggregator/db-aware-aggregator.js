const dbAwareOperations = require('./db-aware-operations');
const AsyncAggregator = require('./async-aggregator');

class DBAwareAggregator {
  constructor(operations, options, db) {
    this.aggregator = new AsyncAggregator(operations, options);
    dbAwareOperations(db);
  }

  run(collection, query = {}, callback) {
    return this.aggregator.run(collection, query, this.operations, callback);
  }
}

module.exports = DBAwareAggregator;
