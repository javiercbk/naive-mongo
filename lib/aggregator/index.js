const DBAwareAggregator = require('./db-aware-aggregator');

module.exports = (db, pipeline, options) =>
  new DBAwareAggregator(pipeline, options, db);
