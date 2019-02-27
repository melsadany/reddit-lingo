import { Injectable, OnInit } from '@angular/core';
import {
  AssessmentData,
  AssessmentDataStructure
} from '../structures/assessmentdata';
import { AssessmentDataService } from './assessment-data.service';
import { Router } from '@angular/router';

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
  private _currentAssessmentNumber = 1;
  constructor(private routerService: Router) {}

  public get currentAssessmentNumber(): number {
    return this._currentAssessmentNumber;
  }
  public set currentAssessmentNumber(value: number) {
    this._currentAssessmentNumber = value;
  }
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
  public get showOutsideAssessmentButton(): boolean {
    return this._showOutsideAssessmentButton;
  }
  public set showOutsideAssessmentButton(value: boolean) {
    this._showOutsideAssessmentButton = value;
  }
  public get textOnOutsideAssessmentButton(): string {
    return this._textOnOutsideAssessmentButton;
  }
  public set textOnOutsideAssessmentButton(value: string) {
    this._textOnOutsideAssessmentButton = value;
  }

  assessments = [
    // KRM: Load assessment data into here
    {
      assess_name: 'diagnostics',
      completed: false
    },
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
      prompt_number: 0,
      completed: false
    },
    {
      assess_name: 'syncvoice',
      prompt_number: 0,
      completed: false
    },
    {
      assess_name: 'timeduration',
      prompt_number: 0,
      completed: false
    },
    {
      assess_name: 'ran',
      completed: false
    },
    {
      assess_name: 'pictureprompt',
      prompt_number: 0,
      completed: false
    },
    {
      assess_name: 'listeningcomprehension',
      prompt_number: 0,
      completed: false
    },
    {
      assess_name: 'postscreenerquestions',
      completed: false
    }
  ];
  totalAssessments: number;

  public printCurrentAssessmentState(): void {
    this.assessments.forEach(value => console.log(value));
  }

  public initializeState(existingAssessmentData: AssessmentData): void {
    this.totalAssessments = this.assessments.length;
    for (const existingAssessment of existingAssessmentData.assessments) {
      const existingAssessmentName = existingAssessment['assess_name'];
      for (const assessmentRecord of this.assessments) {
        if (assessmentRecord['assess_name'] === existingAssessmentName) {
          if (existingAssessment['completed']) {
            assessmentRecord['completed'] = true;
            console.log('Already completed: ' + existingAssessmentName);
            break;
          } else if (!existingAssessment['completed']) {
            console.log('Not fully completed: ' + existingAssessmentName);
            let selector = '';
            if (existingAssessment['data']['recorded_data']) {
              selector = 'recorded_data';
            } else if (existingAssessment['data']['selection_data']) {
              selector = 'selection_data';
            }
            const currentPromptNumber = this.determineCurrentPromptNumber(
              existingAssessment['data'][selector]
            );
            assessmentRecord['prompt_number'] = currentPromptNumber;
            console.log(
              'On prompt number: ' +
                currentPromptNumber +
                ' of ' +
                existingAssessmentName
            );
            break;
          }
        }
      }
    }
    this.currentAssessment = this.determineNextAssessment();
    const initialURL = this.routerService.url;
    const URLSections = initialURL.split('/');
    if (URLSections[1] === 'assessments' && URLSections[2]) {
      this.showOutsideAssessmentButton = false;
    }
  }

  private determineCurrentPromptNumber(existingData: Array<Object>): number {
    const latestEntryIndex = existingData.length - 1;
    return existingData[latestEntryIndex]['prompt_number'] + 1;
  }

  private determineNextAssessment(): string {
    let assessmentNumber = 1;
    for (const assessmentState of this.assessments) {
      if (!assessmentState['completed']) {
        console.log('Next not completed: ' + assessmentState['assess_name']); // KRM: For debugging
        this.currentAssessmentNumber = assessmentNumber;
        return assessmentState['assess_name'];
      } else {
        assessmentNumber++;
      }
    }
    this.finishedAllAssessments = true;
    return 'done';
    // Done is the name of the route for the completion component
  }

  public goToNextAssessment(): void {
    this.currentAssessment = this.determineNextAssessment();
    this.navigateTo(this.currentAssessment);
  }

  public navigateTo(assessmentName: string): void {
    for (const assessmentState of this.assessments) {
      if (
        assessmentName === assessmentState['assess_name'] &&
        assessmentState['completed']
      ) {
        console.log('routing to already completed assessment');
        return; // KRM: Do something better here to handle this
      }
    }
    console.log('Going to: ' + assessmentName); // KRM: For debugging
    this.showAssessmentFrontPage = true;
    this.showOutsideAssessmentButton = false;
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
    this.currentAssessmentNumber++;
    this.textOnInnerAssessmentButton = 'START ASSESSMENT';
    this.goToNextAssessment();
  }

  public translateAssessmentName(assessment: string): string {
    let translatedName;
    switch (assessment) {
      case 'diagnostics':
        translatedName = 'Diagnostics';
        break;
      case 'prescreenerquestions':
        translatedName = 'Pre-screener Questions';
        break;
      case 'wordfinding':
        translatedName = 'Word Finding';
        break;
      case 'sentencerepetition':
        translatedName = 'Sentence Repetition';
        break;
      case 'matrixreasoning':
        translatedName = 'Matrix Reasoning';
        break;
      case 'syncvoice':
        translatedName = 'Sync Voice';
        break;
      case 'timeduration':
        translatedName = 'Time Duration';
        break;
      case 'ran':
        translatedName = 'Ran';
        break;
      case 'pictureprompt':
        translatedName = 'Picture Prompt';
        break;
      case 'listeningcomprehension':
        translatedName = 'Listening Comprehension';
        break;
      case 'postscreenerquestions':
        translatedName = 'Post-screener Questions';
        break;

      default:
        translatedName = 'No name';
        break;
    }
    return translatedName;
  }
}
