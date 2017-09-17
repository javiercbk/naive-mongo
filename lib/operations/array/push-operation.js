const _ = require('lodash');
const { MongoError } = require('mongodb-core');
const MongoPath = require('../mongo-path');

const pushFactory = (originalArray, value) => {
  let arr = originalArray.slice(0);
  if (value.$each) {
    if (value.$position) {
      const len = arr.length;
      const first = arr.slice(0, value.$position);
      const last = arr.slice(value.$position, len - 1);
      first.concat(value.$each).concat(last);
    } else {
      value.$each.forEach((v) => { arr.push(v); });
    }
    if (value.$slice) {
      const len = arr.length;
      if (value.$slice === 0) {
        // Zero update the array <field> to an empty array.
        arr.length = 0;
      } else if (value.$slice < 0) {
        // Negative update the array <field> to contain only the last <num> elements.
        const lastN = len + value.$slice;
        arr = arr.slice(0, lastN);
      } else {
        // Positive To update the array <field> contain only the first <num> elements.
        arr = arr.slice(0, value.$slice);
      }
    }
    if (value.$sort) {
      const keys = Object.keys(value.$sort);
      // FIXME ignoring more sort conditions.
      const sort = keys[0];
      arr = _.sortBy(arr, o => o[sort]);
    }
  } else {
    arr.push(value);
  }
  return arr;
};

const pushOperation = (path, value) => (object) => {
  const mongoPath = new MongoPath(path);
  const arr = mongoPath.get(object) || [];
  if (Array.isArray(arr)) {
    mongoPath.set(object, pushFactory(arr, value));
  } else {
    throw new MongoError(`Property with path "${path}" is not an array`);
  }
};

const pushPushOperation = (update, operations) => {
  if (update.$push) {
    Object.keys(update.$push).forEach((path) => {
      const value = typeof update.$push[path];
      operations.push(pushOperation(path, value));
    });
  }
};

module.exports = pushPushOperation;
