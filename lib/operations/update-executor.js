const _ = require('lodash');
const buildUpdateOperations = require('./update-operations');

class UpdateExecutor {
  constructor(update, isNew) {
    this.operations = buildUpdateOperations(update, isNew);
  }

  applyUpdate(object) {
    const clone = _.cloneDeep(object);
    try {
      this.operations.forEach(operation => operation(clone));
    } catch (e) {
      throw e;
    }
    return clone;
  }
}

module.exports = UpdateExecutor;
