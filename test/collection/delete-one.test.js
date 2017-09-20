/* global describe, it */
const chai = require('chai');
require('mocha');

const Db = require('../../lib/db');

const { expect } = chai;

describe('deleteOne tests', () => {
  it('deleteOne promise test', (done) => {
    const db = new Db('delete-many-test');
    const collection = db.collection('test');
    collection.insertMany([{ a: 1 }, { b: 2 }], { w: 1 })
      .then((r) => {
        expect(r).to.exist;
        return collection.deleteOne();
      })
      .then(() => collection.find().toArray())
      .then((items) => {
        expect(1).to.eql(items.length);
      })
      .then(() => { done(); })
      .catch(done);
  });

  it('deleteOne callback test', (done) => {
    const db = new Db('delete-many-test');
    const collection = db.collection('test');
    collection.insertMany([{ a: 1 }, { b: 2 }], { w: 1 }, (err, r) => {
      expect(err).to.not.exist;
      expect(r).to.exist;
      collection.deleteOne((err1, r1) => {
        expect(err1).to.not.exist;
        expect(r1).to.exist;
        collection.find().toArray((err2, items) => {
          expect(err2).to.not.exist;
          expect(1).to.eql(items.length);
        });
      });
      done();
    });
  });
});
