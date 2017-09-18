/* eslint-disable prefer-rest-params */
const Promise = require('bluebird');
const mingo = require('mingo');
const Stream = require('stream');

class Cursor {
  constructor(documents) {
    this.documents = documents;
    this.cursorIndex = 0;
    this.cursoState = Cursor.INIT;
    this.query = {};
    this.mapFunc = null;
    this.srt = null;
    this.skp = null;
    this.lim = null;
  }

  get cursorStream() {
    if (this.__stream) {
      this.__stream = new Stream.Readable();
      const documents = this.__getDocuments();
      documents.forEach(doc => this.__stream.push(doc));
    }
    return this.__stream;
  }

  set cursorStream(val) {
    if (val === null || val === undefined) {
      this.__stream = new Stream.Readable();
      const documents = this.__getDocuments();
      documents.forEach(doc => this.__stream.push(doc));
    } else {
      this.__stream = val;
    }
  }

  __getDocuments(fullQuery) {
    this.state = Cursor.OPEN;
    const q = Object.assign({}, {
      query: this.query,
      srt: this.srt,
      skp: this.skp,
      lim: this.lim,
      mapFunc: this.mapFunc,
    }, fullQuery);
    const mingoCursor = new mingo.Query(q.query);
    if (q.srt) {
      mingoCursor.sort(q.srt);
    }
    if (q.skp) {
      mingoCursor.skip(q.skp);
    }
    if (q.lim) {
      mingoCursor.limit(q.lim);
    }
    let results = mingoCursor.find(this.documents);
    if (this.mapFunc) {
      results = results.map(this.mapFunc);
    }
    return results;
  }

  addCursorFlag() {}
  addQueryModifier() {}
  batchSize(value) {
    this.batchSize = value;
  }
  close(callback) {
    if (!callback) {
      return new Promise((resolve) => {
        delete this.documents;
        resolve();
      });
    }
    process.nextTick(() => {
      delete this.documents;
      callback(null);
    });
  }
  collation() {}

  count(applySkipLimit = true, options, callback) {
    callback = arguments[arguments.length - 1];
    const fullQuery = {};
    let properOptions = {};
    if (options && typeof options === 'object') {
      properOptions = options;
    }
    if (!applySkipLimit) {
      if (properOptions.skip) {
        fullQuery.skp = properOptions.skip;
      }
      if (properOptions.limit) {
        fullQuery.lim = properOptions.limit;
      }
    } else {
      fullQuery.skp = this.skp;
      fullQuery.lim = this.lim;
    }
    if (typeof callback !== 'function') {
      return Promise.resolve(this.__getDocuments(fullQuery).length);
    }
    callback(this.__getDocuments(fullQuery).length);
  }

  each(func) {
    this.__getDocuments().forEach((doc) => {
      func(null, doc);
    });
  }

  explain(callback) {
    if (!callback) {
      return Promise.resolve(null);
    }
    process.nextTick(() => {
      callback(null, null);
    });
  }

  filter(filter) {
    this.query = filter;
  }

  forEach(func, callback) {
    process.nextTick(() => {
      this.__getDocuments().forEach((doc) => {
        func(doc);
      });
      if (callback) {
        process.nextTick(() => {
          callback(null);
        });
      }
    });
  }

  hasNext(callback) {
    const hasNext = this.cursorIndex < this.__getDocuments().length;
    if (!callback) {
      return Promise.resolve(hasNext);
    }
    process.nextTick(() => {
      callback(null, hasNext);
    });
  }

  hint() {}

  isClosed() {
    return this.cursoState === Cursor.CLOSED;
  }

  limit(lim) {
    this.lim = lim;
  }

  map(func) {
    this.mapFunc = func;
  }

  max() {}

  maxAwaitTimeMS() {}

  maxScan() {}

  maxTimeMS() {}

  min() {}

  next(callback) {
    const documents = this.__getDocuments();
    let doc = null;
    if (this.cursorIndex < documents.length) {
      doc = documents[this.cursorIndex];
      this.cursorIndex++;
    }
    if (!callback) {
      return Promise.resolve(doc);
    }
    process.nextTick(() => {
      callback(null, doc);
    });
  }

  nextObject(callback) {
    return this.next(callback);
  }

  pause() {
    return this.cursorStream.pause();
  }

  pipe(destination, options) {
    return this.cursorStream.pipe(destination, options);
  }

  project(projection) {
    this.projection = projection;
  }

  read(size) {
    return this.stream().read(size);
  }

  resume() {
    return this.cursorStream.resume();
  }

  returnKey() {}

  rewind() {
    // rewinds the stream
    this.cursorStream = null;
  }

  setEncoding(encoding) {
    this.cursorStream.setEncoding(encoding);
  }

  setReadPreference() {}

  showRecordId() {}

  skip(skip) {
    this.skp = skip;
  }

  snapshot() {}

  sort(keyOrList, direction) {
    let type = typeof keyOrList;
    if (type === 'object' && Array.isArray(keyOrList)) {
      type = 'array';
    }
    switch (type) {
      case 'string':
        this.sort = {};
        this.sort[keyOrList] = direction;
        break;
      case 'array':
        this.sort = {};
        keyOrList.forEach((v) => {
          const key = v[0];
          const val = v[1];
          this.sort[key] = val;
        });
        break;
      case 'object':
        this.sort = keyOrList;
        break;
      default:
        break;
    }
  }

  stream(options) {
    const readableStream = new Stream.Readable();
    process.nextTick(() => {
      let documents = this.__getDocuments();
      if (options && typeof options.transform === 'function') {
        documents = documents.map(options.transform);
      }
      documents.forEach(doc => readableStream.push(doc));
    });
    return readableStream;
  }

  toArray(callback) {
    const documents = this.__getDocuments();
    if (!callback) {
      return Promise.resolve(documents);
    }
    callback(null, documents);
  }

  unpipe(destination) {
    return this.cursorStream.unpipe(destination);
  }

  unshift(chunk) {
    return this.cursorStream.unshift(chunk);
  }

  wrap(stream) {
    return this.cursorStream.wrap(stream);
  }
}

Cursor.INIT = 0;
Cursor.OPEN = 1;
Cursor.CLOSED = 2;

module.exports = Cursor;
