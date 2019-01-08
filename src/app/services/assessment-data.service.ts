import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { AssessmentModel } from '../../../server/models/assessment.model';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map'
import { AssessmentsModule } from '../assessments-module/assessments-controller.module';

@Injectable()
export class AssessmentDataService {
  assessmentData;
  constructor(private Http: HttpClient, private cookieService: CookieService) {
    this.http = Http;
    console.log(this.cookieService.getAll());
    this.http
      .get(
        '/api/assessmentsAPI/GetUserAssessment/' +
          this.cookieService.get('user_id')
      )
      .map(data => {
        this.assessmentData = data;
        console.log(this.assessmentData);
      });
  }
  http: HttpClient;

  public newUserId(value) {
    this.setCookie(
      'user_id',
      Math.floor(Math.random() * value + 1).toString(),
      new Date(2020, 2, 1)
    );
    console.log(this.checkCookie('user_id'));
  }
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
  public checkIfAssessmentCompleted(assess_name_check: String): Boolean {
    this.assessmentData.assessments.forEach(element => {
      if (
        element.assess_name === assess_name_check &&
        element.completed === true
      ) {
        return true;
      }
    });
    return false;
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
  public createNewEntryInMongo() {
    return this.postAssessmentDataToMongo({
      user_id: this.getCookie('user_id'),
      assessments: [],
      google_speech_to_text_assess: []
    });
  }
}
