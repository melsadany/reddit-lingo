import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { UserIdObject } from '../structures/UserIdObject';
import {
  AssessmentData,
  AssessmentDataStructure,
  GoogleSpeechToTextDataStructure,
  AssetsObject
} from '../structures/AssessmentDataStructures';
import 'rxjs/add/operator/map';
import { StateManagerService } from './state-manager.service';
import { async } from '@angular/core/testing';
import { resolve } from 'dns';
const uuidv1 = require('uuid/v1')

@Injectable()
export class AssessmentDataService {
  private _currentUserId: string;
  private _partialAssessmentData: AssessmentData;
  private _partialAssessmentDataSubscription: Observable<
    AssessmentData
  > = this.getUserAssessmentDataFromFileSystem(this.getUserIdCookie());
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

  public initializeData(): void {
    console.log("in initialize data for")
    if (!this.checkUserIdCookie()) {
      
      this.setUserIdCookieAndSetData();
    } else {
      this.setData();
      // KRM: Seting the data will initialize the state of the assessments
    }
  }
  public validHashKey(hashKey: string): boolean {
    // if it matches 8 or 12 anyletter/anynumbered hash (with no underscores) :BT
  

    if (hashKey.length==12 && hashKey.slice(4).match(/^\w+$/gmi) && this.stateManager.hashKeyFirstFourMap(hashKey) !== 'home'){
      this.stateManager.isSingleAssessment = true;
      return true
    }
    return false
  }

  public initializeHashKeyData(hashkey :string): Promise<string> {
    //checks if old hash is valid (if so, they need to finish it)
    if (this.validHashKey(this.getHashKeyCookie())){
      if (this.checkUserIdCookie()){
        this.currentUserId = this.getUserIdCookie()
        
      }
      else{ this.currentUserId = this.generateNewUserId()}
      this.stateManager.hashKey = this.getHashKeyCookie();
    }
    else {
      //tells if new hash is valid (if it is then start new single assessment overiding any previous progress)
      if (this.stateManager.isSingleAssessment){
          this.currentUserId =  this.generateNewUserId();
          this.setUserIdCookie(this.currentUserId);
      }
      else {
        if (this.checkUserIdCookie()){
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
    this.cookieService.delete('user_id');
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
      this.deleteUserIdCookie();
    }
  }
  public setAssignmentId(value:string){
    //console.log("setting up assignment_id cookie..")
    this.cookieService.set('assignment_id', value, 200);
  }
  public getAssignmentId():string{
    //console.log("getting the assignment_id cookie..")
    return this.cookieService.get('assignment_id')
  }
  public deleteAssignmentId():void{
    //console.log("Deleting assignment_id cookie..")
    this.cookieService.delete('assignment_id',"/");
  }

  public setUserIdCookieAndSetData(): void {
      this.currentUserId = this.generateNewUserId();
      this.setUserIdCookie(this.currentUserId);
      this.stateManager.serveDiagnostics()
  }
  public generateNewUserId () : string {
      return (uuidv1({nsecs: Math.floor(Math.random() * 10000)}).toString())
    }

  public setData(): void {
    // KRM: Get the data for the current user
    // that has already been put in the database from pervious assessments
    
    this._partialAssessmentDataSubscription = this.checkUserExist(
      this.getUserIdCookie()
    );
    this._partialAssessmentDataSubscription.subscribe(
      (data: AssessmentData | boolean) => {
        if (data==false){
          this.stateManager.serveDiagnostics();
        }
        else {
          this.partialAssessmentData = <AssessmentData> data;
          this.stateManager.initializeState(this.partialAssessmentData);
          // KRM: Initialize the current state of the assessments based
          // on the past assessments already completed
        }
      }
    );
  }

  public getUserAssessmentDataFromFileSystem(
    user_id: string
  ): Observable<AssessmentData> {
    return <Observable<AssessmentData>>(
      this.http.get('/api/assessmentsAPI/GetUserAssessment/' + user_id)
    );
  }

  public getHashKeyAssessmentDataFromFileSystem(
    hash_key: string
  ): Observable<AssessmentData> {
    return <Observable<AssessmentData>>(
      this.http.get('/api/assessmentsAPI/GetUserAssessment/' + hash_key)
    );
  }

  public postAssessmentDataToFileSystem(
    assessmentsData: AssessmentDataStructure,
    googleData: GoogleSpeechToTextDataStructure
  ,sendBackData?: boolean): Observable<Object> {
    let structure;
      //optional sendBackData boolean tells whether to send back data or just a success string
      //addHashkeyToJason check
      if (this.checkUserIdCookie()){
      structure = {
        sendBackData: sendBackData,
        addHashkeyToJson: this.stateManager.addHashToJson,
        user_id: this.getUserIdCookie(),
        hash_key: this.getHashKeyCookie(),
        assessments: [assessmentsData],
        google_speech_to_text_assess: [googleData]
      };
      this.stateManager.addHashToJson = false;
    
      return this.http.post('/api/assessmentsAPI/SaveAssessments', structure, {
        responseType: 'json'
        });
     }
     else {
      window.location.assign('/')
      return (JSON.parse("Error: no userID found."))
     }
  }
//post audio after first
  public postSingleAudioDataToMongo(
    assessmentsData: AssessmentDataStructure,
    googleData: GoogleSpeechToTextDataStructure
  ): Observable<string> {
    let structure;
    if (this.checkUserIdCookie()){
    structure = {
      user_id: this.getUserIdCookie(),
      addHashkeyToJson: this.stateManager.addHashToJson,
      hash_key: this.getHashKeyCookie(),
      assessments: [assessmentsData],
      google_speech_to_text_assess: [googleData]
    };
    this.stateManager.addHashToJson = false;
    return this.http.post('/api/assessmentsAPI/PushOnePieceData', structure, {
      responseType: 'text'
    });
    }
    else {
      window.location.assign('/');
     }
  }


  //don't need anymore [:BT]
  /*
  public getNextUserID(): Observable<UserIdObject> {
    return <Observable<UserIdObject>>(
      this.http.get('/api/assessmentsAPI/NextUserID', {})
    );
  }
  */

  public sendHashKeyToServer(hashKey: string, userId: string): Observable<Object> {
    console.log("in sendHaskey to server with sendNewHash value "+ this.stateManager.addHashToJson)
    return this.http.get(
      '/api/assessmentsAPI/InitializeSingleUserAssessment/' + hashKey +'/'+ userId,
      {}
    );
  }
  public checkUserExist(user_id): Observable<AssessmentData> {
    return <Observable<AssessmentData>>(
      this.http.get('/api/assessmentsAPI/CheckUserExist/' + user_id)
    );
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
}
