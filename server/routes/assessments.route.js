const express = require('express')
const assessCtrl = require('../controllers/assessments.controller')

const router = express.Router()

router.post('/SaveAssessments', (req, res) => {
  assessCtrl.updateAssessmentData(req.body)
  res.cookie(req.body.assessments[0].assess_name, 'completed', {
    httpOnly: false
  })
  res.send('Success')
})

router.get('/GetUserAssessment/:user_id', (req, res) => {
  let assessmentsQuery = assessCtrl.getUserAssessmentData(req.params.user_id)
  assessmentsQuery.exec((error, queryValue) => {
    if (error) {
      res.sendStatus(400, error)
    } else if (queryValue.length === 0) {
      assessCtrl.insertNewAssessmentData({
        user_id: req.params.user_id,
        assessments: [],
        google_speech_to_text_assess: []
      }).then(() => {
        res.sendStatus(200, 'User ID not found. Adding blank document to database.')
      })
    } else if (queryValue.length > 1) {
      res.send('Queried ID matched more than one entry: ' + req.params.user_id)
    } else {
      let filename = `${req.params.user_id}_assessment_data.json`
      res.set({
        'Content-Disposition': 'attachment; filename' + filename
      })
      res.send(queryValue[0])
    }
  })
})

module.exports = router
