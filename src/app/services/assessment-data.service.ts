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

@Injectable()
export class AssessmentDataService {
  assessmentData: AssessmentData;

  constructor(private cookieService: CookieService, private http: HttpClient) {}

  public setUserIdCookie(value: string): void {
    this.cookieService.set('user_id', value, 200);
  }

  public deleteUserIdCookie(): void {
    this.cookieService.delete('user_id');
  }

  public checkUserIdCookie(): boolean {
    return this.cookieService.check('user_id');
  }

  public getUserIdCookie(): string {
    return this.cookieService.get('user_id');
  }

  public getUserAssessmentDataFromMongo(
    user_id: string
  ): Observable<AssessmentData> {
    return <Observable<AssessmentData>>(
      this.http.get('/api/assessmentsAPI/GetUserAssessment/' + user_id)
    );
  }

  public postAssessmentDataToMongo(
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

  public getNextUserID(): Observable<UserIdObject> {
    return <Observable<UserIdObject>>(
      this.http.get('/api/assessmentsAPI/NextUserID', {})
    );
  }
}
