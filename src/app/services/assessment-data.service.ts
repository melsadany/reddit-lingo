import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { AssessmentModel } from '../../../server/models/assessment.model';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';

@Injectable()
export class AssessmentDataService {
  assessmentData;
  constructor(private Http: HttpClient, private cookieService: CookieService) {
    this.http = Http;
  }
  http: HttpClient;
  public setCookie(name: string, value: string, date): void {
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
  public getAllCookies() {
    return this.cookieService.getAll();
  }
  public checkIfAssessmentCompleted(assess_name_check: string): Boolean {
    return this.checkCookie(assess_name_check);
  }
  public populateCompletionCookies(assessmentsList): void {
    assessmentsList.forEach(value => {
      if (!this.checkCookie(value.assess_name)) {
        this.setCookie(value.assess_name, 'completed', 200);
      }
    });
  }
  public getUserAssessmentDataFromMongo(
    user_id: String
  ): Observable<AssessmentModel> {
    return this.http.get('/api/assessmentsAPI/GetUserAssessment/' + user_id);
  }
  public postAssessmentDataToMongo(
    assessmentsData: AssessmentModel
  ): Observable<AssessmentModel> {
    return this.http.post(
      '/api/assessmentsAPI/SaveAssessments',
      assessmentsData,
      {
        responseType: 'text'
      }
    );
  }
  public getNextUserID() {
    return this.http.get('/api/assessmentsAPI/NextUserID', {});
  }
}
