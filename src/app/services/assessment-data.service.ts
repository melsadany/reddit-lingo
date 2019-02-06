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

@Injectable()
export class AssessmentDataService {
  private _DEBUG_MODE = true; // KRM: FOR BEBUGGING ONLY. GIVES DEBUG BUTTON IN ASSESSMENTS
  assessmentData: AssessmentData;
  http: HttpClient;
  inAssessment: Boolean = false;
  currentAssessment = '';
  assessmentsList: string[] = [
    'listeningcomprehension',
    'prescreenerquestions',
    'wordfinding',
    'sentencerepetition',
    'matrixreasoning',
    'syncvoice',
    'timeduration',
    'ran',
    'pictureprompt',
    'postscreenerquestions'
  ]; // KRM: Add to this list to add more assessments as they are built
  // The ordering determines the order in which the assessments are presented
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

  public populateCompletionCookies(assessmentsData: AssessmentData): void {
    for (const value of assessmentsData.assessments) {
      if (!this.checkCookie(value.assess_name)) {
        this.cookieService.set(value.assess_name, 'completed', 200);
      }
    }
    if (Object.keys(this.cookieService.getAll()).length > 1) {
      this.textOnStartButton = 'Continue assessments';
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
    for (const assessmentName of this.assessmentsList) {
      if (!this.isAssessmentCompleted(assessmentName)) {
        console.log('not completed: ' + assessmentName); // KRM: Debugging
        return assessmentName;
      }
    }
    this.allAssessmentsCompleted = true;
    return 'done';
    // KRM: done is the name of the route for the completion component
  }

  public nextAssessment(): void {
    if (this.showWelcomePage) {
      this.showWelcomePage = false;
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
    this.setIsInAssessment(true);
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
