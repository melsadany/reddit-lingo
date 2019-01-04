const express = require('express')
const assessCtrl = require('../controllers/assessments.controller')

const router = express.Router()

router.post('/SaveAssessments', (req, res) => {
  assessCtrl.insertNewAssessmentData(req.body)
    .then((product) => {
      res.send('Success')
      console.log(product)
    })
    // KRM: TODO: Figure out best thing to do with
    // the assessment model here
    .catch((error) => res.send(error))
})

router.get('/GetUserAssessment/:user_id', (req, res) => {
  let assessmentsQuery = assessCtrl.getUserAssessmentData(req.params.user_id)
  assessmentsQuery.exec((error, queryValue) => {
    if (error) {
      res.sendStatus(400, error)
    } else if (queryValue.length === 0) {
      res.send(404, 'User ID not found.')
    } else if (queryValue.length > 1) {
      res.send('Queried ID matched more than one entry: ' + req.params.user_id)
    } else {
      let filename = `=${req.params.user_id}_assessment_data.json`
      res.set({
        'Content-Disposition': 'attachment; filename' + filename
      })
      res.send(queryValue[0])
    }
  })
})

module.exports = router
