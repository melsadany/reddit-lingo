import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';

import {
  AssessmentData,
  AssessmentDataStructure,
  GoogleSpeechToTextDataStructure,
  AssetsObject
} from '../structures/AssessmentDataStructures';
import 'rxjs/add/operator/map';
import { StateManagerService } from './state-manager.service';

const uuidv1 = require('uuid/v1')



@Injectable()
export class AssessmentDataService {
  private _currentUserId: string;
  private _partialAssessmentData: AssessmentData;
  private _partialAssessmentDataSubscription: Observable<
    AssessmentData
  > ;
  private _audioAssetsLocation = 'assets/in_use/audio/';
  constructor(
    private cookieService: CookieService,
    private http: HttpClient,
    public stateManager: StateManagerService
  ) { }

  public get audioAssetsLocation(): string {
    return this._audioAssetsLocation;
  }
  public get currentUserId(): string {
    return this._currentUserId;
  }
  public set currentUserId(value: string) {
    this._currentUserId = value;
  }
  public get partialAssessmentData(): AssessmentData {
    return this._partialAssessmentData;
  }
  public set partialAssessmentData(value: AssessmentData) {
    this._partialAssessmentData = value;
  }
  public returnTime(date :Date):string{
    const month = ((date.getMonth()+1)<10?'0':'') + (date.getMonth()+1);
    const theDate = (date.getDate()<10?'0':'') + date.getDate();
    const hours = (date.getHours()<10?'0':'') + date.getHours();
    const minutes= (date.getMinutes()<10?'0':'') + date.getMinutes();
    return(date.getFullYear() + "-" + month + "-" + theDate + "T"
      + hours + ":" + minutes)
  }

  public initializeData(): void {
    if (!this.validateUserId(this.getUserIdCookie())) {
      this.setUserIdCookieAndSetData();
    } else {
      this.setData();
      // KRM: Seting the data will initialize the state of the assessments
    }
  }
  public validHashKey(hashKey: string): boolean {
    // if it matches 8 or 12 anyletter/anynumbered hash and is single assessment type (with no underscores) :BT
    if (this.stateManager.hashkeyAsGUID){
      return this.validateUserId(hashKey)
    }
    if (hashKey.length==12 && hashKey.slice(4).match(/^\w+$/gmi) && this.stateManager.hashKeyFirstFourMap(hashKey) !== 'home'){
      this.stateManager.isSingleAssessment = true;
      return true
    }
    return false
  }

  public initializeHashKeyData(hashkey :string): Promise<string> {

    if (this.stateManager.hashkeyAsGUID){
      this.currentUserId=hashkey;
      this.setUserIdCookie(hashkey)
      this.setHashKeyCookie(hashkey);
      this.stateManager.hashKey = hashkey;
    }
    //checks if old hash is valid (if so, they need to finish it)
    else if (this.validHashKey(this.getHashKeyCookie())){
      if (this.validateUserId(this.getUserIdCookie())){
        this.currentUserId = this.getUserIdCookie()

      }
      else{ this.currentUserId = this.generateNewUserId()
        this.setUserIdCookie(this.currentUserId);}
      this.stateManager.hashKey = this.getHashKeyCookie();
    }
    else {
      //tells if new hash is valid (if it is then start new single assessment overiding any previous progress)
      if (this.stateManager.isSingleAssessment){
          this.currentUserId =  this.generateNewUserId();
          this.setUserIdCookie(this.currentUserId);
      }
      else {
        if (this.validateUserId(this.getUserIdCookie())){
          this.currentUserId = this.getUserIdCookie();
          if (this.getHashKeyCookie() != hashkey){
          this.stateManager.addHashToJson = true;
          }
        }
        else {
          this.currentUserId =  this.generateNewUserId();
          this.setUserIdCookie(this.currentUserId);
        }
      }
      this.setHashKeyCookie(hashkey);
      this.stateManager.hashKey = hashkey;
  }
    return  (new Promise((resolve) => {resolve (this.currentUserId)}));

  }
  public validateUserId(userId :string):boolean{
    if(!userId)return false
    if(this.stateManager.validateUserId!="*"){
      const listStr = this.stateManager.validateUserId.split("/")
       return (new RegExp(listStr[0])).test(userId)
    }
    else{
      return true
    }
  }

  public handleInvalidUserId(){
    const con = confirm("Error: invalid user_id.")
    this.deleteUserIdCookie()
    window.location.assign('/')
  }

  public setHashKeyCookie(value: string): void {
    console.log('Setting hash key cookie: ' + value);
    this.cookieService.set('hash_key', value, 200);
  }
  public deleteHashKeyCookie(): void {
      this.cookieService.delete('hash_key');
  }

  public setSingleAssessmentCookie(value): void {
    console.log('Setting single assessment to: ' + value);
    this.cookieService.set('single_assessment', value, 200);
  }
  public getSingleAssessmentCookie(): string {
    return this.cookieService.get('single_assessment');
  }
  public setUserIdCookie(value: string): void {
    console.log('Setting user cookie: ' + value);
    this.cookieService.set('user_id', value, 200);
  }

  public deleteUserIdCookie(): void {
    console.log("deleting user_id cookie")
    this.cookieService.delete('user_id');
    this.cookieService.delete('user_id','/')
  }

  public checkUserIdCookie(): boolean {
    return this.cookieService.check('user_id');
  }

  public checkHashKeyCooke(): boolean {
    return this.cookieService.check('hash_key');
  }

  public getUserIdCookie(): string {
    return this.cookieService.get('user_id');
  }

  public getHashKeyCookie(): string {
    return this.cookieService.get('hash_key');
  }

  public deleteUserCookieDebugMode(): void {
    if (this.stateManager.DEBUG_MODE) {
      var c = confirm("Are you sure you want to do delete the user's cookie? You will have to restart the whole assessment.");

      if (c == true) {this.deleteUserIdCookie();window.location.assign('/')}
    }
  }

  public setUserIdCookieAndSetData(): void {
      this.currentUserId = this.generateNewUserId();
      this.setUserIdCookie(this.currentUserId);
      this.stateManager.serveDiagnostics()
  }
  public generateNewUserId () : string {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    let date = yyyy + '-'+ mm + '-' + dd;
    return (date + "_"+uuidv1({nsecs: Math.floor(Math.random() * 10000)}).toString())
  }

  public setData(): void {
    // KRM: Get the data for the current user
    // that has already been put in the database from pervious assessments
    if (this.stateManager.assessmentsLeftLinkedList.length==0){
      this._partialAssessmentDataSubscription = this.checkUserExist(
        this.getUserIdCookie()
      );
      this._partialAssessmentDataSubscription.subscribe(
        (data: AssessmentData | boolean) => {
          this.stateManager.serveDiagnostics();
          if (data==false){

          }
          else {
            this.stateManager.hasDoneDiagnostics = true;
            this.partialAssessmentData = <AssessmentData> data;
            this.stateManager.initializeState(this.partialAssessmentData);
            // KRM: Initialize the current state of the assessments based
            // on the past assessments already completed
          }
        }
      );
    }
  }

  public getUserAssessmentDataFromFileSystem(
    user_id: string,date:string
  ): Observable<AssessmentData> {
    if (this.validateUserId(user_id))
      return <Observable<AssessmentData>>(
      this.http.get('/api/assessmentsAPI/GetUserAssessment/' + user_id+"/"+date)
    );
    else this.handleInvalidUserId()
  }

  public getHashKeyAssessmentDataFromFileSystem(
    hash_key: string
  ): Observable<AssessmentData> {
    return <Observable<AssessmentData>>(
      this.http.get('/api/assessmentsAPI/GetUserAssessment/' + hash_key)
    );
  }
  public sendEndTime(userId :string): Observable<any>{
    const structure= {userId:userId,time:this.returnTime(new Date())}
    if(this.validateUserId(userId))
      return <Observable<any>>this.http.post('/api/assessmentsAPI/AddEndTime',structure,{responseType:'json'});
    else this.handleInvalidUserId()
    }

  public postAssessmentDataToFileSystem(
    assessmentsData: AssessmentDataStructure,
    googleData: GoogleSpeechToTextDataStructure
  ,sendBackData?: boolean): Observable<Object> {
    let structure;
      //optional sendBackData boolean tells whether to send back data or just a success string
      //addHashkeyToJason check
    if (this.validateUserId(this.getUserIdCookie())){
      structure = {
        sendBackData: sendBackData,
        addHashkeyToJson: this.stateManager.addHashToJson,
        user_id: this.getUserIdCookie(),
        hash_key: this.getHashKeyCookie(),
        assessments: [assessmentsData],
        //google_speech_to_text_assess: [googleData]
      };
      this.stateManager.addHashToJson = false;

      return this.http.post('/api/assessmentsAPI/SaveAssessments', structure, {
        responseType: 'json'
        });
     }
    else this.handleInvalidUserId()
  }
//post audio after first
  public postSingleAudioDataToMongo(
    assessmentsData: AssessmentDataStructure,
    googleData: GoogleSpeechToTextDataStructure
  ): Observable<string> {
    let structure;
    if (this.validateUserId(this.getUserIdCookie())){
      structure = {
        user_id: this.getUserIdCookie(),
        addHashkeyToJson: this.stateManager.addHashToJson,
        hash_key: this.getHashKeyCookie(),
        assessments: [assessmentsData],
        //google_speech_to_text_assess: [googleData]
      };
      this.stateManager.addHashToJson = false;
      return this.http.post('/api/assessmentsAPI/PushOnePieceData', structure, {
        responseType: 'text'
      });
    }
    else this.handleInvalidUserId()
  }


  //don't need anymore [:BT]
  /*
  public getNextUserID(): Observable<UserIdObject> {
    return <Observable<UserIdObject>>(
      this.http.get('/api/assessmentsAPI/NextUserID', {})
    );
  }
  */

  public sendHashKeyToServer(hashKey: string, userId: string,date:string): Observable<Object> {
    console.log("in sendHaskey to server with sendNewHash value "+ this.stateManager.addHashToJson)
    if (this.validateUserId(userId))
      return this.http.get(
        '/api/assessmentsAPI/InitializeSingleUserAssessment/' + hashKey +'/'+ userId+'/'+date
      );
    else this.handleInvalidUserId()
  }
  public checkUserExist(user_id): Observable<AssessmentData> {
    if(this.validateUserId(user_id))
      return <Observable<AssessmentData>>(
        this.http.get('/api/assessmentsAPI/CheckUserExist/' + user_id)
      );
    else this.handleInvalidUserId()
  }

  public getAssets(
    assetType: string,
    assessmentName: string
  ): Observable<AssetsObject> {
    const options = {
      params: new HttpParams()
        .set('assetType', assetType)
        .set('assessmentName', assessmentName)
    };
    return <Observable<AssetsObject>>(
      this.http.get('/api/assessmentsAPI/GetAssets', options)
    );
  }

  public validateHashWithS3(hashkey :string): Observable<boolean>{
    return <Observable<boolean>> (this.http.get('/api/assessmentsAPI/validateHashWithS3/'+hashkey))
  }

}
