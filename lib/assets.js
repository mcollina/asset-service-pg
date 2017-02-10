'use strict'

exports.register = function (server, options, next) {
  function hello (request, reply) {
    reply('Hello World')
  }

  server.route({ method: 'GET', path: '/', handler: hello })

  next()
}

exports.register.attributes = {
  name: 'assets',
  version: require('../package.json').version
}
