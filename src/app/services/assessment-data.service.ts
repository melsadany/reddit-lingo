import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { UserIdObject } from '../structures/useridobject';
import {
  AssessmentData,
  AssessmentDataStructure,
  GoogleSpeechToTextDataStructure
} from '../structures/assessmentdata';
import 'rxjs/add/operator/map';
import { StateManagerService } from './state-manager.service';

@Injectable()
export class AssessmentDataService {
  private _currentUserId: string;
  private _partialAssessmentData: AssessmentData;
  private _partialAssessmentDataSubscription: Observable<
    AssessmentData
  > = this.getUserAssessmentDataFromFileSystem(this.getUserIdCookie());
  constructor(
    private cookieService: CookieService,
    private http: HttpClient,
    public stateManager: StateManagerService
  ) {
    if (!this.checkUserIdCookie()) {
      this.setUserIdCookieAndSetData();
    } else {
      this.setData();
    }
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

  public setUserIdCookie(value: string): void {
    this.cookieService.set('user_id', value, 200, '/assessments');
  }

  public deleteUserIdCookie(): void {
    this.cookieService.delete('user_id', '/assessments');
  }

  public checkUserIdCookie(): boolean {
    return this.cookieService.check('user_id');
  }

  public getUserIdCookie(): string {
    return this.cookieService.get('user_id');
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
        // console.log(JSON.stringify(this.partialAssessmentData));
        this.stateManager.initializeState(this.partialAssessmentData);
        // this.initializeData(this.partialAssessmentData);
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

  public postAssessmentDataToFileSystem(
    assessmentsData: AssessmentDataStructure,
    googleData: GoogleSpeechToTextDataStructure
  ): Observable<string> {
    return this.http.post(
      '/api/assessmentsAPI/SaveAssessments',
      {
        user_id: this.getUserIdCookie(),
        assessments: [assessmentsData],
        google_speech_to_text_assess: [googleData]
      },
      {
        responseType: 'text'
      }
    );
  }

  public postSingleAudioDataToMongo(
    assessmentsData: AssessmentDataStructure,
    googleData: GoogleSpeechToTextDataStructure
  ): Observable<string> {
    return this.http.post(
      '/api/assessmentsAPI/PushOnePieceData',
      {
        user_id: this.getUserIdCookie(),
        assessments: [assessmentsData],
        google_speech_to_text_assess: [googleData]
      },
      {
        responseType: 'text'
      }
    );
  }

  public getNextUserID(): Observable<UserIdObject> {
    return <Observable<UserIdObject>>(
      this.http.get('/api/assessmentsAPI/NextUserID', {})
    );
  }
}
