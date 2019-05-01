const Joi = require('joi')
const fs = require('fs')
const path = require('path')
const archiver = require('archiver')
const AWS = require('aws-sdk')
let s3 = new AWS.S3()
const LINGO_DATA_PATH = path.join(__dirname, '../', '../', 'assessment_data')
const LINGO_BUCKET_NAME = process.env.LINGO_BUCKET

const AssessmentSchemaValidator = Joi.object({
  user_id: Joi.number().required(),
  assessments: Joi.array(),
  google_speech_to_text_assess: Joi.array()
})

async function insertFreshAssessmentData(reqData) {
  console.log('Insert fresh assessment data')
  await Joi.validate(reqData, AssessmentSchemaValidator, {
    abortEarly: false
  })
  const userID = reqData.user_id
  console.log(path.join(LINGO_DATA_PATH, userID))
  if (!fs.existsSync(path.join(LINGO_DATA_PATH, userID))) {
    fs.mkdirSync(path.join(LINGO_DATA_PATH, userID), {
      recursive: true
    })
    fs.mkdirSync(path.join(LINGO_DATA_PATH, userID, 'recording_data'))
  }
  const freshData = JSON.stringify(reqData)
  const fileName = path.join(LINGO_DATA_PATH, userID, userID + '.json')
  return new Promise((resolve, reject) => {
    fs.writeFile(fileName, freshData, (err) => {
      if (err) {
        console.log(err)
      } else {
        uploadDir(path.join(LINGO_DATA_PATH), LINGO_BUCKET_NAME)
        resolve(freshData)
      }
    })
  })
}

async function updateAssessmentData(reqData) {
  // console.log(reqData)
  // KRM: For seeing what data was already stored for a user
  let hashKey
  let userID
  let fileName
  return new Promise((resolve, reject) => {
    if (reqData.hash_key) {
      hashKey = reqData.hash_key
      fileName = path.join(LINGO_DATA_PATH, 'single_assessment', hashKey, hashKey + '.json')
    } else {
      userID = reqData.user_id
      fileName = path.join(LINGO_DATA_PATH, userID, userID + '.json')
    }
    if (reqData.assessments[0].data.recorded_data) {
      saveWavFile(reqData, userID, hashKey, 'recorded_data')
    }
    fs.readFile(fileName, 'utf-8', (err, data) => {
      if (err) {
        console.log(err)
      }
      const dataFile = JSON.parse(data)
      dataFile.assessments.push(reqData.assessments[0])
      fs.writeFile(fileName, JSON.stringify(dataFile), (err) => {
        if (err) {
          console.log(err)
          reject(err)
        } else {
          uploadDir(path.join(LINGO_DATA_PATH), LINGO_BUCKET_NAME)
          resolve(dataFile)
        }
      })
    })
  })
}

async function pushOnePieceAssessmentData(reqData) {
  let hashKey
  let userID
  let fileName
  return new Promise((resolve, reject) => {
    if (reqData.hash_key) {
      hashKey = reqData.hash_key
      fileName = path.join(LINGO_DATA_PATH, 'single_assessment', hashKey, hashKey + '.json')
    } else {
      userID = reqData.user_id
      fileName = path.join(LINGO_DATA_PATH, userID, userID + '.json')
    }
    let selector = ''
    if (reqData.assessments[0].data.recorded_data) {
      selector = 'recorded_data'
      saveWavFile(reqData, userID, hashKey, selector)
    } else if (reqData.assessments[0].data.selection_data) {
      selector = 'selection_data'
    } else {
      console.log('Selector error')
    }
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
          reject(err)
        } else {
          uploadDir(path.join(LINGO_DATA_PATH), LINGO_BUCKET_NAME, selector)
          resolve(dataFile)
        }
      })
    })
  })
}

function getUserAssessmentData(searchUserId) {
  const userID = searchUserId
  const fileName = path.join(LINGO_DATA_PATH, userID, userID + '.json')
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
  const fileName = path.join(LINGO_DATA_PATH, 'userID', 'next_user_ID' + '.json')
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path.join(LINGO_DATA_PATH, 'userID'))) {
      fs.mkdirSync(path.join(LINGO_DATA_PATH, 'userID'), {
        recursive: true
      })
      fs.writeFile(fileName, JSON.stringify({
        'userID': 0
      }), (err) => {
        if (err) {
          console.log(err)
          reject(err)
        } else {
          console.log('Successfully saved new ID json')
          uploadDir(path.join(LINGO_DATA_PATH), LINGO_BUCKET_NAME)
          resolve(0)
        }
      })
    }
  })
}

function saveWavFile(reqData, userID, hashKey, selector) {
  const promptNumber = reqData.assessments[0].data[selector][0]['prompt_number']
  const assessmentName = reqData.assessments[0]['assess_name']
  let wavFilePath
  let wavFileName
  if (hashKey) {
    wavFilePath = path.join(LINGO_DATA_PATH, 'single_assessment', hashKey, 'recording_data', assessmentName)
    wavFileName = path.join(wavFilePath, promptNumber + '.wav')
    if (!fs.existsSync(wavFilePath)) {
      fs.mkdirSync(path.join(wavFilePath), {
        recursive: true
      })
    }
  } else if (userID) {
    wavFilePath = path.join(LINGO_DATA_PATH, userID, 'recording_data', assessmentName)
    wavFileName = path.join(wavFilePath, promptNumber + '.wav')
    // wavFileName = path.join('assessment_data', userID, 'recording_data', assessmentName, promptNumber + '.wav')
  }
  if (!fs.existsSync(wavFilePath)) {
    fs.mkdirSync(path.join(wavFilePath), {
      recursive: true
    })
  }
  fs.writeFile(wavFileName, reqData.assessments[0].data[selector][0]['recorded_data'], {
    encoding: 'base64'
  }, () => {
    // console.log('saved file')
    // KRM: For debugging
  })
  // uploadDir(path.join(LINGO_DATA_PATH), LINGO_BUCKET_NAME, selector)
  reqData.assessments[0].data[selector][0]['recorded_data'] = wavFileName
}

function getNextUserID() {
  const fileName = path.join(LINGO_DATA_PATH, 'userID', 'next_user_ID' + '.json')
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, 'utf-8', (err, data) => {
      if (err) {
        console.log('UserID json does not exist, creating now.')
        resolve(insertNewIDJson())
      } else {
        let currentID = JSON.parse(data).userID
        fs.writeFile(fileName, JSON.stringify({
          'userID': (currentID + 1)
        }), (err) => {
          if (err) {
            console.log(err)
            reject(err)
          } else {
            console.log('Successfully updated ID json')
            uploadDir(path.join(LINGO_DATA_PATH), LINGO_BUCKET_NAME)
            resolve(currentID)
          }
        })
      }
    })
  })
}

function sendHashKey(hashKey) {
  const fileName = path.join(LINGO_DATA_PATH, 'single_assessment', hashKey, hashKey + '.json')
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, 'utf-8', (err, data) => {
      if (err) {
        console.log(err) // KRM: User hasn't used this hash key before
        resolve(insertNewHashKeyJson(hashKey))
      } else {
        resolve(JSON.parse(data)) // KRM: Send back their data if it already exists
      }
    })
  })
}

function insertNewHashKeyJson(hashKey) {
  const freshData = JSON.stringify({
    hash_key: hashKey,
    assessments: [],
    google_speech_to_text_assess: []
  })
  const fileName = path.join(LINGO_DATA_PATH, 'single_assessment', hashKey, hashKey + '.json')
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path.join(LINGO_DATA_PATH, 'single_assessment', hashKey))) {
      console.log('Making HashKey directory')
      fs.mkdirSync(path.join(LINGO_DATA_PATH, 'single_assessment', hashKey), {
        recursive: true
      })
    }
    fs.writeFile(fileName, freshData, (err) => {
      if (err) {
        console.log(err)
        reject(err)
      } else {
        console.log('Successfully saved new HashKey json')
        uploadDir(path.join(LINGO_DATA_PATH), LINGO_BUCKET_NAME)
        resolve(freshData)
      }
    })
  })
}

function getAssets(query) {
  const assetsBaseDir = 'dist/assets/in_use/'
  const promptStructure = {}
  const assetType = query.assetType
  const assessmentName = query.assessmentName
  const assetFolder = path.join(assetsBaseDir, assetType, assessmentName)
  if (assetType === 'img' && assessmentName === 'matrixreasoning') {
    return getMatrixReasoningImgAssets(assetFolder)
  }
  return new Promise((resolve, reject) => {
    const collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: 'base'
    })
    const files = fs.readdirSync(assetFolder)
    files.sort(collator.compare)
    let fileNumbers
    if (assetType === 'audio') {
      // KRM: Audio files include the instruction file which we will take
      // care of later below in its own block.
      fileNumbers = files.length - 1
    } else {
      fileNumbers = files.length
    }
    for (let i = 0; i < fileNumbers; i++) {
      promptStructure[i] = []
      const individualFile = fs.readdirSync(path.join('dist/assets/in_use/', assetType, assessmentName, files[i]))
      for (let j = 0; j < individualFile.length; j++) {
        promptStructure[i].push(path.join(assetFolder.slice(5), i + '', individualFile[j]))
      }
    }
    let resolveObject
    if (assetType === 'audio') {
      const instructionDir = path.join('dist/assets/in_use', assetType, assessmentName, 'instructions')
      const instructionFile = fs.readdirSync(instructionDir)[0]
      const instructionFilePath = path.join(instructionDir.slice(5), instructionFile)
      resolveObject = {
        audioInstruction: instructionFilePath,
        promptStructure: promptStructure,
        assetsLength: Object.keys(promptStructure).length
      }
    } else {
      resolveObject = {
        promptStructure: promptStructure,
        assetsLength: Object.keys(promptStructure).length
      }
    }
    resolve(resolveObject)
  })
}

function getMatrixReasoningImgAssets(assetFolder) {
  const promptStructure = {
    frameSets: {},
    solutionSets: {}
  }
  return new Promise((resolve, reject) => {
    const promptFiles = fs.readdirSync(assetFolder)
    promptStructure.assetsLength = promptFiles.length
    for (const promptFile of promptFiles) {
      let frameSetsThisPrompt = fs.readdirSync(path.join(assetFolder, promptFile, 'frameSets'))
      for (let i = 0; i < frameSetsThisPrompt.length; i++) {
        frameSetsThisPrompt[i] = path.join(assetFolder.slice(5), promptFile, 'frameSets', frameSetsThisPrompt[i])
      }
      let solutionSetsThisPrompt = fs.readdirSync(path.join(assetFolder, promptFile, 'solutionSets'))
      for (let i = 0; i < solutionSetsThisPrompt.length; i++) {
        solutionSetsThisPrompt[i] = path.join(assetFolder.slice(5), promptFile, 'solutionSets', solutionSetsThisPrompt[i])
      }
      promptStructure.frameSets[promptFile] = frameSetsThisPrompt
      promptStructure.solutionSets[promptFile] = solutionSetsThisPrompt
    }
    const resolveObject = {
      promptStructure: promptStructure,
      assetsLength: promptFiles.length
    }
    resolve(resolveObject)
  })
}

function getAllDataOnUserId(userId, res) {
  deleteZippedForIdIfExists(userId)
  const folderPath = path.join(LINGO_DATA_PATH, userId)
  if (fs.existsSync(folderPath)) {
    res.attachment(userId + '.zip')
    const output = fs.createWriteStream(path.join(folderPath, userId + '.zip'))
    const archive = archiver('zip', {})
    output.on('close', function () {
      console.log(archive.pointer() + ' total bytes')
      console.log('archiver has been finalized and the output file descriptor has closed.')
      return res.status(200).send('OK').end()
      // KRM: Return promise here!
    })
    const directory = path.join(LINGO_DATA_PATH, userId)
    archive.directory(directory, false)
    archive.pipe(res)
    archive.finalize()
    deleteZippedForIdIfExists(userId)
  } else {
    res.sendStatus(404)
  }
}

function uploadDir(s3Path, bucketName, selector) {
  console.log('BUCKET_NAME: ' + bucketName)

  function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach((fileName) => {
      let filePath = path.join(currentDirPath, fileName)
      let stat = fs.statSync(filePath)
      if (stat.isFile()) {
        callback(filePath, stat)
      } else if (stat.isDirectory()) {
        walkSync(filePath, callback)
      }
    })
  }

  walkSync(s3Path, (filePath, stat) => {
    let bucketPath = filePath.substring(s3Path.length + 1)
    let body = fs.readFileSync(filePath)
    let params
    if (selector === 'recorded_data') {
      params = {
        Bucket: bucketName,
        Key: bucketPath,
        Body: body,
        ContentType: 'audio/wav'
      }
    } else {
      params = {
        Bucket: bucketName,
        Key: bucketPath,
        Body: body
      }
    }

    s3.putObject(params, (err, data) => {
      if (err) {
        console.log(err)
      } else {
        console.log('Successfully uploaded ' + bucketPath + ' to ' +
          bucketName)
      }
    })
  })
}

// function getAllDataForHashKey(hashKey) {
//   deleteZippedForHashKeyIfExists(hashKey)
//   const folderPath = path.join('assessment_data', 'single_assessment', hashKey)
//   // KRM: TO DO finish this function analagous to the ID ones
// }

function deleteZippedForIdIfExists(userId) {
  const deleteFile = path.join(LINGO_DATA_PATH, userId, userId + '.zip')
  if (fs.existsSync(deleteFile)) {
    console.log('delete')
    fs.unlinkSync(deleteFile)
  }
}

// function deleteZippedForHashKeyIfExists(hashKey) {

// }

function getAllData() {

}

module.exports = {
  insertFreshAssessmentData,
  pushOnePieceAssessmentData,
  getUserAssessmentData,
  updateAssessmentData,
  getNextUserID,
  sendHashKey,
  getAssets,
  getAllDataOnUserId,
  getAllData
  // getAllDataForHashKey
}
