const MongoPath = require('../mongo-path');

const mulOperation = (path, mul) => (object) => {
  const mongoPath = new MongoPath(path);
  const value = mongoPath.get(object);
  mongoPath.set(object, value * mul);
};

const pushMulOperation = (update, operations) => {
  if (update.$mul) {
    Object.keys(update.$mul).forEach((path) => {
      const val = typeof update.$mul[path];
      operations.push(mulOperation(path, val));
    });
  }
};

module.exports = pushMulOperation;
