'use strict'

const Assets = require('@matteo.collina/assets-pg')

module.exports = function (server, options, next) {
  if (!options.connString) {
    return next(new Error('assets needs a connString option'))
  }
  const assets = Assets(options.connString)

  server.get('/', (request, reply) => {
    reply.type('text/plain').send('Hello World')
  })

  assets.createSchema(function (err) {
    if (err) {
      if (err.message !== 'relation "assets" already exists') {
        return next(err)
      }

      // TODO handle schema versions and migrations
    }

    next()
  })

  server.onClose(function () {
    assets.end()
  })
}
