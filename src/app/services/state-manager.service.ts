import { Injectable } from '@angular/core';
import { PrescreenerquestionsComponent } from '../assessments-module/assessments/prescreenerquestions/prescreenerquestions.component';
import { AssessmentData } from '../structures/assessmentdata';
import { AssessmentDataService } from './assessment-data.service';

@Injectable({
  providedIn: 'root'
})
export class StateManagerService {
  private _isInAssessment = false;
  private _isAssessmentStarted = false;
  private _showAssessmentFrontPage = true;
  private _showAssessmentStartButton = true;
  private _showInAssessmentContinueButton = false;
  private _currentAssessment: string;
  private _finishedAllAssessments = false;
  private _showContinueOutsideAssessmentButton = true;
  private _textOnContinueOutsideAssessmentButton = 'Continue Assessments';
  constructor(private dataService: AssessmentDataService) {}

  public get isInAssessment(): boolean {
    return this._isInAssessment;
  }
  public set isInAssessment(value: boolean) {
    this._isInAssessment = value;
  }

  public get finishedAllAssessments(): boolean {
    return this._finishedAllAssessments;
  }
  public set finishedAllAssessments(value: boolean) {
    this._finishedAllAssessments = value;
  }

  public get currentAssessment(): string {
    return this._currentAssessment;
  }
  public set currentAssessment(value: string) {
    this._currentAssessment = value;
  }

  public get showInAssessmentContinueButton(): boolean {
    return this._showInAssessmentContinueButton;
  }
  public set showInAssessmentContinueButton(value: boolean) {
    this._showInAssessmentContinueButton = value;
  }

  public get showAssessmentStartButton(): boolean {
    return this._showAssessmentStartButton;
  }
  public set showAssessmentStartButton(value: boolean) {
    this._showAssessmentStartButton = value;
  }

  public get showAssessmentFrontPage(): boolean {
    return this._showAssessmentFrontPage;
  }
  public set showAssessmentFrontPage(value: boolean) {
    this._showAssessmentFrontPage = value;
  }

  public get isAssessmentStarted(): boolean {
    return this._isAssessmentStarted;
  }
  public set isAssessmentStarted(value: boolean) {
    this._isAssessmentStarted = value;
  }
  public get showContinueOutsideAssessmentButton(): boolean {
    return this._showContinueOutsideAssessmentButton;
  }
  public set showContinueOutsideAssessmentButton(value: boolean) {
    this._showContinueOutsideAssessmentButton = value;
  }

  public get textOnContinueOutsideAssessmentButton(): string {
    return this._textOnContinueOutsideAssessmentButton;
  }
  public set textOnContinueOutsideAssessmentButton(value: string) {
    this._textOnContinueOutsideAssessmentButton = value;
  }

  assessments = [
    {
      assessment_name: 'prescreenerquestions',
      completed: false
    },
    {
      assessment_name: 'wordfinding',
      completed: false
    },
    {
      assessment_name: 'sentencerepetition',
      completed: false
    },
    {
      assessment_name: 'matrixreasoning',
      completed: false
    },
    {
      assessment_name: 'syncvoice',
      completed: false
    },
    {
      assessment_name: 'timeduration',
      completed: false
    },
    {
      assessment_name: 'ran',
      completed: false
    },
    {
      assessment_name: 'pictureprompt',
      completed: false
    },
    {
      assessment_name: 'listeningcomprehension',
      completed: false
    },
    {
      assessment_name: 'postscreenerquestions',
      completed: false
    }
  ];

  printAssessments(): void {
    this.assessments.forEach(value => console.log(value));
  }

  initializeState(assessmentsData: AssessmentData): void {
    for (const value of assessmentsData.assessments) {
      console.log(value);
      this.assessments[value.assess_name]['completed'] = true;
      this.populateStateCookies(value.assess_name);
    }
  }

  public populateStateCookies(name: string): void {
    if (!this.dataService.checkCookie(name)) {
      this.dataService.setCookie(name, 'completed', 200);
    }
    if (Object.keys(this.dataService.getAllCookies()).length > 1) {
      this. = 'Continue assessments';
    }
  }
}
