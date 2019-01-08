import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { AssessmentModel } from '../../../server/models/assessment.model';

@Injectable()
export class AssessmentDataService {
  public get user_id() {
    return this._user_id;
  }
  public set newUser_id(value) {
    this._user_id = Math.floor(Math.random() * value + 1).toString();
    this.setCookie('user_id', this.user_id(), new Date(2020, 2, 1), '/assessments');
  }
  public get assessmentData() {
    return this._assessmentData;
  }

  constructor(private Http: HttpClient, private cookieService: CookieService) {
    this.http = Http;
    if (this.checkCookie('user_id')) {
      this.http.get('/api/assessmentsAPI/GetUserAssessment/' + this._user_id()).subscribe((data) => this._assessmentData = data);
    } else {
      this.newUser_id(50);
    }
  }
  private _user_id;
  private _assessmentData;
  http: HttpClient;
  public setCookie(name: string, value: string, date, path): void {
    this.cookieService.set(name, value, date, path);
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
  public checkIfAssessmentCompleted(assess_name_check: String) {
    this.assessmentData().assessments.forEach(element => {
      if (element.assess_name === assess_name_check && element.completed === true) {
        return true;
      }
    });
    return false;
  }
  public postAssessmentDataToMongo(assessmentsData: AssessmentModel) {
    // KRM TODO: Abstract away the methods to post data to mongo and update the document.
  }
}

