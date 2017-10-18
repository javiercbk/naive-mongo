const _ = require('lodash');
const Promise = require('bluebird');

const dbAwareOperations = db => ({
  $lookup: (col, lookup, cb) => {
    const joinCol = db.collection(lookup.from);
    Promise.map(col, (item) => {
      const filter = {};
      const value = _.get(item, lookup.localField);
      _.set(filter, lookup.foreignField, value);
      return joinCol.find(filter).toArray().then((items) => {
        _.set(item, lookup.as, items);
        return item;
      });
    }).then((transformed) => {
      cb(null, transformed);
    }).catch((err) => {
      cb(err);
    });
  },
});

module.exports = dbAwareOperations;
