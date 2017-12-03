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

test('POST an asset - missing name', function (t) {
  const asset = {
    status: 'wait'
  }
  server.inject({
    method: 'POST',
    url: '/',
    payload: asset
  }, function (response) {
    t.equal(response.statusCode, 422)
    t.end()
  })
})

test('GET / is a 404', function (t) {
  server.inject({
    method: 'GET',
    url: `/`
  }, function (response) {
    t.equal(response.statusCode, 404)
    t.end()
  })
})

test('GET /abc is a 400', function (t) {
  server.inject({
    method: 'GET',
    url: `/abc`
  }, function (response) {
    t.equal(response.statusCode, 404)
    t.end()
  })
})

test('PUT an asset', function (t) {
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
    const id = Number(response.headers['location'].slice(1))
    const url = '/' + id

    asset.status = 'operational'
    server.inject({
      method: 'PUT',
      url,
      payload: asset
    }, function (response) {
      t.equal(response.statusCode, 200)
      asset.id = id
      t.deepEqual(JSON.parse(response.payload), asset)
      t.end()
    })
  })
})
