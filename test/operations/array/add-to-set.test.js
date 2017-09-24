/* global describe, it */
const chai = require('chai');
require('mocha');

const Db = require('../../../lib/db');

const { expect } = chai;

describe('Array $addToSet operation tests', () => {
  it('$addToSet with number test', (done) => {
    const db = new Db('add-to-set-test');
    const collection = db.collection('test');
    collection.insertOne({ _id: 1, a: [1, 2, 3, 4] })
      .then((doc) => {
        expect(doc).to.exist;
        return collection.updateOne({ _id: 1 }, { $addToSet: { a: 5 } });
      })
      .then((r) => {
        expect(r).to.exist;
        return collection.findOne({ _id: 1 });
      })
      .then((item) => {
        expect(1).to.eql(item._id);
        expect(item.a).to.exist;
        expect(5).to.eql(item.a.length);
        expect([1, 2, 3, 4, 5]).to.eql(item.a);
      })
      .then(() => { done(); })
      .catch(done);
  });

  it('$addToSet with number with repeated test', (done) => {
    const db = new Db('add-to-set-test');
    const collection = db.collection('test');
    collection.insertOne({ _id: 1, a: [1, 2, 3, 4] })
      .then((doc) => {
        expect(doc).to.exist;
        return collection.updateOne({ _id: 1 }, { $addToSet: { a: 4 } });
      })
      .then((r) => {
        expect(r).to.exist;
        return collection.findOne({ _id: 1 });
      })
      .then((item) => {
        expect(1).to.eql(item._id);
        expect(item.a).to.exist;
        expect(4).to.eql(item.a.length);
        expect([1, 2, 3, 4]).to.eql(item.a);
      })
      .then(() => { done(); })
      .catch(done);
  });

  it('$addToSet with letters test', (done) => {
    const db = new Db('add-to-set-test');
    const collection = db.collection('test');
    collection.insertOne({ _id: 1, a: ['1', '2', '3', '4'] })
      .then((doc) => {
        expect(doc).to.exist;
        return collection.updateOne({ _id: 1 }, { $addToSet: { a: '5' } });
      })
      .then((r) => {
        expect(r).to.exist;
        return collection.findOne({ _id: 1 });
      })
      .then((item) => {
        expect(1).to.eql(item._id);
        expect(item.a).to.exist;
        expect(5).to.eql(item.a.length);
        expect(['1', '2', '3', '4', '5']).to.eql(item.a);
      })
      .then(() => { done(); })
      .catch(done);
  });

  it('$addToSet with number with repeated letters test', (done) => {
    const db = new Db('add-to-set-test');
    const collection = db.collection('test');
    collection.insertOne({ _id: 1, a: ['1', '2', '3', '4'] })
      .then((doc) => {
        expect(doc).to.exist;
        return collection.updateOne({ _id: 1 }, { $addToSet: { a: '4' } });
      })
      .then((r) => {
        expect(r).to.exist;
        return collection.findOne({ _id: 1 });
      })
      .then((item) => {
        expect(1).to.eql(item._id);
        expect(item.a).to.exist;
        expect(4).to.eql(item.a.length);
        expect(['1', '2', '3', '4']).to.eql(item.a);
      })
      .then(() => { done(); })
      .catch(done);
  });

  it('$addToSet with mixed test', (done) => {
    const db = new Db('add-to-set-test');
    const collection = db.collection('test');
    collection.insertOne({ _id: 1, a: ['1', '2', '3', '4'] })
      .then((doc) => {
        expect(doc).to.exist;
        return collection.updateOne({ _id: 1 }, { $addToSet: { a: 4 } });
      })
      .then((r) => {
        expect(r).to.exist;
        return collection.findOne({ _id: 1 });
      })
      .then((item) => {
        expect(1).to.eql(item._id);
        expect(item.a).to.exist;
        expect(5).to.eql(item.a.length);
        expect(['1', '2', '3', '4', 4]).to.eql(item.a);
      })
      .then(() => { done(); })
      .catch(done);
  });
});
