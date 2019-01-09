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
    this.http
      .get(
        '/api/assessmentsAPI/GetUserAssessment/' +
          this.cookieService.get('user_id')
      )
      .subscribe(data => {
        this.assessmentData = data;
        console.log(this.assessmentData);
      });
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
    return this.cookieService.get(name);
  }
  public getAllCookies() {
    return this.cookieService.getAll();
  }
  public checkIfAssessmentCompleted(assess_name_check: string): Boolean {
    return this.checkCookie(assess_name_check);
  }
  public postAssessmentDataToMongo(
    assessmentsData: AssessmentModel
  ): Observable<AssessmentModel> {
    // KRM TODO: Abstract away the methods to post data to mongo and update the document.
    return this.http.post(
      '/api/assessmentsAPI/SaveAssessments',
      assessmentsData,
      {
        responseType: 'text'
      }
    );
  }
}
