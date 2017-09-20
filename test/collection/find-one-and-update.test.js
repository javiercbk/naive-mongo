/* global describe, it */
const chai = require('chai');
require('mocha');

const Db = require('../../lib/db');

const { expect } = chai;

describe('findOneAndReplace tests', () => {
  it('FindOneAndUpdate promise test', (done) => {
    const db = new Db('find-one-and-update-test');
    const collection = db.collection('test');
    collection.insertMany([{ a: 1, b: 1 }], { w: 1 })
      .then((r) => {
        expect(1).to.eql(r.result.n);
        return collection.findOneAndUpdate(
          { a: 1 },
          { $set: { d: 1 } },
          {
            projection: { b: 1, d: 1 },
            sort: { a: 1 },
            returnOriginal: false,
            upsert: true,
          },
        );
      })
      .then((r) => {
        // not supported
        // expect(1).to.eql(r.lastErrorObject.n);
        expect(1).to.eql(r.value.b);
        expect(1).to.eql(r.value.d);
      })
      .then(() => { done(); })
      .catch(done);
  });

  it('FindOneAndUpdate callback test', (done) => {
    const db = new Db('find-one-and-update-test');
    const collection = db.collection('test');
    collection.insertMany([{ a: 1, b: 1 }], { w: 1 }, (err, r) => {
      expect(err).to.not.exist;
      expect(1).to.eql(r.result.n);
      collection.findOneAndUpdate(
        { a: 1 },
        { $set: { d: 1 } },
        {
          projection: { b: 1, d: 1 },
          sort: { a: 1 },
          returnOriginal: false,
          upsert: true,
        }, (err1, r1) => {
          expect(err1).to.not.exist;
          // not supported
          // expect(1).to.eql(r1.lastErrorObject.n);
          expect(1).to.eql(r1.value.b);
          expect(1).to.eql(r1.value.d);
          done();
        },
      );
    });
  });
});
