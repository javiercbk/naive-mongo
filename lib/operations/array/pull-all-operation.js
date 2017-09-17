const MongoPath = require('../mongo-path');

const pullAllOperation = (path, value) => (object) => {
  const mongoPath = new MongoPath(path);
  const arr = mongoPath.get(object);
  const values = Array.isArray(value) ? value : [value];
  if (arr && arr.length) {
    values.forEach((v) => {
      const i = arr.indexOf(v);
      if (i >= 0) {
        arr.splice(i, 1);
      }
    });
  }
};

const pushPullAllOperation = (update, operations) => {
  if (update.$pullAll) {
    Object.keys(update.$pullAll).forEach((path) => {
      const value = update.$pullAll[path];
      operations.push(pullAllOperation(path, value));
    });
  }
};

module.exports = pushPullAllOperation;
