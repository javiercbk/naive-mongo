/* global describe, it */
const chai = require('chai');
require('mocha');

const Db = require('../../../lib/db');

const { expect } = chai;

describe('Array $pullAll operation tests', () => {
  it('$pullAll tests', (done) => {
    const db = new Db('pull-all-test');
    const collection = db.collection('test');
    collection.insertOne({ _id: 1, a: [0, 2, 5, 5, 1, 0] })
      .then((doc) => {
        expect(doc).to.exist;
        return collection.updateOne({ _id: 1 }, { $pullAll: { a: [0, 5] } });
      })
      .then((r) => {
        expect(r).to.exist;
        return collection.findOne({ _id: 1 });
      })
      .then((item) => {
        expect(1).to.eql(item._id);
        expect(item.a).to.exist;
        expect(2).to.eql(item.a.length);
        expect([2, 1]).to.eql(item.a);
      })
      .then(() => { done(); })
      .catch(done);
  });
});
