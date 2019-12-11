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
    if (!this.checkUserIdCookie()) {
      this.setUserIdCookieAndSetData();
    } else {
      this.setData();
      // KRM: Seting the data will initialize the state of the assessments
    }
  }

  public initializeHashKeyData(hashkey :string): Promise<string> {
    this.setHashKeyCookie(hashkey)
    this.stateManager.hashKey=hashkey;
    //if there is no userId cookie, we can't uptain the json data for the hash so we have to create a new one
    if (this.checkUserIdCookie()) {
      this.currentUserId = this.getUserIdCookie()
      return ( new Promise ((resolve) => resolve (this.currentUserId)));
    }
    
    else {
       
        return  (new Promise((resolve) => {
         this.currentUserId =  this.generateNewUserId();
        this.setUserIdCookie(this.currentUserId);
        console.log("THIS GOES FIRST id is in initializehashkeydata.." + this.currentUserId)
        resolve (this.currentUserId)
        }))
    }
    //automatically set userhash even if they had one already (will always defualt to new hashkey)
   
  
    
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
          console.log("found id so but not in directory yet (in setData)")
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
      structure = {
        sendBackData: sendBackData,
        user_id: this.getUserIdCookie(),
        hash_key: this.getHashKeyCookie(),
        assessments: [assessmentsData],
        google_speech_to_text_assess: [googleData]
      };
    
    return this.http.post('/api/assessmentsAPI/SaveAssessments', structure, {
      responseType: 'json'
    });
  }

  public postSingleAudioDataToMongo(
    assessmentsData: AssessmentDataStructure,
    googleData: GoogleSpeechToTextDataStructure
  ): Observable<string> {
    let structure;

    structure = {
      user_id: this.getUserIdCookie(),
      assessments: [assessmentsData],
      google_speech_to_text_assess: [googleData]
    };
    
    return this.http.post('/api/assessmentsAPI/PushOnePieceData', structure, {
      responseType: 'text'
    });
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
