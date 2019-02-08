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
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';
import { StateManagerService } from './state-manager.service';

@Injectable()
export class AssessmentDataService {
  private _DEBUG_MODE = true; // KRM: FOR BEBUGGING ONLY. GIVES DEBUG BUTTON IN ASSESSMENTS
  assessmentData: AssessmentData;
  http: HttpClient;
  inAssessment: Boolean = false;
  allAssessmentsCompleted: Boolean = false;
  router: Router;
  showWelcomePage = true;
  textOnStartButton = 'START';
  textOnAssessmentButton: string;
  welcomeText = 'Welcome to the assessments';
  firstTimeStarting = true;
  startButton = false;
  splashPage = true;

  constructor(
    private Http: HttpClient,
    private cookieService: CookieService,
    private stateManager: StateManagerService,
    router: Router
  ) {
    this.http = Http;
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

  public isAssessmentCompleted(assessNameCheck: string): Boolean {
    return this.checkCookie(assessNameCheck);
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
        user_id: this.getCookie('user_id'),
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
    for (const assessmentState of this.stateManager.assessments) {
      if (!assessmentState['completed']) {
        console.log('not completed: ' + assessmentState['assessment_name']); // KRM: Debugging
        return assessmentState['assessment_name'];
      }
    }
    this.allAssessmentsCompleted = true;
    return 'done';
    // KRM: done is the name of the route for the completion component
  }

  public nextAssessment(): void {
    if (this.stateManager.showAssessmentFrontPage) {
      this.stateManager.showAssessmentFrontPage = false;
    }
    if (this.firstTimeStarting) {
      this.firstTimeStarting = false;
      this.textOnStartButton = 'Continue Assessments';
      this.welcomeText = 'You have partially completed the set of assessments';
    }
    this.setCurrentAssessment(this.determineNextAssessment());
    console.log('Getting assessment: ' + this.getCurrentAssessment()); // KRM: For debugging
    this.goTo(this.getCurrentAssessment());
  }

  public goTo(assessmentName: string): void {
    this.setStartButton(true);
    this.router.navigate(['/assessments/', assessmentName]);
  }

  public getCurrentUrl(): string {
    return this.router.url;
  }

  public getCurrentAssessmentUrl(): string {
    return this.router.url.slice(13); // KRM: Slice off the /assessments/ portion of the url to just get the assessment name
  }

  public showButton(): Boolean {
    return (
      this.getCurrentUrl() === '/assessments' ||
      this.isAssessmentCompleted(this.getCurrentAssessment()) ||
      (!this.inAssessment &&
        !this.showWelcomePage &&
        !this.allAssessmentsCompleted)
    );
  }

  public showThankYou(): Boolean {
    return this.isAssessmentCompleted(this.getCurrentAssessmentUrl());
  }

  public showWelcome(): Boolean {
    return (
      this.showWelcomePage &&
      !this.inAssessment &&
      !this.allAssessmentsCompleted
    );
  }

  public setStartButton(set: boolean): void {
    this.startButton = set;
  }

  public showStartButton(): boolean {
    return this.startButton;
  }

  public setSplashPage(set: boolean): void {
    this.splashPage = set;
  }

  public showSplashPage(): boolean {
    return this.splashPage;
  }

  public showInitialSplashPage(assessment: string): Boolean {
    return (
      this.currentAssessment === assessment &&
      !this.isAssessmentCompleted(assessment)
    );
  }

  public doRedirectBackToStart(): Boolean {
    return this.showWelcome() && !this.showButton(); // If you come to an assessment just from the browser with the URL
  }

  public get DEBUG_MODE(): boolean {
    return this._DEBUG_MODE;
  }
  public set DEBUG_MODE(value: boolean) {
    this._DEBUG_MODE = value;
  }

  public nextAssessmentDebugMode(): void {
    if (this.DEBUG_MODE) {
      this.setIsInAssessment(false);
      this.setCookie(this.currentAssessment, 'completed', 200);
      this.nextAssessment();
    }
  }

  public deleteCookiesDebugMode(): void {
    if (this.DEBUG_MODE) {
      this.cookieService.deleteAll();
    }
  }
}
