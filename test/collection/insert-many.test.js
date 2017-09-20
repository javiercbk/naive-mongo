/* global describe, it */
const chai = require('chai');
require('mocha');

const Db = require('../../lib/db');

const { expect } = chai;

describe('insertMany tests', () => {
  it('InsertMany promise test', (done) => {
    const db = new Db('insert-many-test');
    const collection = db.collection('test');
    collection.insertMany([{ a: 1 }, { a: 2 }])
      .then((r) => {
        expect(2).to.eql(r.insertedCount);
      })
      .then(() => { done(); })
      .catch(done);
  });

  it('insertMany callback test', (done) => {
    const db = new Db('insert-many-test');
    const collection = db.collection('test');
    collection.insertMany([{ a: 1 }, { a: 2 }], (err, r) => {
      expect(err).to.not.exist;
      expect(2).to.eql(r.insertedCount);
      done();
    });
  });
});
