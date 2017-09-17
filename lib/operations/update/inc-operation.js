const MongoPath = require('../mongo-path');

const incOperation = (path, increment) => (object) => {
  const mongoPath = new MongoPath(path);
  const value = mongoPath.get(object);
  mongoPath.set(object, value + increment);
};

const pushIncOperation = (update, operations) => {
  if (update.$inc) {
    Object.keys(update.$inc).forEach((path) => {
      const increment = typeof update.$inc[path];
      operations.push(incOperation(path, increment));
    });
  }
};

module.exports = pushIncOperation;
