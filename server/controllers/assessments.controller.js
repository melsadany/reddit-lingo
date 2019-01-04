const Joi = require('joi')
const AssessmentModel = require('../models/assessment.model')

const AssessmentSchemaValidator = Joi.object({
  user_id: Joi.number().required(),
  assessments: Joi.array(),
  google_speech_to_text_assess: Joi.array()
})

module.exports = {
  insertNewAssessmentData,
  getUserAssessmentData
}

async function insertNewAssessmentData (incomingAssessmentData) {
  await Joi.validate(incomingAssessmentData, AssessmentSchemaValidator, {
    abortEarly: false
  })
  return new AssessmentModel(incomingAssessmentData).save()
}

function getUserAssessmentData (searchUserId) {
  return AssessmentModel.find({
    user_id: searchUserId
  })
}
