const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AssessmentSchema = new Schema({
  user_id: Number,
  assessments: [],
  google_speech_to_text_assess: []
})

module.exports = mongoose.model('AssessmentData', AssessmentSchema)
