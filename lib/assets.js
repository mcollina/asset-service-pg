'use strict'

module.exports = function (server, options, next) {
  server.get('/', (request, reply) => {
    reply.type('text/plain').send('Hello World')
  })

  next()
}
