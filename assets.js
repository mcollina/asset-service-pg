'use strict'

var Hapi = require('hapi')
var xtend = require('xtend')
var minimist = require('minimist')
var defaults = {
  port: 8989
}

function assetsService (opts, cb) {
  opts = xtend(defaults, opts)

  var server = new Hapi.Server()

  server.connection({ port: opts.port })

  server.register(require('./lib/assets'), (err) => {
    cb(err, server)
  })

  return server
}

function start (opts) {
  assetsService(opts, (err, server) => {
    if (err) { throw err }
    server.start((err) => {
      if (err) { throw err }
      console.log('Server running at:', server.info.uri)
    })
  })
}

module.exports = assetsService

if (require.main === module) {
  start(minimist(process.argv.slice(2), {
    integer: 'port',
    alias: {
      'port': 'p'
    },
    default: {
      port: 3000
    }
  }))
}
