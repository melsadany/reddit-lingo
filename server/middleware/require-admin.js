const HTTPError = require('http-errors')

const requireAdmin = function (req, res, next) {
  if (req.user && req.user.roles.indexOf('admin') > -1) {
    return next()
  }
  const err = new HTTPError(401)
  return next(err)
}

module.exports = requireAdmin
