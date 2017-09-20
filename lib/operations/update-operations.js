const _ = require('lodash');

// Update operations
const pushCurrentDateOperation = require('./update/current-date-operation');
const pushIncOperation = require('./update/inc-operation');
const pushMinMaxOperation = require('./update/inc-operation');
const pushMulOperation = require('./update/mul-operation');
const pushRenameOperation = require('./update/rename-operation');
const pushSetOperation = require('./update/set-operation');
const pushUnsetOperation = require('./update/unset-operation');
const pushBitOperation = require('./update/bit-operation');
// Array update operations
const pushAddToSetOperation = require('./array/add-to-set-operation');
const pushPopOperation = require('./array/pop-operation');
const pushPullOperation = require('./array/pull-operation');
const pushPushAllOperation = require('./array/push-all-operation');
const pushPushOperation = require('./array/push-operation');
const pushPullAllOperation = require('./array/pull-all-operation');

const RESERVED_WORDS = [
  '$currentDate',
  '$inc',
  '$min',
  '$max',
  '$mul',
  '$rename',
  '$set',
  '$setOnInsert',
  '$unset',
  '$',
  '$addToSet',
  '$pop',
  '$pull',
  '$pushAll',
  '$push',
  '$pullAll',
  '$each',
  '$position',
  '$slice',
  '$sort',
  '$bit',
  '$isolated',
];

const isImplicitSet = key => RESERVED_WORDS.indexOf(key) === -1;

const pushUpdateOperations = (update, operations, isNew) => {
  pushCurrentDateOperation(update, operations);
  pushIncOperation(update, operations);
  pushMinMaxOperation(update, operations);
  pushMinMaxOperation(update, operations, '$max');
  pushMulOperation(update, operations);
  pushRenameOperation(update, operations);
  pushSetOperation(update, operations);
  if (isNew) {
    pushSetOperation(update, operations, '$setOnInsert');
  }
  pushUnsetOperation(update, operations);
  pushBitOperation(update, operations);
};

const implicitSetOperations = (update, operations) => {
  Object.keys(update).forEach((key) => {
    const implicitSets = [];
    if (isImplicitSet(key)) {
      const implicitSet = {};
      implicitSet[key] = update[key];
      implicitSets.push(implicitSet);
    }
    if (implicitSets.length) {
      const setOperation = implicitSets.reduce((redux, curr) => _.merge(redux, curr), {});
      pushSetOperation({ $set: setOperation }, operations);
    }
  });
};

const pushArrayUpdateOperations = (update, operations) => {
  pushAddToSetOperation(update, operations);
  pushPopOperation(update, operations);
  pushPullOperation(update, operations);
  pushPushAllOperation(update, operations);
  pushPushOperation(update, operations);
  pushPullAllOperation(update, operations);
};

module.exports = (update, isNew) => {
  const operations = [];
  pushUpdateOperations(update, operations, isNew);
  implicitSetOperations(update, operations);
  pushArrayUpdateOperations(update, operations);
  return operations;
};
