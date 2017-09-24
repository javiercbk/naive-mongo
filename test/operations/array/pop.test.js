/* global describe, it */
const chai = require('chai');
require('mocha');

const Db = require('../../../lib/db');

const { expect } = chai;

describe('Array $pop operation tests', () => {
  it('$pop first test', (done) => {
    const db = new Db('pop-test');
    const collection = db.collection('test');
    collection.insertOne({ _id: 1, a: [1, 2, 3, 4] })
      .then((doc) => {
        expect(doc).to.exist;
        return collection.updateOne({ _id: 1 }, { $pop: { a: -1 } });
      })
      .then((r) => {
        expect(r).to.exist;
        return collection.findOne({ _id: 1 });
      })
      .then((item) => {
        expect(1).to.eql(item._id);
        expect(item.a).to.exist;
        expect(3).to.eql(item.a.length);
        expect([2, 3, 4]).to.eql(item.a);
      })
      .then(() => { done(); })
      .catch(done);
  });

  it('$pop last test', (done) => {
    const db = new Db('pop-test');
    const collection = db.collection('test');
    collection.insertOne({ _id: 1, a: [1, 2, 3, 4] })
      .then((doc) => {
        expect(doc).to.exist;
        return collection.updateOne({ _id: 1 }, { $pop: { a: 1 } });
      })
      .then((r) => {
        expect(r).to.exist;
        return collection.findOne({ _id: 1 });
      })
      .then((item) => {
        expect(1).to.eql(item._id);
        expect(item.a).to.exist;
        expect(3).to.eql(item.a.length);
        expect([1, 2, 3]).to.eql(item.a);
      })
      .then(() => { done(); })
      .catch(done);
  });
});
