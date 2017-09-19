class BulkWriteResult {
  constructor() {
    this.ok = 1;
    this.nInserted = 0;
    this.nUpdated = 0;
    this.nMatched = 0;
    this.nUpserted = 0;
    this.nModified = 0;
    this.nRemoved = 0;
    this.__insertedDocs = [];
    this.__updatedDocs = [];
    this.__upsertedDocs = [];
    this.__lastOp = null;
  }

  getInsertedIds() {
    return this.__insertedDocs.map(d => d._id);
  }

  getLastOp() {
    return this.__lastOp;
  }

  getRawResponse() {
    return {
      inserted: this.__insertedDocs,
      updated: this.__updatedDocs,
      upserted: this.__upsertedDocs,
    };
  }

  getUpsertedIdAt(index) {
    try {
      return this.__updatedDocs[index]._id;
    } catch (e) {
      return null;
    }
  }

  getUpsertedIds() {
    return this.__upsertedDocs.map(d => d._id);
  }

  getWriteConcernError() {
    return null;
  }

  getWriteErrorAt() {
    return null;
  }

  getWriteErrorCount() {
    return 0;
  }

  getWriteErrors() {
    return [];
  }

  hasWriteErrors() {
    return false;
  }
}

module.exports = BulkWriteResult;
