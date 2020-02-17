const express = require('express')
const assessCtrl = require('../controllers/assessments.controller')
const router = express.Router()

router.post('/SaveAssessments', (req, res) => {
  assessCtrl.updateAssessmentData(req.body)
    .then(data => { 
      res.set({
      'Content-Type': 'application/json',
      'Content-disposition': 'attachment; filename=' + req.params.user_id + '.json'
    });
    if (req.body.sendBackData) {res.send(data)} else  res.json({success:true})
    })
    .catch((err) => {
      console.log(err)
      res.send(err)
    })
})
//sending recorded audio if prompt > 0
router.post('/PushOnePieceData', (req, res) => {
  assessCtrl.pushOnePieceAssessmentData(req.body)
    .then(res.send('Success'))
    .catch((err) => {
      console.log(err)
      res.send(err)
    })
})
//call if we just want to check if a user exist with it not automatically creating a new file if it doesn't
router.get('/CheckUserExist/:user_id',(req,res) => {

  const dataPromise = assessCtrl.checkUserExist(req.params.user_id)
  dataPromise.then((data) => {
    if (data!=false){
      res.set({
        'Content-Type': 'application/json',
        'Content-disposition': 'attachment; filename=' + req.params.user_id + '.json'
      })
      //console.log(data)
      res.send(data)
    }
    else {
      res.send(false)
    }
  }).catch((err) => res.sendStatus(404, err))
})

//call if we want there to be a new written file if user doesnt exist 
router.get('/GetUserAssessment/:user_id/:date', (req, res) => {
  const dataPromise = assessCtrl.getUserAssessmentData(req.params.user_id,req.params.date)
  dataPromise.then((data) => {
    res.set({
      'Content-Type': 'application/json',
      'Content-disposition': 'attachment; filename=' + req.params.user_id + '.json'
    })
    console.log(data)
    res.send(data)
  }).catch((err) => res.sendStatus(404, err))
})
//don't need anymore [:BT]
/*
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
*/
//adds ending time of finishing assessment
router.get('/AddEndTime/:user_id',(req,res) => {
  const dataPromise = assessCtrl.addEndTime(req.params.user_id)
  dataPromise.then(() => {
    res.set({
      'Content-Type': 'application/json'
    })
    res.send({MyStatus:200});
  }).catch((err) => {res.sendStatus(404, err)})
});

router.get('/InitializeSingleUserAssessment/:hash_key/:user_id/:date', (req, res) => {
  assessCtrl.sendHashKey(req.params.hash_key,req.params.user_id,req.params.date).then((data) => res.send(data)).catch((err) => {
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
