const Joi = require('joi');
const AssessmentModel = require('../models/assessment.model');

const AssessmentSchema = Joi.object({
  user_id: Joi.string().required(),
  wav_base64_ran_assess: Joi.string().required(),
  google_speech_to_text_ran_assess: Joi.string()
})


module.exports = {
  insert,
  getWavBase64
};

async function insert(assessmentData) {
  insert_assessment = await Joi.validate(assessmentData, AssessmentSchema, {
    abortEarly: false
  });
  return await new AssessmentModel(assessmentData).save();
}

function getWavBase64(user_id) {
  return AssessmentModel.find({
    user_id: user_id
  });
}
