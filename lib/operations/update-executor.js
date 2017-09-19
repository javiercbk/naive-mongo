const _ = require('lodash');
const bson = require('bson');
const buildUpdateOperations = require('./update-operations');

class UpdateExecutor {
  constructor(update, isNew) {
    this.operations = buildUpdateOperations(update, isNew);
    this.isNew = isNew;
  }

  applyUpdate(object) {
    const clone = _.cloneDeep(object);
    if (this.isNew) {
      clone._id = new bson.ObjectID();
    }
    try {
      this.operations.forEach(operation => operation(clone));
    } catch (e) {
      throw e;
    }
    return clone;
  }
}

module.exports = UpdateExecutor;
