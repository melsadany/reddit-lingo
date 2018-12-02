const bcrypt = require('bcrypt');
const Joi = require('joi');
const Ran = require('../models/ran.model');

const ranSchema = Joi.object({
  user_id: Joi.string().required(),
  path_to_wave: Joi.string().required(),
  google_speech_to_text: Joi.string()
})


module.exports = {
  insert
};

async function insert(ran) {
  insert_ran = await Joi.validate(ran, ranSchema, { abortEarly: false });
  return await new Ran(insert_ran).save();
}
