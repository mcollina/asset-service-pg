'use strict'

const Fastify = require('fastify')
const {
  beforeEach,
  afterEach,
  tearDown,
  test
} = require('tap')
const assetsService = require('../')
const connString = 'postgres://localhost/assets_tests'
const Assets = require('@matteo.collina/assets-pg')
const db = Assets(connString)

let server
beforeEach((done) => {
  db.dropSchema(() => {
    // ignore errors
    db.createSchema((err) => {
      if (err) {
        return done(err)
      }

      server = Fastify()
      server.register(assetsService, {
        connString
      })
      server.ready(done)
    })
  })
})

afterEach((done) => {
  server.close(done)
})

tearDown(db.end)

test('POST an asset', function (t) {
  const asset = {
    name: 'my long asset',
    status: 'wait'
  }
  server.inject({
    method: 'POST',
    url: '/',
    payload: asset
  }, function (response) {
    t.equal(response.statusCode, 201)
    t.ok(response.headers['location'])
    // the ID matches the one in the locaiton header
    asset.id = Number(response.headers['location'].slice(1))
    t.deepEqual(JSON.parse(response.payload), asset)
    t.end()
  })
})

test('GET an asset', function (t) {
  const asset = {
    name: 'my long asset',
    status: 'wait'
  }
  db.put(asset, (err, asset) => {
    t.error(err)

    server.inject({
      method: 'GET',
      url: `/${asset.id}`
    }, function (response) {
      t.equal(response.statusCode, 200)
      t.deepEqual(JSON.parse(response.payload), asset)
      t.end()
    })
  })
})
