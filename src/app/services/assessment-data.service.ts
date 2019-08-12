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

  public initializeHashKeyData(userHashKey: string): void {
    if (this.checkUserIdCookie()) {
      this.deleteUserIdCookie();
    }
    this.setHashKeyCookie(userHashKey);
  }

  public setHashKeyCookie(value: string): void {
    console.log('Setting hash key cookie: ' + value);
    this.cookieService.set('hash_key', value, 200);
  }

  public deleteHashKeyCookie(): void {
    this.cookieService.delete('hash_key');
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
    this.getNextUserID().subscribe((value: UserIdObject) => {
      this.currentUserId = value.nextID.toString();
      this.setUserIdCookie(this.currentUserId);
      this.setData();
    });
  }

  public setData(): void {
    // KRM: Get the data for the current user
    // that has already been put in the database from pervious assessments
    this._partialAssessmentDataSubscription = this.getUserAssessmentDataFromFileSystem(
      this.getUserIdCookie()
    );
    this._partialAssessmentDataSubscription.subscribe(
      (data: AssessmentData) => {
        this.partialAssessmentData = data;
        this.stateManager.initializeState(this.partialAssessmentData);
        // KRM: Initialize the current state of the assessments based
        // on the past assessments already completed
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
  ): Observable<string> {
    let structure;
    if (this.stateManager.hashKey) {
      structure = {
        hash_key: this.getHashKeyCookie(),
        assessments: [assessmentsData],
        google_speech_to_text_assess: [googleData]
      };
    } else {
      structure = {
        user_id: this.getUserIdCookie(),
        assessments: [assessmentsData],
        google_speech_to_text_assess: [googleData]
      };
    }
    return this.http.post('/api/assessmentsAPI/SaveAssessments', structure, {
      responseType: 'text'
    });
  }

  public postSingleAudioDataToMongo(
    assessmentsData: AssessmentDataStructure,
    googleData: GoogleSpeechToTextDataStructure
  ): Observable<string> {
    let structure;
    if (this.stateManager.hashKey) {
      structure = {
        hash_key: this.getHashKeyCookie(),
        assessments: [assessmentsData],
        google_speech_to_text_assess: [googleData]
      };
    } else {
      structure = {
        user_id: this.getUserIdCookie(),
        assessments: [assessmentsData],
        google_speech_to_text_assess: [googleData]
      };
    }
    return this.http.post('/api/assessmentsAPI/PushOnePieceData', structure, {
      responseType: 'text'
    });
  }

  public getNextUserID(): Observable<UserIdObject> {
    return <Observable<UserIdObject>>(
      this.http.get('/api/assessmentsAPI/NextUserID', {})
    );
  }

  public sendHashKeyToServer(hashKey: string): Observable<Object> {
    return this.http.get(
      '/api/assessmentsAPI/InitializeSingleUserAssessment/' + hashKey,
      {}
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

  public postToMTurk(assignmentId: string): Observable<Object> {
    const URL = 'https://workersandbox.mturk.com/mturk/externalSubmit' + '/?assignmentId=' + assignmentId;
    console.log('Finishing MTurk HIT');
    // const params = {
    //   AssignmentId: assignmentId
    // };
    const options = {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    };
    return this.http.post(URL, {}, options);
  }

  //   public getMTurkAssignment(assignmentId: string): Observable<Object> {
  //     console.log('Getting MTurk Assignment Info');
  //     const options = {
  //       params: new HttpParams()
  //         .set('assignmentId', assignmentId)
  //     };
  //     return this.http.get('/api/assessmentsAPI/GetMTurkAssignment', options);
  //   }
}
