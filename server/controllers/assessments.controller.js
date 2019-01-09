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
async function updateAssessmentData(reqData) {
  let condition = {
    user_id: reqData.user_id
  }
  AssessmentModel.findOne(condition, (err, doc) => {
    if (err) console.log(err)
    doc.assessments.push(reqData.assessments[0])
    doc.google_speech_to_text_assess.push(reqData.google_speech_to_text_assess[0])
    doc.save()
  })
}

function getUserAssessmentData(searchUserId) {
  return AssessmentModel.find({
    user_id: searchUserId
  })
}

module.exports = {
  insertNewAssessmentData,
  getUserAssessmentData,
  updateAssessmentData
}
