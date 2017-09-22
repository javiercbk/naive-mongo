[![version](https://img.shields.io/npm/v/naive-mongo.svg)](https://www.npmjs.org/package/naive-mongo)
[![Build Status](https://travis-ci.org/javiercbk/naive-mongo.svg?branch=master)](https://travis-ci.org/javiercbk/naive-mongo)
[![npm](https://img.shields.io/npm/dt/naive-mongo.svg)](https://www.npmjs.org/package/naive-mongo)
[![Coverage Status](https://coveralls.io/repos/github/javiercbk/naive-mongo/badge.svg?branch=master)](https://coveralls.io/github/javiercbk/naive-mongo?branch=master)
# Naive Mongo 

A naive mongodb driver that simulates a mongodb in-memory server.

## Goals & features

This library is a naive (array based) mongodb implementation. It does as little as possible to get the job done (meaning no optimizations whatsoever).

It implements nearly all collection's methods of the [mongodb native driver](http://mongodb.github.io/node-mongodb-native/2.2/api/), thus it can be used along mongoose as well.

It supports:

* Aggregation (Not all options)
* Queries (Most conditions).
* Updates (All operations but not all options).
* Insertions (Not all options).

It does not support:

* `$text` searches.

This library is not checking paramenters YET, a misplaced parameter might result in an error.

## Usage

```js
const { MongoClient } = require('naive-mongo');
MongoClient.connect(`mongodb://some.nasty.fake.host:8080/test`, ((err, db) => {
  const collection = db.collection('sample')
  collection.insert({ nice: true }).then((newDoc) => {
    console.log(newDoc);
  }).catch((insertError) => {
    console.log(insertError);
  });
});
```

## Why would you use this?
* Unit testing
* Mocking an API

## Is it performant?

This library isn't supposed to be performant, but a simple mongodb implementation to make quick and dirty queries.

## Version number

The version number matches the MAJOR.MINOR version of mongo driver.

## Query engine

The query engine is based in [mingo](https://github.com/kofrasa/mingo).

## LICENSE
MIT
