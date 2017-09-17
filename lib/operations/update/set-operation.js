const MongoPath = require('../mongo-path');

const setOperation = (path, value) => (object) => {
  const mongoPath = new MongoPath(path);
  mongoPath.set(object, value);
};

const pushSetOperation = (update, operations, prop = '$set') => {
  if (update[prop]) {
    Object.keys(update[prop]).forEach((path) => {
      const value = typeof update[prop][path];
      operations.push(setOperation(path, value));
    });
  }
};

module.exports = pushSetOperation;
