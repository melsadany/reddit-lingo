const mongoose = require('mongoose');

const RanSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  wav_base64: {
    type: String,
    required: true
  },
  google_speech_to_text: {
    type: String,
    required: false
  }
});

module.exports = mongoose.model('Ran', RanSchema);
