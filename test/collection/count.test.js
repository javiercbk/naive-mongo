/* global describe, it */
const chai = require('chai');
require('mocha');

const Db = require('../../lib/db');

const { expect } = chai;

describe('count tests', () => {
  it('Count promise test', (done) => {
    const db = new Db('count-test');
    const collection = db.collection('test');
    collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }, { a: 4, b: 1 }], { w: 1 })
      .then(() => collection.count())
      .then((count) => {
        expect(4).to.eql(count);
      })
      .then(() => collection.count({ b: 1 }))
      .then((count) => {
        expect(1).to.eql(count);
        done();
      })
      .catch(done);
  });

  it('Count callback test', (done) => {
    const db = new Db('count-test');
    const collection = db.collection('test');
    collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }, { a: 4, b: 1 }], (err, insertResults) => {
      expect(err).to.not.exist;
      expect(insertResults).to.exist;
      collection.count((err1, count) => {
        expect(err1).to.not.exist;
        expect(4).to.eql(count);
        collection.count({ b: 1 }, (err2, count2) => {
          expect(err2).to.not.exist;
          expect(1).to.eql(count2);
          done();
        });
      });
    });
  });
});
