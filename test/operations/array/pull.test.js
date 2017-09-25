/* global describe, it */
const chai = require('chai');
require('mocha');

const Db = require('../../../lib/db');

const { expect } = chai;

const docs = [{
  _id: 1,
  fruits: ['apples', 'pears', 'oranges', 'grapes', 'bananas'],
  vegetables: ['carrots', 'celery', 'squash', 'carrots'],
  numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
}, {
  _id: 2,
  fruits: ['plums', 'kiwis', 'oranges', 'bananas', 'apples'],
  vegetables: ['broccoli', 'zucchini', 'carrots', 'onions'],
  numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
}];

const expected = [
  {
    _id: 1,
    fruits: ['pears', 'grapes', 'bananas'],
    vegetables: ['celery', 'squash'],
    numbers: [6, 7, 8, 9, 10],
  },
  {
    _id: 2,
    fruits: ['plums', 'kiwis', 'bananas'],
    vegetables: ['broccoli', 'zucchini', 'onions'],
    numbers: [6, 7, 8, 9, 10],
  },
];

describe('Array $pull operation tests', () => {
  it.skip('$pull tests', (done) => {
    const db = new Db('pull-test');
    const collection = db.collection('test');
    collection.insertMany(docs)
      .then((doc) => {
        expect(doc).to.exist;
        return collection.updateMany(
          {},
          { $pull: { fruits: { $in: ['apples', 'oranges'] }, vegetables: 'carrots', numbers: { $gte: 6 } } },
        );
      })
      .then((r) => {
        expect(r).to.exist;
        return collection.find({}).toArray();
      })
      .then((items) => {
        expect(items).to.exist;
        expect(2).to.eql(items.length);
        expect(expected).to.deep.equal(items);
      })
      .then(() => { done(); })
      .catch(done);
  });
});
