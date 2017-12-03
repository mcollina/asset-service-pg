'use strict'

const tap = require('tap')
const Fastify = require('fastify')
const { beforeEach, afterEach, test } = tap
const assetsService = require('../')
const connString = 'postgres://localhost/assets_tests'

let server
beforeEach((done) => {
  server = Fastify()
  server.register(assetsService, {
    connString
  })
  server.ready(done)
})

afterEach((done) => {
  server.close(done)
})

test('Hello', function (t) {
  const options = { method: 'GET', url: '/' }
  server.inject(options, function (response) {
    t.equal(response.payload, 'Hello World')
    t.end()
  })
})
