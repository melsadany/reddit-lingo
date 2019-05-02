const Joi = require('joi')

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require('dotenv').config()

// define validation for all the env vars
const envVarsSchema = Joi.object({
    NODE_ENV: Joi.string()
      .allow(['development', 'production', 'test', 'provision'])
      .default('development'),
    SERVER_PORT: Joi.number()
      .default(8080)
  }).unknown()
  .required()

const {
  error,
  value: envVars
} = Joi.validate(process.env, envVarsSchema)
if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const config = {
  env: process.env.NODE_ENV || envVars.NODE_ENV,
  port: process.env.PORT || envVars.SERVER_PORT,
  frontend: envVars.MEAN_FRONTEND || 'angular'
}

module.exports = config
