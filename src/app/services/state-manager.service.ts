import { Injectable, OnInit } from '@angular/core';
import {
  AssessmentData,
  AssessmentDataStructure
} from '../structures/assessmentdata';
import { AssessmentDataService } from './assessment-data.service';
import { Router } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { UserIdObject } from '../structures/useridobject';

@Injectable({
  providedIn: 'root'
})
export class StateManagerService {
  private _DEBUG_MODE = true; // KRM: FOR DEBUGGING ONLY. GIVES DEBUG BUTTONS IN ASSESSMENTS
  private _isInAssessment = false;
  private _showAssessmentFrontPage = true;
  private _showInnerAssessmentButton = true;
  private _currentAssessment: string;
  private _finishedAllAssessments = false;
  private _showOutsideAssessmentButton = true;
  private _textOnOutsideAssessmentButton = 'START ASSESSMENTS';
  private _textOnInnerAssessmentButton = 'START ASSESSMENT';
  constructor(private routerService: Router) {}

  public get isInAssessment(): boolean {
    return this._isInAssessment;
  }
  public set isInAssessment(value: boolean) {
    this._isInAssessment = value;
  }
  public get textOnInnerAssessmentButton(): string {
    return this._textOnInnerAssessmentButton;
  }
  public set textOnInnerAssessmentButton(value: string) {
    this._textOnInnerAssessmentButton = value;
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
  public get showInnerAssessmentButton(): boolean {
    return this._showInnerAssessmentButton;
  }
  public set showInnerAssessmentButton(value: boolean) {
    this._showInnerAssessmentButton = value;
  }
  public get showAssessmentFrontPage(): boolean {
    return this._showAssessmentFrontPage;
  }
  public set showAssessmentFrontPage(value: boolean) {
    this._showAssessmentFrontPage = value;
  }
  public get showContinueOutsideAssessmentButton(): boolean {
    return this._showOutsideAssessmentButton;
  }
  public set showContinueOutsideAssessmentButton(value: boolean) {
    this._showOutsideAssessmentButton = value;
  }
  public get textOnContinueOutsideAssessmentButton(): string {
    return this._textOnOutsideAssessmentButton;
  }
  public set textOnContinueOutsideAssessmentButton(value: string) {
    this._textOnOutsideAssessmentButton = value;
  }

  assessments = [
    // KRM: Load assessment data into here
    {
      assess_name: 'prescreenerquestions',
      completed: false
    },
    {
      assess_name: 'wordfinding',
      prompt_number: 0,
      completed: false
    },
    {
      assess_name: 'sentencerepetition',
      prompt_number: 0,
      completed: false
    },
    {
      assess_name: 'matrixreasoning',
      completed: false
    },
    {
      assess_name: 'syncvoice',
      completed: false
    },
    {
      assess_name: 'timeduration',
      completed: false
    },
    {
      assess_name: 'ran',
      completed: false
    },
    {
      assess_name: 'pictureprompt',
      completed: false
    },
    {
      assess_name: 'listeningcomprehension',
      completed: false
    },
    {
      assess_name: 'postscreenerquestions',
      completed: false
    }
  ];

  public printAllCompletedAssessments(): void {
    this.assessments.forEach(value => console.log(value));
  }

  public initializeState(existingAssessmentData: AssessmentData): void {
    for (const existingAssessment of existingAssessmentData.assessments) {
      const existingAssessmentName = existingAssessment['assess_name'];
      for (const assessmentRecord of this.assessments) {
        if (assessmentRecord['assess_name'] === existingAssessmentName && existingAssessment['completed'] === true) {
          assessmentRecord['completed'] = true;
          console.log('Already completed: ' + existingAssessmentName);
          break;
        } else {
          const currentPromptNumber = this.determineCurrentRecordingPromptNumber(existingAssessment['data']['recorded_data']);
          assessmentRecord['prompt_number'] = currentPromptNumber;
        }
      }
    }
    this.currentAssessment = this.determineNextAssessment();
  }

  private determineCurrentRecordingPromptNumber(recordedData: Array<Object>): number {
    const latestEntryIndex = recordedData.length - 1;
    console.log(recordedData[latestEntryIndex]['prompt_number'] + 1);
    return recordedData[latestEntryIndex]['prompt_number'] + 1;
  }

  private determineNextAssessment(): string {
    for (const assessmentState of this.assessments) {
      if (!assessmentState['completed']) {
        console.log('Next not completed: ' + assessmentState['assess_name']); // KRM: Debugging
        return assessmentState['assess_name'];
      }
    }
    this.finishedAllAssessments = true;
    return 'done';
    // Done is the name of the route for the completion component
  }

  public goToNextAssessment(): void {
    this.currentAssessment = this.determineNextAssessment();
    console.log('Going to: ' + this.currentAssessment); // KRM: For debugging
    this.navigateTo(this.currentAssessment);
  }

  public navigateTo(assessmentName: string): void {
    this.showAssessmentFrontPage = true;
    this.showContinueOutsideAssessmentButton = false;
    this.showInnerAssessmentButton = true;
    this.routerService.navigate(['/assessments/', assessmentName]);
  }

  public get DEBUG_MODE(): boolean {
    return this._DEBUG_MODE;
  }
  public set DEBUG_MODE(value: boolean) {
    this._DEBUG_MODE = value;
  }

  public nextAssessmentDebugMode(): void {
    if (this.DEBUG_MODE) {
      this.finishThisAssessmentAndAdvance(this.currentAssessment);
    }
  }

  private markAssessmentCompleted(assessmentName: string): void {
    for (const assessment of this.assessments) {
      if (assessment['assess_name'] === assessmentName) {
        assessment['completed'] = true;
      }
    }
  }

  public finishThisAssessmentAndAdvance(assessment: string): void {
    this.isInAssessment = false;
    this.markAssessmentCompleted(assessment);
    this.textOnInnerAssessmentButton = 'START ASSESSMENT';
    this.goToNextAssessment();
  }
}
