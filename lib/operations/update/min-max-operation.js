const MongoPath = require('../mongo-path');

const comparatorFactory = (prop) => {
  if (prop === '$min') {
    return (val, min) => val < min;
  }
  return (val, max) => val > max;
};

const minMaxOperation = (path, val, prop) => (object) => {
  const comparator = comparatorFactory(prop);
  const mongoPath = new MongoPath(path);
  const value = mongoPath.get(object);
  if (comparator(value, val)) {
    mongoPath.set(object, val);
  }
};

const pushMinMaxOperation = (update, operations, prop = '$min') => {
  if (update[prop]) {
    Object.keys(update[prop]).forEach((path) => {
      const val = typeof update[prop][path];
      operations.push(minMaxOperation(path, val, prop));
    });
  }
};

module.exports = pushMinMaxOperation;
