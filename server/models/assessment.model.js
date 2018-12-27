const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  wav_base64_ran_assess: {
    type: String,
    required: true
  },
  google_speech_to_text_ran_assess: {
    type: String,
    required: false
  }
});

module.exports = mongoose.model('AssessmentData', AssessmentSchema);
