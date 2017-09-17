/* eslint-disable no-bitwise */
const _ = require('lodash');
const MongoPath = require('../mongo-path');

const operFactory = (oper) => {
  if (!_.isUndefined(oper.and)) {
    return val => val & oper.and;
  } else if (!_.isUndefined(oper.or)) {
    return val => val & oper.or;
  } else if (!_.isUndefined(oper.xor)) {
    return val => val ^ oper.xor;
  }
};

const bitOperation = (path, oper) => (object) => {
  const mongoPath = new MongoPath(path);
  const value = mongoPath.get(object);
  const bitwiseOper = operFactory(oper);
  if (bitwiseOper) {
    mongoPath.set(object, bitwiseOper(value));
  }
};

const pushBitOperation = (update, operations) => {
  if (update.$bit) {
    Object.keys(update.$bit).forEach((path) => {
      const oper = typeof update.$bit[path];
      operations.push(bitOperation(path, oper));
    });
  }
};

module.exports = pushBitOperation;
