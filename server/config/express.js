const path = require('path')
const express = require('express')
const HTTPError = require('http-errors')
const logger = require('morgan')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const compress = require('compression')
const methodOverride = require('method-override')
const cors = require('cors')
const helmet = require('helmet')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json')
const routes = require('../routes/index.route')
const config = require('./config')

const app = express()

if (config.env === 'development') {
  app.use(logger('dev'))
}
// Front end directory
const distDir = '../../dist/'
const docsDir = '../../docs/'
app.use('/api/static/', express.static(path.join(__dirname, docsDir)))

app.use(express.static(path.join(__dirname, distDir)))

app.use(/^((?!(api)).)*/, (req, res) => {
  res.sendFile(path.join(__dirname, distDir + '/index.html'))
})

console.log('Distributing front end from ' + distDir)

app.use(bodyParser.json({
  limit: '50mb'
}))
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(compress())
app.use(methodOverride())
app.use(cookieParser())

// secure apps by setting various HTTP headers
app.use(helmet())

// enable CORS - Cross Origin Resource Sharing
app.use(cors())

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// API router
app.use('/api/', routes)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new HTTPError(404)
  return next(err)
})

// error handler, send stacktrace only during development
app.use((err, req, res, next) => {
  // customize Joi validation errors
  if (err.isJoi) {
    err.message = err.details.map(e => e.message).join('; ')
    err.status = 400
  }

  res.status(err.status || 500).json({
    message: err.message
  })
  next(err)
})

module.exports = app
