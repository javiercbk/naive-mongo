class FindOperation {
  constructor(bulkOperation, collection, selector, result) {
    this.bulkOperation = bulkOperation;
    this.collection = collection;
    this.selector = selector;
    this.result = result;
    this.updateOptions = {};
    this.operations = [];
  }

  execute() {
    return Promise.map(this.operations, o => this._buildOperationPromise(o), { concurrency: 1 });
  }

  // Added to support unordered api
  remove() {
    this.operations.push({
      name: 'delete',
    });
    return this.bulkOperation;
  }

  // Added to support unordered api
  removeOne() {
    this.operations.push({
      name: 'deleteOne',
    });
    return this.bulkOperation;
  }

  delete() {
    this.operations.push({
      name: 'delete',
    });
    return this.bulkOperation;
  }

  deleteOne() {
    this.operations.push({
      name: 'deleteOne',
    });
    return this.bulkOperation;
  }

  replaceOne(doc) {
    this.operations.push({
      name: 'replaceOne',
      params: doc,
    });
    return this.bulkOperation;
  }

  update(doc) {
    this.operations.push({
      name: 'update',
      params: doc,
    });
    return this.bulkOperation;
  }

  updateOne(doc) {
    this.operations.push({
      name: 'updateOne',
      params: doc,
    });
    return this.bulkOperation;
  }

  upsert() {
    this.updateOptions = {
      upsert: true,
    };
    return this;
  }

  _buildOperationPromise(operation) {
    switch (operation.name) {
      case 'delete':
        return this.collection.deleteMany(this.selector).then((deletedResult) => {
          this.result.nRemoved += deletedResult.result.n;
          return deletedResult;
        });
      case 'deleteOne':
        return this.collection.deleteOne(this.selector).then(() => {
          this.result.nRemoved++;
        });
      case 'replaceOne':
        return this.collection.replaceOne(this.selector, operation.params).then(() => {
          this.result.nModified++;
        });
      case 'update':
        return this.collection.updateMany(this.selector, operation.params, this.updateOptions)
          .then((updateResult) => {
            if (updateResult.modifiedCount) {
              this.result.nModified += updateResult.modifiedCount;
            }
            if (updateResult.upsertedCount) {
              this.result.nUpserted += updateResult.upsertedCount;
            }
          });
      case 'updateOne':
        return this.collection.updateOne(this.selector, operation.params, this.updateOptions)
          .then((updateResult) => {
            if (updateResult.modifiedCount) {
              this.result.nModified += updateResult.modifiedCount;
            }
            if (updateResult.upsertedCount) {
              this.result.nUpserted += updateResult.upsertedCount;
            }
          });
      default:
        return null;
    }
  }
}

module.exports = FindOperation;
