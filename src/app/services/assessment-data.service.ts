import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { UserIdObject } from '../structures/useridobject';
import { AssessmentData } from '../structures/assessmentdata';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';

@Injectable()
export class AssessmentDataService {
  assessmentData: AssessmentData;
  http: HttpClient;
  inAssessment: Boolean = false;
  currentAssessment: String = '';
  assessmentsList: string[];
  allAssessmentsCompleted: Boolean = false;
  router: Router;

  constructor(
    private Http: HttpClient,
    private cookieService: CookieService,
    router: Router
  ) {
    this.http = Http;
    this.assessmentsList = ['ran']; // KRM: Add to this list to add more assessments as they are built
    this.router = router;
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

  public isAssessmentCompleted(assess_name_check: string): Boolean {
    return this.checkCookie(assess_name_check);
  }

  public populateCompletionCookies(assessmentsData: AssessmentData): void {
    assessmentsData.assessments.forEach(value => {
      if (!this.checkCookie(value.assess_name)) {
        this.setCookie(value.assess_name, 'completed', 200);
      }
    });
  }

  public getUserAssessmentDataFromMongo(
    user_id: string
  ): Observable<AssessmentData> {
    return <Observable<AssessmentData>>(
      this.http.get('/api/assessmentsAPI/GetUserAssessment/' + user_id)
    );
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

  public isInAssessment(): Boolean {
    return this.inAssessment;
  }

  public setIsInAssessment(set: Boolean): void {
    this.inAssessment = set;
  }

  public setCurrentAssessment(set: String): void {
    this.currentAssessment = set;
  }

  public getCurrentAssessment(): String {
    return this.currentAssessment;
  }

  determineNextAssessment(): String {
    for (const assessmentName of this.assessmentsList) {
      if (!this.isAssessmentCompleted(assessmentName)) {
        console.log('not completed: ' + assessmentName); // KRM: Debugging
        return assessmentName;
      }
    }
    this.allAssessmentsCompleted = true;
    return 'done';
    // KRM: TODO: The purpose of this return value is not very clear right now,
    //            will be used to direct to a 'done' assessment page when all
    //            the way through, or when the one assessment is done.
  }

  nextAssessment(): void {
    this.setCurrentAssessment(this.determineNextAssessment());
    console.log(this.getCurrentAssessment());
    this.setIsInAssessment(true);
    this.router.navigate(['/assessments/', this.getCurrentAssessment()]);
  }
}
