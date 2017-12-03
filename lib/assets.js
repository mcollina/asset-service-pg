'use strict'

const Assets = require('@matteo.collina/assets-pg')

module.exports = function (server, options, next) {
  if (!options.connString) {
    return next(new Error('assets needs a connString option'))
  }
  const assets = Assets(options.connString)

  server.get('/:id', (request, reply) => {
    assets.get(request.params.id, (err, asset) => {
      if (err) {
        return reply.send(err)
      }
      reply.send(asset)
    })
  })

  server.post('/', (request, reply) => {
    assets.put(request.body, (err, obj) => {
      if (err) {
        reply.send(err)
        return
      }
      reply.code(201).header('location', '/' + obj.id).send(obj)
    })
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
