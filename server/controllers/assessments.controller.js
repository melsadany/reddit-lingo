const Joi = require('joi')
const fs = require('fs')
const path = require('path')
const AWS = require('aws-sdk')
const S3 = new AWS.S3()

const LINGO_DATA_LOCAL_PATH = path.join(
  __dirname,
  '../',
  '../',
  'assessment_data'
)

const S3_DATA_BUCKET_NAME = 'lingo-assessment-data'
const DEPLOYMENT_SPECIFIC_FOLDER = process.env.LINGO_FOLDER

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
  console.log(path.join(LINGO_DATA_LOCAL_PATH, userID))
  if (!fs.existsSync(path.join(LINGO_DATA_LOCAL_PATH, userID))) {
    fs.mkdirSync(path.join(LINGO_DATA_LOCAL_PATH, userID), {
      recursive: true
    })
    fs.mkdirSync(path.join(LINGO_DATA_LOCAL_PATH, userID, 'recording_data'))
  }
  const freshData = JSON.stringify(reqData)
  const fileName = path.join(LINGO_DATA_LOCAL_PATH, userID, userID + '.json')
  return new Promise((resolve, reject) => {
    fs.writeFile(fileName, freshData, err => {
      if (err) {
        console.log(err)
      } else {
        uploadJSONFileToS3(
          fileName,
          S3_DATA_BUCKET_NAME,
          path.join(DEPLOYMENT_SPECIFIC_FOLDER, userID, userID + '.json')
        )
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
      fileName = path.join(
        LINGO_DATA_LOCAL_PATH,
        'hashkey_assessment',
        hashKey,
        hashKey + '.json'
      )
    } else {
      userID = reqData.user_id
      fileName = path.join(LINGO_DATA_LOCAL_PATH, userID, userID + '.json')
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
      fs.writeFile(fileName, JSON.stringify(dataFile), err => {
        if (err) {
          console.log(err)
          reject(err)
        } else {
          let localUploadPath
          let S3UploadKey
          if (hashKey) {
            localUploadPath = path.join(
              LINGO_DATA_LOCAL_PATH,
              'hashkey_assessment',
              hashKey,
              hashKey + '.json'
            )
            S3UploadKey = path.join(
              DEPLOYMENT_SPECIFIC_FOLDER,
              'hashkey_assessment',
              hashKey,
              hashKey + '.json'
            )
          } else {
            localUploadPath = path.join(
              LINGO_DATA_LOCAL_PATH,
              userID,
              userID + '.json'
            )
            S3UploadKey = path.join(
              DEPLOYMENT_SPECIFIC_FOLDER,
              userID,
              userID + '.json'
            )
          }
          uploadJSONFileToS3(localUploadPath, S3_DATA_BUCKET_NAME, S3UploadKey)
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
      fileName = path.join(
        LINGO_DATA_LOCAL_PATH,
        'hashkey_assessment',
        hashKey,
        hashKey + '.json'
      )
    } else {
      userID = reqData.user_id
      fileName = path.join(LINGO_DATA_LOCAL_PATH, userID, userID + '.json')
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
        if (
          dataFile.assessments[i].assess_name ===
          reqData.assessments[0].assess_name
        ) {
          dataFile.assessments[i].data[selector].push(
            reqData.assessments[0].data[selector][0]
          )
          if (reqData.assessments[0].completed === true) {
            dataFile.assessments[i].completed = true
          }
        }
      }
      fs.writeFile(fileName, JSON.stringify(dataFile), err => {
        if (err) {
          console.log(err)
          reject(err)
        } else {
          let localUploadPath
          let S3UploadPath
          if (hashKey) {
            localUploadPath = path.join(
              LINGO_DATA_LOCAL_PATH,
              'hashkey_assessment',
              hashKey,
              hashKey + '.json'
            )
            S3UploadPath = path.join(
              DEPLOYMENT_SPECIFIC_FOLDER,
              'hashkey_assessment',
              hashKey,
              hashKey + '.json'
            )
          } else {
            localUploadPath = path.join(
              LINGO_DATA_LOCAL_PATH,
              userID,
              userID + '.json'
            )
            S3UploadPath = path.join(
              DEPLOYMENT_SPECIFIC_FOLDER,
              userID,
              userID + '.json'
            )
          }
          uploadJSONFileToS3(localUploadPath, S3_DATA_BUCKET_NAME, S3UploadPath)
          resolve(dataFile)
        }
      })
    })
  })
}

function getUserAssessmentData(searchUserId) {
  const userID = searchUserId
  const fileName = path.join(LINGO_DATA_LOCAL_PATH, userID, userID + '.json')
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, 'utf-8', (err, data) => {
      if (err) {
        resolve(
          insertFreshAssessmentData({
            user_id: userID,
            assessments: [],
            google_speech_to_text_assess: []
          })
        )
      } else {
        resolve(JSON.parse(data))
      }
    })
  })
}

function insertNewIDJson() {
  const fileName = path.join(
    LINGO_DATA_LOCAL_PATH,
    'userID',
    'next_user_ID' + '.json'
  )
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path.join(LINGO_DATA_LOCAL_PATH, 'userID'))) {
      fs.mkdirSync(path.join(LINGO_DATA_LOCAL_PATH, 'userID'), {
        recursive: true
      })
      fs.writeFile(
        fileName,
        JSON.stringify({
          userID: 0
        }),
        err => {
          if (err) {
            console.log(err)
            reject(err)
          } else {
            console.log('Successfully saved new ID json')
            uploadJSONFileToS3(
              fileName,
              S3_DATA_BUCKET_NAME,
              path.join(
                DEPLOYMENT_SPECIFIC_FOLDER,
                'userID',
                'next_user_id.json'
              )
            )
            resolve(0)
          }
        }
      )
    }
  })
}

function saveWavFile(reqData, userID, hashKey, selector, bucketName) {
  const promptNumber = reqData.assessments[0].data[selector][0]['prompt_number']
  const assessmentName = reqData.assessments[0]['assess_name']
  let wavFilePath
  let wavFileName
  if (hashKey) {
    wavFilePath = path.join(
      LINGO_DATA_LOCAL_PATH,
      'hashkey_assessment',
      hashKey,
      'recording_data',
      assessmentName
    )
  } else if (userID) {
    wavFilePath = path.join(
      LINGO_DATA_LOCAL_PATH,
      userID,
      'recording_data',
      assessmentName
    )
  }
  if (!fs.existsSync(wavFilePath)) {
    fs.mkdirSync(path.join(wavFilePath), {
      recursive: true
    })
  }
  wavFileName = path.join(wavFilePath, promptNumber + '.wav')
  fs.writeFile(
    wavFileName,
    reqData.assessments[0].data[selector][0]['recorded_data'],
    {
      encoding: 'base64'
    },
    () => {
      // console.log('saved file')
      // KRM: For debugging
      let S3UploadPath
      if (hashKey) {
        S3UploadPath = path.join(
          DEPLOYMENT_SPECIFIC_FOLDER,
          'hashkey_assessment',
          hashKey,
          'recording_data',
          assessmentName,
          promptNumber + '.wav'
        )
      } else {
        S3UploadPath = path.join(
          DEPLOYMENT_SPECIFIC_FOLDER,
          userID,
          'recording_data',
          assessmentName,
          promptNumber + '.wav'
        )
      }
      uploadWavToS3(wavFileName, S3_DATA_BUCKET_NAME, S3UploadPath)
    }
  )
  reqData.assessments[0].data[selector][0]['recorded_data'] = wavFileName
}

function getNextUserID() {
  const fileName = path.join(
    LINGO_DATA_LOCAL_PATH,
    'userID',
    'next_user_ID' + '.json'
  )
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, 'utf-8', (err, data) => {
      if (err) {
        console.log('UserID json does not exist, creating now.')
        resolve(insertNewIDJson())
      } else {
        let currentID = JSON.parse(data).userID
        fs.writeFile(
          fileName,
          JSON.stringify({
            userID: currentID + 1
          }),
          err => {
            if (err) {
              console.log(err)
              reject(err)
            } else {
              console.log('Successfully updated ID json')
              uploadJSONFileToS3(
                fileName,
                S3_DATA_BUCKET_NAME,
                path.join(
                  DEPLOYMENT_SPECIFIC_FOLDER,
                  'userID',
                  'next_user_ID.json'
                )
              )
              resolve(currentID)
            }
          }
        )
      }
    })
  })
}

function sendHashKey(hashKey) {
  const fileName = path.join(
    LINGO_DATA_LOCAL_PATH,
    'hashkey_assessment',
    hashKey,
    hashKey + '.json'
  )
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
  const fileName = path.join(
    LINGO_DATA_LOCAL_PATH,
    'hashkey_assessment',
    hashKey,
    hashKey + '.json'
  )
  return new Promise((resolve, reject) => {
    if (
      !fs.existsSync(
        path.join(LINGO_DATA_LOCAL_PATH, 'hashkey_assessment', hashKey)
      )
    ) {
      console.log('Making HashKey directory')
      fs.mkdirSync(
        path.join(LINGO_DATA_LOCAL_PATH, 'hashkey_assessment', hashKey),
        {
          recursive: true
        }
      )
    }
    fs.writeFile(fileName, freshData, err => {
      if (err) {
        console.log(err)
        reject(err)
      } else {
        console.log('Successfully saved new HashKey json')
        uploadJSONFileToS3(
          fileName,
          S3_DATA_BUCKET_NAME,
          path.join(
            DEPLOYMENT_SPECIFIC_FOLDER,
            'hashkey_assessment',
            hashKey,
            hashKey + '.json'
          )
        )
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
      const individualFile = fs.readdirSync(
        path.join('dist/assets/in_use/', assetType, assessmentName, files[i])
      )
      for (let j = 0; j < individualFile.length; j++) {
        promptStructure[i].push(
          path.join(assetFolder.slice(5), i + '', individualFile[j])
        )
      }
    }
    let resolveObject
    if (assetType === 'audio') {
      const instructionDir = path.join(
        'dist/assets/in_use',
        assetType,
        assessmentName,
        'instructions'
      )
      const instructionFile = fs.readdirSync(instructionDir)[0]
      const instructionFilePath = path.join(
        instructionDir.slice(5),
        instructionFile
      )
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
      let frameSetsThisPrompt = fs.readdirSync(
        path.join(assetFolder, promptFile, 'frameSets')
      )
      for (let i = 0; i < frameSetsThisPrompt.length; i++) {
        frameSetsThisPrompt[i] = path.join(
          assetFolder.slice(5),
          promptFile,
          'frameSets',
          frameSetsThisPrompt[i]
        )
      }
      let solutionSetsThisPrompt = fs.readdirSync(
        path.join(assetFolder, promptFile, 'solutionSets')
      )
      for (let i = 0; i < solutionSetsThisPrompt.length; i++) {
        solutionSetsThisPrompt[i] = path.join(
          assetFolder.slice(5),
          promptFile,
          'solutionSets',
          solutionSetsThisPrompt[i]
        )
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

function uploadJSONFileToS3(localJSONLocation, S3Bucket, objectKeyName) {
  let jsonData = fs.readFileSync(localJSONLocation)
  let params = {
    Bucket: S3Bucket,
    Key: objectKeyName,
    Body: jsonData
  }

  putObjectToS3(params, {
    localName: localJSONLocation,
    S3Bucket: S3Bucket,
    objectKeyName: objectKeyName
  })
}

function uploadWavToS3(localWavFileName, S3Bucket, objectKeyName) {
  let body = fs.readFileSync(localWavFileName)
  let params = {
    Bucket: S3Bucket,
    Key: objectKeyName,
    Body: body,
    ContentType: 'audio/wav'
  }

  putObjectToS3(params, {
    localName: localWavFileName,
    S3Bucket: S3Bucket,
    objectKeyName: objectKeyName
  })
}

function putObjectToS3(params, logData) {
  S3.putObject(params, (err, data) => {
    if (err) {
      console.log(err)
    } else {
      console.log(
        'Successfully uploaded ' +
          logData.localName +
          ' to ' +
          logData.S3Bucket +
          '/' +
          logData.objectKeyName
      )
    }
  })
}

module.exports = {
  insertFreshAssessmentData,
  pushOnePieceAssessmentData,
  getUserAssessmentData,
  updateAssessmentData,
  getNextUserID,
  sendHashKey,
  getAssets
}
