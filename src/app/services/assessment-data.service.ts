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
  currentAssessment = '';
  assessmentsList: string[];
  allAssessmentsCompleted: Boolean = false;
  router: Router;
  showWelcomePage = true;

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
    return this.cookieService.get(name);
  }

  public getAllCookies(): object {
    return this.cookieService.getAll();
  }

  public isAssessmentCompleted(assess_name_check: string): Boolean {
    return this.checkCookie(assess_name_check);
  }

  public populateCompletionCookies(assessmentsData: AssessmentData): void {
    for (const value of assessmentsData.assessments) {
      if (!this.checkCookie(value.assess_name)) {
        this.cookieService.set(value.assess_name, 'completed', 200);
      }
    }
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

  public setCurrentAssessment(set: string): void {
    this.currentAssessment = set;
  }

  public getCurrentAssessment(): string {
    return this.currentAssessment;
  }

  private determineNextAssessment(): string {
    for (const assessmentName of this.assessmentsList) {
      if (!this.isAssessmentCompleted(assessmentName)) {
        console.log('not completed: ' + assessmentName); // KRM: Debugging
        this.setIsInAssessment(true);
        return assessmentName;
      }
    }
    this.allAssessmentsCompleted = true;
    return 'done';
    // KRM: TODO: The purpose of this return value is not very clear right now,
    //            will be used to direct to a 'done' assessment page when all
    //            the way through, or when the one assessment is done.
  }

  public nextAssessment(): void {
    if (this.showWelcomePage) {
      this.showWelcomePage = false;
    }
    this.setCurrentAssessment(this.determineNextAssessment());
    console.log('Getting assessment: ' + this.getCurrentAssessment()); // KRM: For debugging
    this.goTo(this.getCurrentAssessment());
  }

  public goTo(assessmentName: string): void {
    console.log('navigating to: ' + assessmentName); // KRM: For bebugging
    this.router.navigate(['/assessments/', assessmentName]);
  }
}
