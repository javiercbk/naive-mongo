/* global describe, it */
const chai = require('chai');
require('mocha');

const Db = require('../../lib/db');

const { expect } = chai;

describe('Aggregate tests', () => {
  it('aggregate test', (done) => {
    const db = new Db('aggregate-test');
    const collection = db.collection('test');
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
    collection.insertMany(docs, { w: 1 })
      .then(() => collection.aggregate([{
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
      ]))
      .then((result) => {
        expect('fun').to.eql(result[0]._id.tags);
        expect(['bob']).to.eql(result[0].authors);
        expect('good').to.eql(result[1]._id.tags);
        expect(['bob']).to.eql(result[1].authors);
        done();
      }).catch(done);
  });
});
