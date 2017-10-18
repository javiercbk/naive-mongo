const mingo = require('../mingo');
const _ = require('lodash');

const elemMatches = (elem, path, query) => {
  const pathToArray = path[0];
  const condition = _.get(query, pathToArray);
  if (condition.$elemMatch) {
    const mingoQuery = new mingo.Query(condition.$elemMatch);
    return mingoQuery.find([elem]).count() > 0;
  }
  return elem === condition;
};

class MongoPath {
  /**
   * Mongo path constructor
   * @param {string} path of an object's property.
   * @param {function} additionalFilter filter function.
   */
  constructor(path, query) {
    const arrayParts = path.split('.$');
    if (arrayParts.length === 1) {
      this.path = path;
    } else {
      if (arrayParts[1] === '') {
        arrayParts.splice(1, 1);
      } else {
        arrayParts[1] = arrayParts[1].substring(1);
      }
      this.path = arrayParts;
    }
    this.query = query;
  }

  get(object) {
    return _.get(object, this.path);
  }

  set(object, value) {
    // support $ array updates
    if (Array.isArray(this.path)) {
      const array = _.get(object, this.path[0]);
      array.forEach((elem, index) => {
        if (elemMatches(elem, this.path, this.query)) {
          if (this.path.length === 1) {
            array[index] = value;
          } else {
            const auxPath = new MongoPath(this.path[1]);
            auxPath.set(array[index], value);
          }
        }
      });
    } else {
      _.set(object, this.path, value);
    }
  }

  unset(object) {
    _.unset(object, this.path);
  }
}

module.exports = MongoPath;
