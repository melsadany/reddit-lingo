const Joi = require('joi')
const AssessmentModel = require('../models/assessment.model')

const AssessmentSchemaValidator = Joi.object({
  user_id: Joi.number().required(),
  assessments: Joi.array(),
  google_speech_to_text_assess: Joi.array()
})

async function insertNewAssessmentData(reqData) {
  await Joi.validate(reqData, AssessmentSchemaValidator, {
    abortEarly: false
  })
  return new AssessmentModel(reqData).save()
}

function getUserAssessmentData(searchUserId) {
  return AssessmentModel.find({
    user_id: searchUserId
  })
}

module.exports = {
  insertNewAssessmentData,
  getUserAssessmentData
}
