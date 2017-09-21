/* global describe, it */
const chai = require('chai');
require('mocha');

const Db = require('../../lib/db');

const { expect } = chai;

describe('updateMany tests', () => {
  it('UpdateMany promise test', (done) => {
    const db = new Db('update-many-test');
    const collection = db.collection('test');
    collection.insertMany([{ a: 1, b: 1 }, { a: 1, b: 2 }])
      .then((result) => {
        expect(result).to.exist;
        return collection.updateMany({ a: 1 }, { $set: { b: 0 } });
      })
      .then((r) => {
        expect(2).to.eql(r.result.n);
        return collection.find().toArray();
      })
      .then((items) => {
        expect(1).to.eql(items[0].a);
        expect(0).to.eql(items[0].b);
        expect(1).to.eql(items[1].a);
        expect(0).to.eql(items[1].b);
      })
      .then(() => { done(); })
      .catch(done);
  });

  it('UpdateMany callback test', (done) => {
    const db = new Db('update-many-test');
    const collection = db.collection('test');
    collection.insertMany([{ a: 1, b: 1 }, { a: 1, b: 2 }], (err, result) => {
      expect(err).to.not.exist;
      expect(result).to.exist;
      collection.updateMany({ a: 1 }, { $set: { b: 0 } }, (err1, r) => {
        expect(err1).to.not.exist;
        expect(2).to.eql(r.result.n);
        collection.find().toArray((err2, items) => {
          expect(err2).to.not.exist;
          expect(1).to.eql(items[0].a);
          expect(0).to.eql(items[0].b);
          expect(1).to.eql(items[1].a);
          expect(0).to.eql(items[1].b);
          done();
        });
      });
    });
  });
});
