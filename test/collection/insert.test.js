/* global describe, it */
const chai = require('chai');
require('mocha');

const Db = require('../../lib/db');

const { expect } = chai;

describe('insert tests', () => {
  it('Insert promise test', (done) => {
    const db = new Db('insert-test');
    const collection = db.collection('test');
    const docs = [{ hello: 'world_safe1' }, { hello: 'world_safe2' }];
    collection.insertMany(docs, { w: 1 })
      .then((result) => {
        expect(result).to.exist;
        return collection.findOne({ hello: 'world_safe2' });
      })
      .then((doc) => {
        expect('world_safe2').to.eql(doc.hello);
      })
      .then(() => { done(); })
      .catch(done);
  });

  it('Insert callback test', (done) => {
    const db = new Db('insert-test');
    const collection = db.collection('test');
    const docs = [{ hello: 'world_safe1' }, { hello: 'world_safe2' }];
    collection.insertMany(docs, { w: 1 }, (err, result) => {
      expect(err).to.not.exist;
      expect(result).to.exist;
      // Fetch the document
      collection.findOne({ hello: 'world_safe2' }, (err1, item) => {
        expect(err1).to.not.exist;
        expect('world_safe2').to.eql(item.hello);
        done();
      });
    });
  });
});
