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
  const dataPromise = assessCtrl.getUserAssessmentData(req.params.user_id)
  dataPromise.then((data) => {
    res.set({
      'Content-Type': 'application/json'
    })
    console.log(data)
    res.send(data)
  }).catch((err) => res.sendStatus(404, err))

  // query.exec((err, data) => {
  //   if (err) {
  //     res.sendStatus(404, err)
  //   } else if (!data) {
  //     assessCtrl.insertFreshAssessmentData({
  //       user_id: req.params.user_id,
  //       assessments: [],
  //       google_speech_to_text_assess: []
  //     }).then((data) => {
  //       res.set({
  //         'Content-Type': 'application/json'
  //       })
  //       res.send(data)
  //     })
  //   } else {
  //     res.set({
  //       'Content-Type': 'application/json'
  //     })
  //     console.log(data)
  //     res.send(data)
  //   }
  // })
})

router.get('/NextUserId', (req, res) => {
  assessCtrl.getNextUserID().then((userID) => {
    res.set({
      'Content-Type': 'application/json'
    })
    res.send({
      'nextID': userID
    })
  })
  // query.exec((err, data) => {
  //   if (err) {
  //     res.sendStatus(404, err)
  //   } else {
  //     const nextID = data.nextID
  //     data.nextID = ++data.nextID
  //     data.save()
  //     res.set({
  //       'Content-Type': 'application/json'
  //     })
  //     res.send({
  //       'nextID': nextID
  //     })
  //   }
  // })
})

module.exports = router
