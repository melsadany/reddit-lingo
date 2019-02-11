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
  assessmentData: AssessmentData;

  constructor(
    private cookieService: CookieService,
    private http: HttpClient
  ) {}

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

  // public getAllCookies(): object {
  //   return this.cookieService.getAll();
  // }

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

  // public getCurrentAssessmentUrl(): string {
  //   return this.router.url.slice(13); // KRM: Slice off the /assessments/ portion of the url to just get the assessment name
  // }

  // public showButton(): Boolean {
  //   return (
  //     this.getCurrentUrl() === '/assessments' ||
  //     this.isAssessmentCompleted(this.getCurrentAssessment()) ||
  //     (!this.inAssessment &&
  //       !this.showWelcomePage &&
  //       !this.allAssessmentsCompleted)
  //   );
  // }

  // public showThankYou(): Boolean {
  //   return this.isAssessmentCompleted(this.getCurrentAssessmentUrl());
  // }

  // public showWelcome(): Boolean {
  //   return (
  //     this.showWelcomePage &&
  //     !this.inAssessment &&
  //     !this.allAssessmentsCompleted
  //   );
  // }

  // public setStartButton(set: boolean): void {
  //   this.startButton = set;
  // }

  // public showStartButton(): boolean {
  //   return this.startButton;
  // }

  // public setSplashPage(set: boolean): void {
  //   this.splashPage = set;
  // }

  // public showSplashPage(): boolean {
  //   return this.splashPage;
  // }

  // public showInitialSplashPage(assessment: string): Boolean {
  //   return (
  //     this.currentAssessment === assessment &&
  //     !this.isAssessmentCompleted(assessment)
  //   );
  // }

  // public doRedirectBackToStart(): Boolean {
  //   return this.showWelcome() && !this.showButton(); // If you come to an assessment just from the browser with the URL
  // }
}
