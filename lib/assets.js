'use strict'

const Assets = require('@matteo.collina/assets-pg')

module.exports = function (server, options, next) {
  if (!options.connString) {
    return next(new Error('assets needs a connString option'))
  }
  const assets = Assets(options.connString)

  const schemaParamsId = {
    // needed for type coercion
    type: 'object',
    properties: {
      id: {
        type: 'number'
      }
    }
  }

  server.get('/:id(^\\d+)', {
    schema: {
      params: schemaParamsId
    },
    response: {
      '2xx': assets.jsonSchema
    }
  }, (request, reply) => {
    assets.get(request.params.id, (err, asset) => {
      if (err) {
        return reply.send(err)
      }
      reply.send(asset)
    })
  })

  server.post('/', {
    response: {
      '2xx': assets.jsonSchema
    }
  }, store)

  server.put('/:id(\\d+)', {
    // needed for type coercion
    schema: {
      params: schemaParamsId
    },
    response: {
      '2xx': assets.jsonSchema
    }
  }, store)

  assets.createSchema(function (err) {
    if (err) {
      if (err.message !== 'relation "assets" already exists') {
        return next(err)
      }

      // TODO handle schema versions and migrations
      // or maybe do not do this here in the first place
    }

    next()
  })

  server.onClose(function () {
    assets.end()
  })

  function store (request, reply) {
    const hasId = !!(request.params.id || request.body.id)
    request.body.id = request.body.id || request.params.id
    // validation is already performed inside assets.put
    assets.put(request.body, (err, obj) => {
      if (err) {
        reply.send(err)
        return
      }
      if (!hasId) {
        reply.code(201).header('location', '/' + obj.id)
      }
      reply.send(obj)
    })
  }
}
