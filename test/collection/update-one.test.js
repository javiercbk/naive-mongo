/* global describe, it */
const chai = require('chai');
require('mocha');

const Db = require('../../lib/db');

const { expect } = chai;

describe('updateOne tests', () => {
  it('UpdateOne promise test', (done) => {
    const db = new Db('update-one-test');
    const collection = db.collection('test');
    collection.insertOne({ a: 1 }, { w: 1 })
      .then((doc) => {
        expect(doc).to.exist;
        return collection.updateOne({ a: 1 }, { $set: { b: 2 } });
      })
      .then((r) => {
        expect(r).to.exist;
        return collection.findOne({ a: 1 });
      })
      .then((item) => {
        expect(1).to.eql(item.a);
        expect(2).to.eql(item.b);
      })
      .then(() => { done(); })
      .catch(done);
  });

  it('UpdateOne callback test', (done) => {
    const db = new Db('update-one-test');
    const collection = db.collection('test');
    collection.insertOne({ a: 1 }, { w: 1 }, (err, doc) => {
      expect(err).to.not.exist;
      expect(doc).to.exist;
      // Update the document with an atomic operator
      collection.updateOne({ a: 1 }, { $set: { b: 2 } }, (err1, r) => {
        expect(err1).to.not.exist;
        expect(r).to.exist;
        return collection.findOne({ a: 1 }, (err2, item) => {
          expect(err2).to.not.exist;
          expect(1).to.eql(item.a);
          expect(2).to.eql(item.b);
          done();
        });
      });
    });
  });

  it('UpdateOne upsert', (done) => {
    const db = new Db('update-one-test');
    const collection = db.collection('test');
    collection.updateOne({ a: 1 }, { b: 2, a: 1 }, { upsert: true })
      .then((r) => {
        expect(r).to.exist;
        expect(r.result).to.exist;
        expect(1, r.result.n);
        return collection.findOne({ a: 1 });
      })
      .then((item) => {
        expect(1).to.eql(item.a);
        expect(2).to.eql(item.b);
      })
      .then(() => { done(); })
      .catch(done);
  });

  it('UpdateOne upsert with $set', (done) => {
    const db = new Db('update-one-test');
    const collection = db.collection('test');
    collection.updateOne({ a: 1 }, { $set: { a: 2 } }, { upsert: true })
      .then((r) => {
        expect(r).to.exist;
        expect(r.result).to.exist;
        expect(0).to.eql(r.matchedCount);
        expect(1).to.eql(r.upsertedCount);
        return collection.findOne({ a: 2 });
      })
      .then((item) => {
        expect(2).to.eql(item.a);
      })
      .then(() => { done(); })
      .catch(done);
  });
});
