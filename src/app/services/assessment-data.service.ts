import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { UserIdObject } from '../structures/useridobject';
import { AssessmentData } from '../structures/assessmentdata';
import 'rxjs/add/operator/map';

@Injectable()
export class AssessmentDataService {
  assessmentData: AssessmentData;
  http: HttpClient;

  constructor(private Http: HttpClient, private cookieService: CookieService) {
    this.http = Http;
  }

  public setCookie(name: string, value: string, date: number): void {
    this.cookieService.set(name, value, date);
  }

  public deleteCookie(name: string): void {
    this.cookieService.delete(name);
  }

  public checkCookie(name: string): boolean {
    return this.cookieService.check(name);
  }

  public getCookie(name: string): string {
    const id = this.cookieService.get(name);
    console.log('User id getting cookie for: ' + id);
    return id;
  }

  public getAllCookies(): Object {
    return this.cookieService.getAll();
  }

  public checkIfAssessmentCompleted(assess_name_check: string): Boolean {
    return this.checkCookie(assess_name_check);
  }

  public populateCompletionCookies(assessmentsData: AssessmentData): void {
    assessmentsData.assessments.forEach(value => {
      if (!this.checkCookie(value.assess_name)) {
        this.setCookie(value.assess_name, 'completed', 200);
      }
    });
  }

  public getUserAssessmentDataFromMongo(user_id: string): Observable<AssessmentData> {
    return <Observable<AssessmentData>> this.http.get('/api/assessmentsAPI/GetUserAssessment/' + user_id);
  }

  public postAssessmentDataToMongo(
    assessmentsData: AssessmentData
  ): Observable<string> {
    return this.http.post(
      '/api/assessmentsAPI/SaveAssessments',
      assessmentsData,
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
