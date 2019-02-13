const Joi = require('joi')
const AssessmentModel = require('../models/assessment.model')
const UserIDCounterModel = require('../models/useridcounter.model')
const fs = require('fs')
const path = require('path')

const AssessmentSchemaValidator = Joi.object({
  user_id: Joi.number().required(),
  assessments: Joi.array(),
  google_speech_to_text_assess: Joi.array()
})

async function insertNewAssessmentData(reqData) {
  await Joi.validate(reqData, AssessmentSchemaValidator, {
    abortEarly: false
  })
  const userID =
    reqData.user_id
  if (!fs.existsSync(path.join('assessmentData', userID))) {
    console.log('making directory')
    fs.mkdirSync(path.join('assessmentData', userID), {
      recursive: true
    })
  }
  const fileName = path.join('assessmentData', userID, userID + '.json')
  fs.writeFile(fileName, JSON.stringify(reqData), (err) => {
    if (err) {
      console.log(err)
    }
  })
  // return new AssessmentModel(reqData).save()
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
//   // AssessmentModel.findOne(condition, (err, doc) => {
//   //   if (err) console.log(err)
//   //   if (reqData.assessments[0].data.recorded_data) {
//   //     if (!fs.existsSync(path.join('assessmentRecordingData', reqData.user_id, reqData.assessments[0].assess_name))) {
//   //       console.log('making directory')
//   //       fs.mkdirSync(path.join('assessmentRecordingData', reqData.user_id, reqData.assessments[0].assess_name), {
//   //         recursive: true
//   //       }).catch((reason) => console.log(reason))
// }
// const fileName = 'assessmentRecordingData/' + reqData.user_id + '/' + reqData.assessments[0].assess_name + '_' + reqData.assessments[0].data.recorded_data[0].prompt_number
// fs.writeFile(fileName, JSON.stringify(reqData.assessments[0].data.recorded_data[0]), (err) => {
//   if (err) {
//     console.log(err)
//   }
// })
// const dataWithPath = {
//   prompt_number: reqData.assessments[0].data.recorded_data[0].prompt_number,
//   recorded_file_path: fileName
// }
// reqData.assessments[0].data = dataWithPath
// }
// doc.assessments.push(reqData.assessments[0])
// doc.google_speech_to_text_assess.push(reqData.google_speech_to_text_assess[0])
// doc.save()
// })
// }

// async function pushOneAudioAssessmentData(reqData) {
//   let condition = {
//     user_id: reqData.user_id
//   }
//   const fileName = reqData.assessments[0].assess_name + '_' + reqData.assessments[0].data.recorded_data[0].prompt_number
//   fs.writeFile(fileName, JSON.stringify(reqData.assessments[0].data.recorded_data[0]), (err) => console.log(err))
//   AssessmentModel.findOne(condition, (err, doc) => {
//     if (err) console.log(err)
//     for (let i = 0; i < doc.assessments.length; i++) {
//       if (doc.assessments[i].assess_name === reqData.assessments[0].assess_name) {
//         // doc.assessments[i].data.recorded_data.push(reqData.assessments[0].data.recorded_data[0])
//         doc.assessments[i].data.recorded_data.push({
//           prompt_number: reqData.assessments[0].data.recorded_data[0].prompt_number,
//           recorded_file_path: fileName
//         })
//         if (reqData.assessments[0].completed === true) {
//           doc.assessments[i].completed = true
//         }
//         doc.markModified('assessments')
//         break
//       }
//     }
//     doc.save()
//   })
// }

function getUserAssessmentData(searchUserId) {
  const userID = searchUserId
  const fileName = path.join('assessmentData', userID, userID + '.json')
  const data = fs.readFileSync(fileName, 'utf-8')
  const dataFile = JSON.parse(data)
  console.log(dataFile)
}

function getNextUserID() {
  return UserIDCounterModel.findOne({})
}

module.exports = {
  insertNewAssessmentData,
  // pushOneAudioAssessmentData,
  getUserAssessmentData,
  updateAssessmentData,
  getNextUserID
}
