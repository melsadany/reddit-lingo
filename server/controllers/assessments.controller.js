const Joi = require('joi')
// const AssessmentModel = require('../models/assessment.model')
// const UserIDCounterModel = require('../models/useridcounter.model')
const fs = require('fs')
const path = require('path')

const AssessmentSchemaValidator = Joi.object({
  user_id: Joi.number().required(),
  assessments: Joi.array(),
  google_speech_to_text_assess: Joi.array()
})

async function insertFreshAssessmentData(reqData) {
  await Joi.validate(reqData, AssessmentSchemaValidator, {
    abortEarly: false
  })
  const userID = reqData.user_id
  if (!fs.existsSync(path.join('assessmentData', userID))) {
    fs.mkdirSync(path.join('assessmentData', userID), {
      recursive: true
    })
  }
  const freshData = JSON.stringify(reqData)
  const fileName = path.join('assessmentData', userID, userID + '.json')
  return new Promise((resolve, reject) => {
    fs.writeFile(fileName, freshData, (err) => {
      if (err) {
        reject(err)
      }
    })
    resolve(freshData)
  })
}

async function updateAssessmentData(reqData) {
  const userID = reqData.user_id
  const fileName = path.join('assessmentData', userID, userID + '.json')
  fs.readFile(fileName, 'utf-8', (err, data) => {
    if (err) console.log(err)
    const dataFile = JSON.parse(data)
    dataFile.assessments.push(reqData.assessments[0])
    fs.writeFile(fileName, JSON.stringify(dataFile), (err) => {
      if (err) {
        console.log(err)
      }
    })
  })
}

async function pushOnePieceAssessmentData(reqData) {
  let selector = ''
  const userID = reqData.user_id
  if (reqData.assessments[0].data.recorded_data) {
    selector = 'recorded_data'
  } else if (reqData.assessments[0].data.selection_data) {
    selector = 'selection_data'
  } else {
    console.log('Selector error')
  }
  const fileName = path.join('assessmentData', userID, userID + '.json')
  fs.readFile(fileName, 'utf-8', (err, data) => {
    if (err) console.log(err)
    const dataFile = JSON.parse(data)
    for (let i = 0; i < dataFile.assessments.length; i++) {
      if (dataFile.assessments[i].assess_name === reqData.assessments[0].assess_name) {
        dataFile.assessments[i].data[selector].push(
          reqData.assessments[0].data[selector][0]
        )
        if (reqData.assessments[0].completed === true) {
          dataFile.assessments[i].completed = true
        }
      }
    }
    fs.writeFile(fileName, JSON.stringify(dataFile), (err) => {
      if (err) {
        console.log(err)
      }
    })
  })
}

function getUserAssessmentData(searchUserId) {
  const userID = searchUserId
  const fileName = path.join('assessmentData', userID, userID + '.json')
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, 'utf-8', (err, data) => {
      if (err) {
        resolve(insertFreshAssessmentData({
          user_id: userID,
          assessments: [],
          google_speech_to_text_assess: []
        }))
      } else {
        resolve(JSON.parse(data))
      }
    })
  })
}

function insertNewIDJson() {
  const fileName = path.join('assessmentData', 'userID', 'nextUserID' + '.json')
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path.join('assessmentData', 'userID'))) {
      console.log('Making UserIDJson directory')
      fs.mkdirSync(path.join('assessmentData', 'userID'), {
        recursive: true
      })
      fs.writeFile(fileName, JSON.stringify({
        'userID': 0
      }), (err) => {
        if (err) {
          reject(err)
        } else {
          console.log('Successfully saved new ID json')
          resolve(0)
        }
      })
    }
  })
}

function getNextUserID() {
  const fileName = path.join('assessmentData', 'userID', 'nextUserID' + '.json')
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, 'utf-8', (err, data) => {
      if (err) {
        console.log(err)
        resolve(insertNewIDJson())
      } else {
        let currentID = JSON.parse(data).userID
        fs.writeFile(fileName, JSON.stringify({
          'userID': ++currentID
        }), (err) => {
          if (err) {
            console.log(err)
          } else {
            console.log('Successfully updated ID json')
          }
        })
        resolve(currentID)
      }
    })
  })
}

module.exports = {
  insertFreshAssessmentData,
  pushOnePieceAssessmentData,
  getUserAssessmentData,
  updateAssessmentData,
  getNextUserID
}
