/* global describe, it */
const chai = require('chai');
require('mocha');

const Db = require('../../lib/db');

const { expect } = chai;

const docs = [{
  title: 'this is my title',
  author: 'bob',
  posted: new Date(),
  pageViews: 5,
  tags: ['fun', 'good', 'fun'],
  other: {
    foo: 5,
  },
  comments: [{
    author: 'joe',
    text: 'this is cool',
  }, {
    author: 'sam',
    text: 'this is bad',
  },
  ],
}];

const testResults = (result) => {
  expect('fun').to.eql(result[0]._id.tags);
  expect(['bob']).to.eql(result[0].authors);
  expect('good').to.eql(result[1]._id.tags);
  expect(['bob']).to.eql(result[1].authors);
};

const executeAggregate = (collection, cb) => collection.aggregate([{
  $project: {
    author: 1,
    tags: 1,
  },
},
{ $unwind: '$tags' },
{
  $group: {
    _id: {
      tags: '$tags',
    },
    authors: { $addToSet: '$author' },
  },
},
], cb);

describe('Aggregate tests', () => {
  it('aggregate promise test', (done) => {
    const db = new Db('aggregate-test');
    const collection = db.collection('test');
    collection.insertMany(docs, { w: 1 })
      .then(() => executeAggregate(collection))
      .then((result) => {
        testResults(result);
        done();
      }).catch(done);
  });

  it('aggregate callback test', (done) => {
    const db = new Db('aggregate-test');
    const collection = db.collection('test');
    collection.insertMany(docs, { w: 1 }, (err, insertResult) => {
      expect(err).to.not.exist;
      expect(insertResult).to.exist;
      executeAggregate(collection, (err1, aggregateResult) => {
        expect(err1).to.not.exist;
        testResults(aggregateResult);
        done();
      });
    });
  });
});
