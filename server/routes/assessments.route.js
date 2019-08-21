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

router.post('/PushOnePieceData', (req, res) => {
  assessCtrl.pushOnePieceAssessmentData(req.body)
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
      'Content-Type': 'application/json',
      'Content-disposition': 'attachment; filename=' + req.params.user_id + '.json'
    })
    console.log(data)
    res.send(data)
  }).catch((err) => res.sendStatus(404, err))
})

router.get('/NextUserId', (req, res) => {
  assessCtrl.getNextUserID().then((userID) => {
    res.set({
      'Content-Type': 'application/json'
    })
    res.send({
      'nextID': userID
    })
  }).catch((error) => {
    console.log(error)
    res.send(error)
  })
})

router.get('/InitializeSingleUserAssessment/:hash_key', (req, res) => {
  assessCtrl.sendHashKey(req.params.hash_key).then((data) => res.send(data)).catch((err) => {
    console.log(err)
    res.send(err)
  })
})

router.get('/GetAssets', (req, res) => {
  assessCtrl.getAssets(req.query).then(obj => {
    res.set({
      'Content-Type': 'application/json'
    })
    res.send(obj)
  }).catch(err => console.log(err))
})

module.exports = router
