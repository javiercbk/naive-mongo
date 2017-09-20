/* eslint-disable function-paren-newline */
/* global describe, it */
const chai = require('chai');
require('mocha');

const Db = require('../../lib/db');

const { expect } = chai;

describe('findAndModify tests', () => {
  it('FindAndModify promise test', (done) => {
    const db = new Db('find-and-modify-test');
    const collection = db.collection('test');
    collection.insertMany([{ a: 1 }, { b: 1 }, { c: 1 }], { w: 1 })
      .then(() => collection.findAndModify({ a: 1 }, [['a', 1]], { $set: { b1: 1 } }, { new: true }))
      .then((doc) => {
        expect(doc).to.exist;
        expect(1).to.eql(doc.value.a);
        expect(1).to.eql(doc.value.b1);
        return collection.findAndModify({ b: 1 }, [['b', 1]], { $set: { b: 2 } }, { remove: true });
      })
      .then(() => collection.findOne({ b: 1 }))
      .then((item) => {
        expect(item).to.not.exist;
        return collection.findAndModify({ d: 1 }, [['b', 1]],
          { d: 1, f: 1 }, { new: true, upsert: true, w: 1 });
      })
      .then((doc) => {
        expect(1).to.eql(doc.value.d);
        expect(1).to.eql(doc.value.f);
        done();
      })
      .catch(done);
  });
});
