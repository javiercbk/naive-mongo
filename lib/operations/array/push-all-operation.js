const MongoPath = require('../mongo-path');

const pushAllOperation = (path, value) => (object) => {
  const mongoPath = new MongoPath(path);
  const arr = mongoPath.get(object);
  const valArr = Array.isArray(value) ? value : [value];
  if (!arr) {
    mongoPath.set(object, valArr);
  } else {
    valArr.forEach((v) => {
      arr.push(v);
    });
  }
};

const pushPushAllOperation = (update, operations) => {
  if (update.$pushAll) {
    Object.keys(update.$pushAll).forEach((path) => {
      const value = typeof update.$pushAll[path];
      operations.push(pushAllOperation(path, value));
    });
  }
};

module.exports = pushPushAllOperation;
