/* global describe, it */
const chai = require('chai');
require('mocha');

const Db = require('../../lib/db');

const { expect } = chai;

describe('insertOne tests', () => {
  it('InsertOne promise test', (done) => {
    const db = new Db('insert-one-test');
    const collection = db.collection('test');
    collection.insertOne({ a: 1 })
      .then((r) => {
        expect(1).to.eql(r.insertedCount);
      })
      .then(() => { done(); })
      .catch(done);
  });

  it('InsertOne callback test', (done) => {
    const db = new Db('insert-one-test');
    const collection = db.collection('test');
    collection.insertOne({ a: 1 }, (err, r) => {
      expect(err).to.not.exist;
      expect(1).to.eql(r.insertedCount);
      done();
    });
  });
});
