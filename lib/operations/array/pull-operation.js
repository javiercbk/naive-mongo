const _ = require('lodash');
const mingo = require('../../mingo');
const MongoPath = require('../mongo-path');

const pullOperation = (path, query) => (object) => {
  const mongoPath = new MongoPath(path);
  const arr = mongoPath.get(object);
  if (arr && arr.length) {
    const mingoQuery = new mingo.Query(query);
    const matching = mingoQuery.find(arr).all();
    if (matching && matching.length) {
      matching.forEach((m) => {
        const index = arr.findIndex(av => _.isEqual(av, m));
        arr.splice(index, 1);
      });
    }
  }
};

const pushPullOperation = (update, operations) => {
  if (update.$pull) {
    Object.keys(update.$pull).forEach((path) => {
      let query = update.$pull[path];
      if (typeof query === 'string') {
        // transform the simple string into a query
        query = { $in: [query] };
      }
      operations.push(pullOperation(path, query));
    });
  }
};

module.exports = pushPullOperation;
