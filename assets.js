'use strict'

const Fastify = require('fastify')
const minimist = require('minimist')
const service = require('./lib/assets')

function start (opts) {
  opts = opts || {}

  if (opts.verbose) {
    opts.logger = {
      level: 'info'
    }
  }

  const server = Fastify(opts)
  server.register(service, opts)
  server.listen(opts.port, (err) => {
    if (err) {
      throw err
    }
  })
}

module.exports = service

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
