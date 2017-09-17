/* global describe, it */
const chai = require('chai');
require('mocha');

const MongoPath = require('../../lib/operations/mongo-path');

const { expect } = chai;

const testObject = () => ({
  arr: [{
    test: {
      anotherTest: 'hello',
    },
  }, {
    test2: {
      anotherTest2: 'hello2',
    },
  }],
});

describe('Mongo path', () => {
  it('should get a simple path', () => {
    const object = {
      test: true,
    };
    const path = new MongoPath('test');
    expect(true).to.eql(path.get(object));
  });

  it('should get a complex path', () => {
    const object = testObject();
    const path = new MongoPath('arr.0.test.anotherTest');
    expect('hello').to.eql(path.get(object));
  });

  it('should update an array element with elemMatch', () => {
    const object = testObject();
    const path = new MongoPath('arr.$', {
      arr: {
        $elemMatch: {
          test2: { $exists: true },
        },
      },
    });
    path.set(object, {
      test3: {
        anotherTest3: 'hello3',
      },
    });
    expect({
      arr: [{
        test: {
          anotherTest: 'hello',
        },
      }, {
        test3: {
          anotherTest3: 'hello3',
        },
      }],
    }).to.deep.equal(object);
  });

  it('should update an array element property', () => {
    const object = testObject();
    const path = new MongoPath('arr.$.test2', {
      arr: {
        $elemMatch: {
          test2: { $exists: true },
        },
      },
    });
    path.set(object, {
      anotherTest3: 'hello3',
    });
    expect({
      arr: [{
        test: {
          anotherTest: 'hello',
        },
      }, {
        test2: {
          anotherTest3: 'hello3',
        },
      }],
    }).to.deep.equal(object);
  });
});
