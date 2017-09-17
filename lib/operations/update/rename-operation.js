const MongoPath = require('../mongo-path');

const renameOperation = (path, newPath) => (object) => {
  const mongoPath = new MongoPath(path);
  const newMongoPath = new MongoPath(newPath);
  const value = mongoPath.get(object);
  newMongoPath.set(object, value);
  mongoPath.unset(object);
};

const pushRenameOperation = (update, operations) => {
  if (update.$rename) {
    Object.keys(update.$rename).forEach((path) => {
      const newPath = typeof update.$rename[path];
      operations.push(renameOperation(path, newPath));
    });
  }
};

module.exports = pushRenameOperation;
