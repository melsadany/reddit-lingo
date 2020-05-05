const Joi = require('joi')
const fs = require('fs-extra')
const path = require('path')
const AWS = require('aws-sdk')
AWS.config.update({region:'us-east-1'});
const S3 = new AWS.S3()
const lambda = new AWS.Lambda();
const LINGO_DATA_LOCAL_PATH = path.join(
  __dirname,
  '../',
  '../',
  'assessment_data'
)
const WaveFile = require('wavefile').WaveFile;
var CronJob = require('cron').CronJob;

var job = new CronJob('0 4 0 * * *', function() {
  
  console.log('Deleting Local Audio Recording Files..');
  fs.readdir(LINGO_DATA_LOCAL_PATH, function (err, files) {
      if (err){console.log(err)}
      else{
        files.forEach( function (file) {
          try{fs.remove(LINGO_DATA_LOCAL_PATH + "/"+file+ "/recording_data");}
          catch{error => {console.log("There was an error deleting directory!");console.log(error)}}
        })
      }
  })
}, null, true, 'America/Chicago');

job.start();

const S3_DATA_BUCKET_NAME = 'lingo-assessment-data'
const DEPLOYMENT_SPECIFIC_FOLDER =process.env.LINGO_FOLDER

const AssessmentSchemaValidator = Joi.object({
  user_id: Joi.string().required(),
  hash_keys: Joi.array(),
  assessments: Joi.array(),
  //google_speech_to_text_assess: Joi.array(),
  startTime: Joi.string()
})

async function insertFreshAssessmentData(reqData) {
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
      } 
      if (DEPLOYMENT_SPECIFIC_FOLDER){
      uploadJSONFileToS3(
        fileName,
        S3_DATA_BUCKET_NAME,
        path.join(DEPLOYMENT_SPECIFIC_FOLDER, userID, userID + '.json')
      )}
      resolve(freshData)
    })
  })
}

async function updateAssessmentData(reqData) {
  // console.log(reqData)
  // KRM: For seeing what data was already stored for a user
  let userID
  let fileName
  return new Promise((resolve, reject) => {

    userID = reqData.user_id
    fileName = path.join(LINGO_DATA_LOCAL_PATH, userID, userID + '.json')

    if (reqData.assessments[0].data.recorded_data) {
      saveWavFile(reqData, userID, 'recorded_data')
    }
    fs.readFile(fileName, 'utf-8', (err, data) => {
      var myPromise = checkJsonExist(err,data,fileName,userID);
      myPromise.then(result => {
        if (result){
          const dataFile = JSON.parse(result)
          dataFile.assessments.push(reqData.assessments[0])
          if (reqData.addHashkeyToJson){
            dataFile.hash_keys.push(reqData.hash_key);
          }
          fs.writeFile(fileName, JSON.stringify(dataFile), err => {
            if (err) {
              console.log(err)
            }
            let localUploadPath
            let S3UploadKey
            if (DEPLOYMENT_SPECIFIC_FOLDER){
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
              uploadJSONFileToS3(localUploadPath, S3_DATA_BUCKET_NAME, S3UploadKey)
            }
            resolve(dataFile)
          })
        }
        else{reject({"JsonNotFound":"The user json object was not found on the instance or s3."})}
      })
    })
  })
}
async function addEndTime(body){
  userID=body.userId

  fileName = path.join(LINGO_DATA_LOCAL_PATH, userID, userID + '.json')
  return new Promise((resolve, reject) => {
  fs.readFile(fileName, 'utf-8', (err, data) => {
    var myPromise = checkJsonExist(err,data,fileName,userID);
    myPromise.then(result => {
      if (result){
        var dataFile = JSON.parse(result)
        dataFile.endTime = body.time

        fs.writeFile(fileName, JSON.stringify(dataFile), err => {
          if (err) {
            console.log(err)
          } 
          let localUploadPath
          let S3UploadPath
          if (DEPLOYMENT_SPECIFIC_FOLDER){
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
            uploadJSONFileToS3(localUploadPath, S3_DATA_BUCKET_NAME, S3UploadPath)
          }
          resolve(200)
        })
      }
      else{reject({"JsonNotFound":"The user json object was not found on the instance or s3."})}
    })
  })
  resolve(200);}).catch(e => {console.log(e);resolve(400)});
    
}
async function pushOnePieceAssessmentData(reqData) {
  let userID
  let fileName
  return new Promise((resolve, reject) => {
    
    userID = reqData.user_id
    fileName = path.join(LINGO_DATA_LOCAL_PATH, userID, userID + '.json')
    
    let selector = ''
    if (reqData.assessments[0].data.recorded_data) {
      selector = 'recorded_data'
      saveWavFile(reqData, userID, selector)
    } else if (reqData.assessments[0].data.selection_data) {
      selector = 'selection_data'
    } else {
      console.log('Selector error')
    }
    fs.readFile(fileName, 'utf-8', (err, data) => {
      var myPromise = checkJsonExist(err,data,fileName,userID);
      myPromise.then(result => {
        if (result){
          const dataFile = JSON.parse(result)
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
          if (reqData.addHashkeyToJson){
            dataFile.hash_keys.push(reqData.hash_key);
          }
          fs.writeFile(fileName, JSON.stringify(dataFile), err => {
            if (err) {
              console.log(err)
            } 
            let localUploadPath
            let S3UploadPath
            if (DEPLOYMENT_SPECIFIC_FOLDER){
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
            
              uploadJSONFileToS3(localUploadPath, S3_DATA_BUCKET_NAME, S3UploadPath)
            }
            resolve(dataFile)

          })
        }
        else{reject({"JsonNotFound":"The user json object was not found on the instance or s3."})}
      })
    })
  })
}

function checkUserExist(searchUserId){
  const userID = searchUserId
  const fileName = path.join(LINGO_DATA_LOCAL_PATH, userID, userID + '.json')
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, 'utf-8', (err, data) => {
      if (err) {
        console.log("File not found on instance")

        getObjectFromS3(fileName,userID).then(result =>resolve(JSON.parse(result)))
      
      } else {
        resolve(JSON.parse(data))
      }
    });
  }).catch(error => {console.log("This is a promise error.."); console.log(error);})
}

function getUserAssessmentData(searchUserId,date) {
  const userID = searchUserId.toString()

  const fileName = path.join(LINGO_DATA_LOCAL_PATH, userID, userID + '.json')
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, 'utf-8', (err, data) => {
      var myPromise = checkJsonExist(err,data,fileName,userID);
      myPromise.then(result => {
        if (result==false){
          resolve(
            insertFreshAssessmentData({
              user_id: userID,
              hash_keys: [],
              assessments: [],
              startTime: date
            })
          )
        } else {
          resolve(JSON.parse(result))
        }
      })
    })
  })
}

//dont need inserNewIDJson anymore (BT)

function saveWavFile(reqData, userID, selector, bucketName) {
  const promptNumber = reqData.assessments[0].data[selector][0]['prompt_number']
  const dataTitle =  reqData.assessments[0].data[selector][0]["dataGiven"];
  const assessmentName = reqData.assessments[0]['assess_name']
  let wavFilePath
  let wavFileName
  let wavFileTitle
  if (userID) {
    wavFilePath = path.join(
      LINGO_DATA_LOCAL_PATH,
      userID,
      'recording_data',
      assessmentName
    )
  if (DEPLOYMENT_SPECIFIC_FOLDER) wavFileTitle = path.join(DEPLOYMENT_SPECIFIC_FOLDER, userID, 'recording_data', assessmentName )
  }
  if (!fs.existsSync(wavFilePath)) {
    fs.mkdirSync(path.join(wavFilePath), {
      recursive: true
    })
  }
  if(dataTitle){
    wavFileName = path.join(wavFilePath, dataTitle + '.wav')
    wavFileTitle = path.join(wavFileTitle,dataTitle + '.wav')
  }
  else{
     wavFileName = path.join(wavFilePath, promptNumber + '.wav')
     wavFileTitle = path.join(wavFileTitle, promptNumber + '.wav')
  }
 
  var blob = reqData.assessments[0].data[selector][0]['recorded_data'] 

  var buf = Buffer.from(blob,'base64')
  let wav = new WaveFile(buf)

  if(DEPLOYMENT_SPECIFIC_FOLDER) wav.setTag("INAM",wavFileTitle);
  

  fs.writeFile(
    wavFileName,
    wav.toBuffer(),
    {
      encoding: 'base64'
    },
    (err) => {
      if (err) {
        console.log(err)
      } 
      // console.log('saved file')
      // KRM: For debugging
      let S3UploadPath
      if (DEPLOYMENT_SPECIFIC_FOLDER){
        S3UploadPath = path.join(
          DEPLOYMENT_SPECIFIC_FOLDER,
          userID,
          'recording_data',
          assessmentName,
          (dataTitle ? dataTitle : promptNumber) + '.wav'
        )
        
        uploadWavToS3(wavFileName, S3_DATA_BUCKET_NAME, S3UploadPath)
      }
    }
  )
  console.log("should be completely done")
  reqData.assessments[0].data[selector][0]['recorded_data'] = wavFileName
}
//dont need getNextUserID anymore [BT]

function sendHashKey(hashKey,userID,date) {
  const fileName = path.join(
    LINGO_DATA_LOCAL_PATH,
    userID,
    userID + '.json'
  )
  return new Promise((resolve, reject) => {
    fs.readFile(fileName, 'utf-8', (err, data) => {
      var myPromise = checkJsonExist(err,data,fileName,userID);
      myPromise.then(result => {
        if (result==false){
         // KRM: User hasn't used this hash key before
          resolve(insertNewHashKeyJson(hashKey,userID,date))
        } else {
          resolve(JSON.parse(result)) // KRM: Send back their data if it already exists
        }
      })
    })
  })
}

function insertNewHashKeyJson(hashKey,userID,date) {
  const freshData = JSON.stringify({
    user_id: userID,
    hash_keys: [hashKey],
    assessments: [],
    startTime: date
  })
  const fileName = path.join(
    LINGO_DATA_LOCAL_PATH,
    userID,
    userID + '.json'
  )
  return new Promise((resolve, reject) => {
    if (
      !fs.existsSync(
        path.join(LINGO_DATA_LOCAL_PATH, userID)
      )
    ) {
      fs.mkdirSync(
        path.join(LINGO_DATA_LOCAL_PATH, userID),
        {
          recursive: true
        }
      )
    }
    fs.writeFile(fileName, freshData, err => {
      if (err) {
        console.log(err)
      }
      console.log('Successfully saved new HashKey json')
      if (DEPLOYMENT_SPECIFIC_FOLDER){
        uploadJSONFileToS3(
          fileName,
          S3_DATA_BUCKET_NAME,
          path.join(
            DEPLOYMENT_SPECIFIC_FOLDER,
            userID,
            userID + '.json'
          )
        )
      }
      resolve(freshData)
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
async function checkJsonExist(err,data,fileName,userID){
  return  new Promise((resolve,reject)=>{
    if (err) {
      if (err.code==="ENOENT"){
        console.log("couldn't find the file in the instance")
        console.log(err.code)}
      else{console.log("something went wrong..");console.log(err)}
      getObjectFromS3(fileName,userID).then(result => resolve(result))
    }
   else{resolve(data)}
  })
}

async function getObjectFromS3(fileName,userID) {
  console.log("getting object from s3!")
  return new Promise((resolve, reject) => {
    if(DEPLOYMENT_SPECIFIC_FOLDER){  
      s3JsonPath = path.join(DEPLOYMENT_SPECIFIC_FOLDER,userID,userID + '.json')
      var params = {
        Bucket: S3_DATA_BUCKET_NAME, 
        Key: s3JsonPath,
        ResponseContentType:'application/json'
      };
      
      S3.getObject(params, function(err, data) {
        if (err) {// an error occurred
          if (err.code==="NoSuchKey"){ 
            console.log("couldn't find json in s3");console.log(err.code,":",err.message)}
          else console.log(err); 
          resolve(false)}
        else{   // successful response
          console.log("successfully found in s3")
          if (!fs.existsSync(path.join(LINGO_DATA_LOCAL_PATH, userID))) {
            fs.mkdirSync(path.join(LINGO_DATA_LOCAL_PATH, userID), {
              recursive: true
            })
            fs.mkdirSync(path.join(LINGO_DATA_LOCAL_PATH, userID, 'recording_data'))
          }
          fs.writeFile(fileName, data.Body.toString(), err => {
            if (err){console.log("couldn't write file on the instance");console.log(err)}
            resolve(data.Body.toString())
          })
        }
      });
    }
    else{resolve(false)}
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
  },false)
}

function uploadWavToS3(localWavFileName, S3Bucket, objectKeyName) {
  console.log("uploadingWavToS3...")
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
  },true)
}

function putObjectToS3(params, logData,wavFile) {
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
      if(wavFile){}//transcribeAudioAndSendToS3(logData)
    }
  })
}

function validateHashWithS3(hashKey){
  return  new Promise((resolve,reject)=>{
    if (DEPLOYMENT_SPECIFIC_FOLDER){
      var params = {
        Bucket: S3_DATA_BUCKET_NAME, 
        Key: DEPLOYMENT_SPECIFIC_FOLDER+"/valid_hashes.txt",
        ResponseContentType:'text'
      };
      console.log(JSON.stringify(params))
      S3.getObject(params, function(err, data) {
        if (err){console.log("Error getting s3 valid ids file");console.log(err);resolve(false)}
        else {
          let valid_ids= data.Body.toString().split('\n')
          let matches = valid_ids.filter(element => element==hashKey)
          resolve(matches.length>0)
        }
      })
    }
    else resolve(true)
  })
}

function transcribeAudioAndSendToS3(logData){

 var params = {
    FunctionName: "arn:aws:lambda:us-east-1:000246156158:function:transcribeRecordings", 
    ClientContext: "none", 
    InvocationType: "Event", 
    LogType: "Tail", 
    Payload: JSON.stringify(logData), 
 };
 lambda.invoke(params, function(err, data) {
   if (err) console.log(err, err.stack); // an error occurred
   else     console.log("sucessfully invoked transcribe lamda")          // successful response
  });
}

module.exports = {
  insertFreshAssessmentData,
  pushOnePieceAssessmentData,
  getUserAssessmentData,
  updateAssessmentData,
  addEndTime,
  sendHashKey,
  getAssets,
  checkUserExist,
  checkJsonExist,
  getObjectFromS3,
  validateHashWithS3,
  transcribeAudioAndSendToS3
}
