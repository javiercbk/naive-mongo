const bson = require('bson');
const moment = require('moment');
const MongoPath = require('../mongo-path');

const { Timestamp } = bson;

const currentDateOperation = (path, isoDate) => (object) => {
  const mongoPath = new MongoPath(path);
  let date = moment.utc().toDate();
  if (isoDate) {
    date = new Timestamp();
  }
  mongoPath.set(object, date);
};

const pushCurrentDateOperation = (update, operations) => {
  if (update.$currentDate) {
    Object.keys(update.$currentDate).forEach((path) => {
      const isoDate = typeof update.$currentDate[path] === 'boolean';
      operations.push(currentDateOperation(path, isoDate));
    });
  }
};

module.exports = pushCurrentDateOperation;
