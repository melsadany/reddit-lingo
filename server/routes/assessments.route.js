const express = require('express')
const assessCtrl = require('../controllers/assessments.controller')

const router = express.Router()

router.post('/SaveAssessments', (req, res) => {
  assessCtrl.updateAssessmentData(req.body)
    .then(res.send('Success'))
    .catch((err) => {
      console.log(err)
      res.send(err)
    })
})

router.post('/PushOneSingleAudioData', (req, res) => {
  assessCtrl.pushOneAudioAssessmentData(req.body)
    .then(res.send('Success'))
    .catch((err) => {
      console.log(err)
      res.send(err)
    })
})

router.get('/GetUserAssessment/:user_id', (req, res) => {
  let query = assessCtrl.getUserAssessmentData(req.params.user_id)
  query.exec((err, data) => {
    if (err) {
      res.sendStatus(404, err)
    } else if (!data) {
      assessCtrl.insertNewAssessmentData({
        user_id: req.params.user_id,
        assessments: [],
        google_speech_to_text_assess: []
      }).then((data) => {
        res.set({
          'Content-Type': 'application/json'
        })
        res.send(data)
      })
    } else {
      res.set({
        'Content-Type': 'application/json'
      })
      console.log(data)
      res.send(data)
    }
  })
})

router.get('/NextUserId', (req, res) => {
  let query = assessCtrl.getNextUserID()
  query.exec((err, data) => {
    if (err) {
      res.sendStatus(404, err)
    } else {
      const nextID = data.nextID
      data.nextID = ++data.nextID
      data.save()
      res.set({
        'Content-Type': 'application/json'
      })
      res.send({
        'nextID': nextID
      })
    }
  })
})

module.exports = router
