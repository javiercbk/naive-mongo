/* eslint-disable no-unused-vars, prefer-rest-params */

const isPromise = obj => typeof obj.then === 'function';

const promiseOrCallback = (func, cb) => {
  if (typeof cb === 'function') {
    process.nextTick(() => {
      const funcResult = func();
      if (isPromise(funcResult)) {
        funcResult.catch((err) => {
          cb(err);
        }).then((result) => {
          cb(null, result);
        });
      } else {
        cb(null, funcResult);
      }
    });
  } else {
    return new Promise((resolve, reject) => {
      let funcResult;
      try {
        funcResult = func();
      } catch (err) {
        reject(err);
      }
      if (isPromise(funcResult)) {
        funcResult.catch(reject).then(resolve);
      } else {
        resolve(funcResult);
      }
    });
  }
};

const deleteOperationResult = len => ({
  result: {
    ok: 1,
    n: len,
  },
  connection: {},
  deletedCount: len,
});

const wrapCall = (factoryFunc, args) => {
  const properCallback = args[args.length - 1];
  return promiseOrCallback(factoryFunc, properCallback);
};

module.exports = {
  promiseOrCallback,
  deleteOperationResult,
  wrapCall,
};
