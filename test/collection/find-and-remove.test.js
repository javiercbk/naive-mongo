/* eslint-disable function-paren-newline */
/* global describe, it */
const chai = require('chai');
require('mocha');

const Db = require('../../lib/db');

const { expect } = chai;

describe('findAndRemove tests', () => {
  it('FindAndRemove promise test', (done) => {
    const db = new Db('find-and-remove-test');
    const collection = db.collection('test');
    collection.insertMany([{ a: 1 }, { b: 1, d: 1 }, { c: 1 }], { w: 1 })
      .then((result) => {
        expect(result).to.exist;
        return collection.findAndRemove({ b: 1 }, [['b', 1]]);
      })
      .then((doc) => {
        expect(doc).to.exist;
        expect(1).to.eql(doc.value.b);
        expect(1).to.eql(doc.value.d);
        return collection.findOne({ b: 1 });
      })
      .then((doc) => {
        expect(doc).to.not.exist;
      })
      .then(() => { done(); })
      .catch(done);
  });

  it('FindAndRemove callback test', (done) => {
    const db = new Db('find-and-remove-test');
    const collection = db.collection('test');
    collection.insertMany([{ a: 1 }, { b: 1, d: 1 }, { c: 1 }], { w: 1 }, (err, result) => {
      expect(err).to.not.exist;
      expect(result).to.exist;
      collection.findAndRemove({ b: 1 }, [['b', 1]], (err1, findRemoveResult) => {
        expect(err).to.not.exist;
        expect(findRemoveResult).to.exist;
        expect(1).to.eql(findRemoveResult.value.b);
        expect(1).to.eql(findRemoveResult.value.d);
        collection.findOne({ b: 1 }, (err2, doc) => {
          expect(err2).to.not.exist;
          expect(doc).to.not.exist;
          done();
        });
      });
    });
  });
});
