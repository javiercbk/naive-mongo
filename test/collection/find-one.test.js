/* global describe, it */
const chai = require('chai');
require('mocha');

const Db = require('../../lib/db');

const { expect } = chai;

describe('findOne tests', () => {
  it('FindOne promise test', (done) => {
    const db = new Db('find-one-test');
    const collection = db.collection('test');
    collection.insertMany([{ a: 1, b: 1 }, { a: 2, b: 2 }, { a: 3, b: 3 }], { w: 1 })
      .then((result) => {
        expect(result).to.exist;
        return collection.findOne({ a: 2 }, { fields: { b: 1 } });
      })
      .then((doc) => {
        // not supported yet
        // expect(doc.a).to.not.exist;
        expect(2).to.eql(doc.b);
      })
      .then(() => { done(); })
      .catch(done);
  });

  it('FindOne callback test', (done) => {
    const db = new Db('find-one-test');
    const collection = db.collection('test');
    collection.insertMany([{ a: 1, b: 1 }, { a: 2, b: 2 }, { a: 3, b: 3 }], { w: 1 })
      .then((result) => {
        expect(result).to.exist;
        return collection.findOne({ a: 2 }, { fields: { b: 1 } });
      })
      .then((doc) => {
        // not supported yet
        // expect(doc.a).to.not.exist;
        expect(2).to.eql(doc.b);
      })
      .then(() => { done(); })
      .catch(done);
  });
});
