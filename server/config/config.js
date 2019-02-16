const Joi = require('joi')

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require('dotenv').config()

// define validation for all the env vars
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow(['development', 'production', 'test', 'provision'])
    .default('development'),
  SERVER_PORT: Joi.number()
    .default(4040),
  // MONGOOSE_DEBUG: Joi.boolean()
  //   .when('NODE_ENV', {
  //     is: Joi.string().equal('development'),
  //     then: Joi.boolean().default(true),
  //     otherwise: Joi.boolean().default(false)
  //   }),
  JWT_SECRET: Joi.string().required()
    .description('JWT Secret required to sign')// ,
  // MONGO_HOST: Joi.string().required()
  //   .description('Mongo DB host url'),
  // MONGO_PORT: Joi.number()
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
  port: process.env.SEVER_PORT || envVars.SERVER_PORT,
  // mongooseDebug: envVars.MONGOOSE_DEBUG,
  jwtSecret: process.env.JWT_SECRET || envVars.JWT_SECRET,
  frontend: envVars.MEAN_FRONTEND || 'angular'// ,
  // mongo: {
  //   host: envVars.MONGO_HOST,
  //   port: envVars.MONGO_PORT
  // }
}

module.exports = config
