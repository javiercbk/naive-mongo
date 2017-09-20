/* global describe, it */
const chai = require('chai');
require('mocha');

const Db = require('../../lib/db');

const { expect } = chai;

describe('find tests', () => {
  it('Find promise test', (done) => {
    const db = new Db('find-test');
    const collection = db.collection('test');
    collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }], { w: 1 })
      .then(() => collection.find().toArray())
      .then((docs) => {
        expect(3).to.eql(docs.length);
        done();
      })
      .catch(done);
  });
  it('Find promise with skip limit', (done) => {
    const db = new Db('find-test');
    const collection = db.collection('test');
    collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }], { w: 1 })
      .then(() => collection.find().skip(1).limit(1).project({ b: 1 })
        .toArray())
      .then((docs) => {
        expect(1).to.eql(docs.length);
        // eslint-disable-next-line no-unused-expressions
        expect(docs[0].b).to.be.undefined;
        expect(2).to.eql(docs[0].a);
        done();
      })
      .catch(done);
  });

  it('Find callback test', (done) => {
    const db = new Db('find-test');
    const collection = db.collection('test');
    collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }], (err, insertResults) => {
      expect(err).to.not.exist;
      expect(insertResults).to.exist;
      collection.find().toArray((err1, docs) => {
        expect(err1).to.not.exist;
        expect(docs).to.exist;
        expect(3).to.eql(docs.length);
        done();
      });
    });
  });
  it('Find callback with skip limit', (done) => {
    const db = new Db('find-test');
    const collection = db.collection('test');
    collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }], (err, insertResults) => {
      expect(err).to.not.exist;
      expect(insertResults).to.exist;
      collection.find().skip(1).limit(1).project({ b: 1 })
        .toArray((err1, docs) => {
          expect(err1).to.not.exist;
          expect(docs).to.exist;
          expect(1).to.eql(docs.length);
          expect(2).to.eql(docs[0].a);
          done();
        });
    });
  });
});
