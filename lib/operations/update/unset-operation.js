const MongoPath = require('../mongo-path');

const unsetOperation = path => (object) => {
  const mongoPath = new MongoPath(path);
  mongoPath.unset(object);
};

const pushUnsetOperation = (update, operations) => {
  if (update.$unset) {
    Object.keys(update.$unset).forEach((path) => {
      operations.push(unsetOperation(path));
    });
  }
};

module.exports = pushUnsetOperation;
