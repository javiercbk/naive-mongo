const _ = require('lodash');
const MongoPath = require('../mongo-path');

const pushIfMissing = (value, arr) => {
  let shouldAdd = false;
  if (typeof value === 'object') {
    const index = arr.findIndex(av => _.isEqual(av, value));
    shouldAdd = index === -1;
  } else if (arr.indexOf(value) === -1) {
    shouldAdd = true;
  }
  if (shouldAdd) {
    arr.push(value);
  }
};

const addToSetOperation = (path, value) => (object) => {
  const mongoPath = new MongoPath(path);
  const valArr = Array.isArray(value) ? value : [value];
  const arr = mongoPath.get(object);
  if (!arr) {
    mongoPath.set(object, valArr);
  } else {
    valArr.forEach((v) => {
      pushIfMissing(v, arr);
    });
  }
};

const pushAddToSetOperation = (update, operations) => {
  if (update.$addToSet) {
    Object.keys(update.$addToSet).forEach((path) => {
      const value = typeof update.$addToSet[path];
      operations.push(addToSetOperation(path, value));
    });
  }
};

module.exports = pushAddToSetOperation;
