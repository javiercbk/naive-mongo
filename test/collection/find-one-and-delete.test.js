/* global describe, it */
const chai = require('chai');
require('mocha');

const Db = require('../../lib/db');

const { expect } = chai;

describe('findOneAndDelete tests', () => {
  it('FindOneAndDelete promise test', (done) => {
    const db = new Db('find-one-and-deletetest');
    const collection = db.collection('test');
    collection.insertMany([{ a: 1, b: 1 }], { w: 1 })
      .then((r) => {
        expect(1).to.eql(r.result.n);
        return collection.findOneAndDelete({ a: 1 }, { projection: { b: 1 }, sort: { a: 1 } });
      })
      .then((r) => {
        // not supported
        // expect(1).to.eql(r.lastErrorObject.n);
        expect(1).to.eql(r.value.b);
      })
      .then(() => { done(); })
      .catch(done);
  });

  it('FindOneAndDelete callback test', (done) => {
    const db = new Db('find-one-and-deletetest');
    const collection = db.collection('test');
    collection.insertMany([{ a: 1, b: 1 }], { w: 1 }, (err, iResult) => {
      expect(err).to.not.exist;
      expect(iResult).to.exist;
      collection.findOneAndDelete({ a: 1 }, { projection: { b: 1 }, sort: { a: 1 } }, (err1, r) => {
        expect(err1).to.not.exist;
        // not supported
        // expect(1).to.eql(r.lastErrorObject.n);
        expect(1).to.eql(r.value.b);
        done();
      });
    });
  });
});
