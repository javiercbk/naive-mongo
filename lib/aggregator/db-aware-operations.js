const { addOperators, OP_PIPELINE, OP_EXPRESSION } = require('../mingo');
const _ = require('lodash');
const Promise = require('bluebird');

const dbAwareOperations = (db) => {
  addOperators(OP_EXPRESSION, internal => ({
    $add: (obj, expr) => {
      let args = internal.computeValue(obj, expr);
      const date = args.find(argument => argument instanceof Date);
      if (date) {
        args = args.map((argument) => {
          if (argument instanceof Date) {
            return argument.getTime();
          }
          return argument;
        });
      }
      const reduced = internal.reduce(args, (acc, num) => {
        return acc + num;
      }, 0);
      if (date) {
        return new Date(reduced);
      }
      return reduced;
    },
  }));
  addOperators(OP_PIPELINE, () => ({
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
  }));
};

module.exports = dbAwareOperations;
