/* global describe, it */
const _ = require('lodash');
const Promise = require('bluebird');
const chai = require('chai');
require('mocha');

const Db = require('../../../lib/db');

const { expect } = chai;

const orders = [{
  item: 'abc',
  price: 12,
  quantity: 2,
}, {
  item: 'jkl',
  price: 20,
  quantity: 1,
},
{ }];

const items = [
  { sku: 'abc', description: 'product 1', instock: 120 },
  { sku: 'def', description: 'product 2', instock: 80 },
  { sku: 'ijk', description: 'product 3', instock: 60 },
  { sku: 'jkl', description: 'product 4', instock: 70 },
  { sku: null, description: 'Incomplete' },
  { }];

const aggregateResult = [
  {
    item: 'abc',
    price: 12,
    quantity: 2,
    inventory_docs: [{
      sku: 'abc',
      description: 'product 1',
      instock: 120,
    }],
  }, {
    item: 'jkl',
    price: 20,
    quantity: 1,
    inventory_docs: [
      {
        sku: 'jkl',
        description: 'product 4',
        instock: 70,
      },
    ],
  }, {
    inventory_docs: [
      {
        sku: null,
        description: 'Incomplete',
      },
      { },
    ],
  },
];

describe('aggregate tests', () => {
  it('aggregate promise test', (done) => {
    const db = new Db('aggregate-test');
    const orderCollection = db.collection('orders');
    const inventoryCollection = db.collection('inventory');
    Promise.all([
      orderCollection.insertMany(orders),
      inventoryCollection.insertMany(items),
    ])
      .then(() => orderCollection.aggregate([
        {
          $lookup:
            {
              from: 'inventory',
              localField: 'item',
              foreignField: 'sku',
              as: 'inventory_docs',
            },
        },
      ]))
      .then((result) => {
        expect(result).to.exist;
        expect(Array.isArray(result)).to.be.true;
        expect(aggregateResult.length).to.eql(result.length);
        aggregateResult.forEach((r, i) => {
          const or = result[i];
          const clone = _.cloneDeep(r);
          delete clone._id;
          delete or._id;
          Object.keys(clone).forEach((k) => {
            if (Array.isArray(clone[k])) {
              clone[k].forEach((o, index) => {
                delete or[k][index]._id;
                delete o._id;
                expect(or[k][index]).to.deep.equal(o);
              });
            } else if (typeof clone[k] === 'object') {
              const ork = or[k];
              delete ork._id;
              delete clone[k]._id;
              expect(clone[k]).to.deep.equal(ork);
            } else {
              expect(clone[k]).to.eql(or[k]);
            }
          });
        });
      })
      .then(() => { done(); })
      .catch(done);
  });
});
