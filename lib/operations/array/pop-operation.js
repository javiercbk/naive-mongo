const MongoPath = require('../mongo-path');

const popOperation = (path, last) => (object) => {
  const mongoPath = new MongoPath(path);
  const arr = mongoPath.get(object);
  if (arr && arr.length) {
    if (last) {
      arr.splice(arr.length - 1, 1);
    } else {
      arr.splice(0, 1);
    }
  }
};

const pushPopOperation = (update, operations) => {
  if (update.$pop) {
    Object.keys(update.$pop).forEach((path) => {
      const last = update.$pop[path] === 1;
      operations.push(popOperation(path, last));
    });
  }
};

module.exports = pushPopOperation;
