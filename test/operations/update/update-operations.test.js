/* global describe, it */
const chai = require('chai');
require('mocha');

const Db = require('../../../lib/db');

const { expect } = chai;

describe('Update operations tests', () => {
  it('UpdateOne promise $set test', (done) => {
    const db = new Db('update-one-test');
    const collection = db.collection('test');
    collection.insertOne({ a: 1 })
      .then((doc) => {
        expect(doc).to.exist;
        return collection.updateOne({ a: 1 }, { $set: { b: 2 } });
      })
      .then((r) => {
        expect(r).to.exist;
        return collection.findOne({ a: 1 });
      })
      .then((item) => {
        expect(1).to.eql(item.a);
        expect(2).to.eql(item.b);
      })
      .then(() => { done(); })
      .catch(done);
  });

  it('UpdateOne promise $unset test', (done) => {
    const db = new Db('update-one-test');
    const collection = db.collection('test');
    collection.insertOne({ a: 1, b: 2 })
      .then((doc) => {
        expect(doc).to.exist;
        return collection.updateOne({ a: 1 }, { $unset: { b: '' } });
      })
      .then((r) => {
        expect(r).to.exist;
        return collection.findOne({ a: 1 });
      })
      .then((item) => {
        expect(1).to.eql(item.a);
        expect(item.b).to.not.exist;
      })
      .then(() => { done(); })
      .catch(done);
  });

  it('UpdateOne promise $currentData test', (done) => {
    const db = new Db('update-one-test');
    const collection = db.collection('test');
    collection.insertOne({ a: 1 })
      .then((doc) => {
        expect(doc).to.exist;
        return collection.updateOne({ a: 1 }, { $currentDate: { b: true, 'cancellation.date': { $type: 'timestamp' } } });
      })
      .then((r) => {
        expect(r).to.exist;
        return collection.findOne({ a: 1 });
      })
      .then((item) => {
        expect(1).to.eql(item.a);
        expect(item.b).to.exist;
        expect('Timestamp').to.eql(item.b.constructor.name);
        expect(item.cancellation.date).to.exist;
        expect('Date').to.eql(item.cancellation.date.constructor.name);
      })
      .then(() => { done(); })
      .catch(done);
  });

  it('UpdateOne promise $inc test', (done) => {
    const db = new Db('update-one-test');
    const collection = db.collection('test');
    collection.insertOne({ a: 1, b: 1, metrics: { orders: 1 } })
      .then((doc) => {
        expect(doc).to.exist;
        return collection.updateOne({ a: 1 }, { $inc: { b: -2, 'metrics.orders': 1 } });
      })
      .then((r) => {
        expect(r).to.exist;
        return collection.findOne({ a: 1 });
      })
      .then((item) => {
        expect(1).to.eql(item.a);
        expect(item.b).to.exist;
        expect(-1).to.eql(item.b);
        expect(2).to.eql(item.metrics.orders);
      })
      .then(() => { done(); })
      .catch(done);
  });

  it('UpdateOne promise $min test', (done) => {
    const db = new Db('update-one-test');
    const collection = db.collection('test');
    collection.insertOne({ a: 1, b: 3, c: 4 })
      .then((doc) => {
        expect(doc).to.exist;
        return collection.updateOne({ a: 1 }, { $min: { b: 2, c: 6 } });
      })
      .then((r) => {
        expect(r).to.exist;
        return collection.findOne({ a: 1 });
      })
      .then((item) => {
        expect(1).to.eql(item.a);
        expect(3).to.eql(item.b);
        expect(6).to.eql(item.c);
      })
      .then(() => { done(); })
      .catch(done);
  });

  it('UpdateOne promise $max test', (done) => {
    const db = new Db('update-one-test');
    const collection = db.collection('test');
    collection.insertOne({ a: 1, b: 3, c: 5 })
      .then((doc) => {
        expect(doc).to.exist;
        return collection.updateOne({ a: 1 }, { $max: { b: 5, c: 3 } });
      })
      .then((r) => {
        expect(r).to.exist;
        return collection.findOne({ a: 1 });
      })
      .then((item) => {
        expect(1).to.eql(item.a);
        expect(3).to.eql(item.b);
        expect(3).to.eql(item.c);
      })
      .then(() => { done(); })
      .catch(done);
  });

  it('UpdateOne promise $mul test', (done) => {
    const db = new Db('update-one-test');
    const collection = db.collection('test');
    collection.insertOne({ a: 1, b: 1, metrics: { orders: 1 } })
      .then((doc) => {
        expect(doc).to.exist;
        return collection.updateOne({ a: 1 }, { $mul: { b: 2, 'metrics.orders': 3 } });
      })
      .then((r) => {
        expect(r).to.exist;
        return collection.findOne({ a: 1 });
      })
      .then((item) => {
        expect(1).to.eql(item.a);
        expect(item.b).to.exist;
        expect(2).to.eql(item.b);
        expect(3).to.eql(item.metrics.orders);
      })
      .then(() => { done(); })
      .catch(done);
  });

  it('UpdateOne promise $rename test', (done) => {
    const db = new Db('update-one-test');
    const collection = db.collection('test');
    collection.insertOne({ a: 1, b: 1 })
      .then((doc) => {
        expect(doc).to.exist;
        return collection.updateOne({ a: 1 }, { $rename: { b: 'c' } });
      })
      .then((r) => {
        expect(r).to.exist;
        return collection.findOne({ a: 1 });
      })
      .then((item) => {
        expect(1).to.eql(item.a);
        expect(item.b).to.not.exist;
        expect(1).to.eql(item.c);
      })
      .then(() => { done(); })
      .catch(done);
  });

  it('UpdateOne promise $setOnInsert test', (done) => {
    const db = new Db('update-one-test');
    const collection = db.collection('test');
    collection.insertMany({ a: 1 })
      .then((doc) => {
        expect(doc).to.exist;
        return collection.updateOne({ a: 1 }, { $setOnInsert: { b: 1 } }, { upsert: true });
      })
      .then((r) => {
        expect(r).to.exist;
        return collection.findOne({ a: 1 });
      })
      .then((item) => {
        expect(1).to.eql(item.a);
        expect(item.b).to.not.exist;
        return collection.updateOne({ a: 2 }, { $setOnInsert: { b: 1 } }, { upsert: true });
      })
      .then(() => collection.findOne({ a: 2 }))
      .then((item) => {
        expect(2).to.eql(item.a);
        expect(1).to.eql(item.b);
      })
      .then(() => { done(); })
      .catch(done);
  });

  it('UpdateOne promise $bit test', (done) => {
    const db = new Db('update-one-test');
    const collection = db.collection('test');
    collection.insertMany({
      a: 1,
      b: 2,
      c: 3,
      d: 4,
    })
      .then((doc) => {
        expect(doc).to.exist;
        return collection.updateOne({ a: 1 }, {
          $bit: {
            b: { and: 2 },
            c: { or: 2 },
            d: { xor: 2 },
          },
        }, { upsert: true });
      })
      .then((r) => {
        expect(r).to.exist;
        return collection.findOne({ a: 1 });
      })
      .then((item) => {
        expect(1).to.eql(item.a);
        // eslint-disable-next-line no-bitwise
        expect(2 & 2).to.eql(item.b);
        // eslint-disable-next-line no-bitwise
        expect(3 | 2).to.eql(item.c);
        // eslint-disable-next-line no-bitwise
        expect(4 ^ 2).to.eql(item.d);
      })
      .then(() => { done(); })
      .catch(done);
  });
});
