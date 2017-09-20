

[![Build Status](https://travis-ci.org/javiercbk/naive-mongo.svg?branch=master)](https://travis-ci.org/javiercbk/naive-mongo)
[![Coverage Status](https://coveralls.io/repos/javiercbk/naive-mongo/badge.svg?branch=master)](https://coveralls.io/r/javiercbk/naive-mongo?branch=master)

# Naive Mongo

A naive mongodb driver that simulates a mongodb in-memory server.

## Goals

This library is a naive (array based) mongodb implementation. It does as little as possible to get the job done (meaning no optimizations whatsoever).

It is was created to be as simple as possible and intended to be used in unit test.

## Features

* Aggregation.
* Queries.
* Updates.
* Insertions.

It does not support `$text` index search

