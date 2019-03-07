import { Injectable, OnInit } from '@angular/core';
import { AssessmentData } from '../structures/assessmentdata';
import { Router } from '@angular/router';
import { LinkedList } from '../structures/LinkedList';

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
  private _assessmentsLeftLinkedList = new LinkedList<string>();
  private _totalAssessments: number;
  private _loadingState = true;

  constructor(private routerService: Router) {
    this.totalAssessments = Object.keys(this.assessments).length;
  }

  public get loadingState(): boolean {
    return this._loadingState;
  }
  public set loadingState(value: boolean) {
    this._loadingState = value;
  }
  public get assessmentsLeftLinkedList(): LinkedList<string> {
    return this._assessmentsLeftLinkedList;
  }
  public get totalAssessments(): number {
    return this._totalAssessments;
  }
  public set totalAssessments(value: number) {
    this._totalAssessments = value;
  }
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

  assessments = {
    diagnostics: {
      completed: false
    },
    prescreenerquestions: {
      completed: false
    },
    wordfinding: {
      prompt_number: 0,
      completed: false
    },
    sentencerepetition: {
      prompt_number: 0,
      completed: false
    },
    matrixreasoning: {
      prompt_number: 0,
      completed: false
    },
    syncvoice: {
      prompt_number: 0,
      completed: false
    },
    timeduration: {
      prompt_number: 0,
      completed: false
    },
    ran: {
      prompt_number: 0,
      completed: false
    },
    pictureprompt: {
      prompt_number: 0,
      completed: false
    },
    listeningcomprehension: {
      prompt_number: 0,
      completed: false
    },
    postscreenerquestions: {
      completed: false
    }
  };

  public printCurrentAssessmentState(): void {
    for (const assessment of Object.keys(this.assessments)) {
      console.log(this.assessments[assessment]);
    }
  }

  public initializeState(existingAssessmentData: AssessmentData): void {
    for (const existingAssessment of existingAssessmentData.assessments) {
      const existingAssessmentName = existingAssessment['assess_name'];
      if (existingAssessment['completed']) {
        this.assessments[existingAssessmentName]['completed'] = true;
        console.log('Already completed: ' + existingAssessmentName); // KRM: For debugging
      } else if (!existingAssessment['completed']) {
        console.log('Not fully completed: ' + existingAssessmentName); // KRM: For debugging
        let selector = '';
        if (existingAssessment['data']['recorded_data']) {
          selector = 'recorded_data';
        } else if (existingAssessment['data']['selection_data']) {
          selector = 'selection_data';
        }
        const currentPromptNumber = this.determineCurrentPromptNumber(
          existingAssessment['data'][selector]
        );
        this.assessments[existingAssessmentName][
          'prompt_number'
        ] = currentPromptNumber;
        console.log(
          'On prompt number: ' +
            currentPromptNumber +
            ' of ' +
            existingAssessmentName
        ); // KRM: For debugging
      }
    }
    for (const assessmentName of Object.keys(this.assessments)) {
      if (!this.assessments[assessmentName]['completed']) {
        this.assessmentsLeftLinkedList.append(assessmentName);
      }
    }
    this.currentAssessment = this.assessmentsLeftLinkedList.head;
    const initialURL = this.routerService.url;
    const URLSections = initialURL.split('/');
    if (URLSections[1] === 'assessments' && URLSections[2]) {
      this.showOutsideAssessmentButton = false;
    }
    this.loadingState = false;
  }

  private determineCurrentPromptNumber(existingData: Array<Object>): number {
    const latestEntryIndex = existingData.length - 1;
    return existingData[latestEntryIndex]['prompt_number'] + 1;
  }

  private determineNextAssessment(): string {
    this.currentAssessmentNumber =
      this.totalAssessments - this.assessmentsLeftLinkedList.length + 1;
    if (this.assessmentsLeftLinkedList.length > 0) {
      return this.assessmentsLeftLinkedList.head;
    } else {
      this.finishedAllAssessments = true;
      return 'done';
    }
  }

  public goToNextAssessment(): void {
    this.currentAssessment = this.determineNextAssessment();
    this.navigateTo(this.currentAssessment);
  }

  public navigateTo(assessmentName: string): void {
    if (
      assessmentName !== 'done' &&
      this.assessments[assessmentName]['completed']
    ) {
      console.log('Routing to already completed assessment: ' + assessmentName);
      return; // KRM: Do something better here to handle this, but I don't think I would ever call this with
      // an assessment name already completed.
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
    this.assessments[assessmentName]['completed'] = true;
  }

  public finishThisAssessmentAndAdvance(assessment: string): void {
    this.isInAssessment = false;
    this.markAssessmentCompleted(assessment);
    this.assessmentsLeftLinkedList.removeHead();
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

  public sendToCurrentIfAlreadyCompleted(assessmentName: string): void {
    if (this.assessments[assessmentName]['completed']) {
      this.navigateTo(this.currentAssessment);
    }
  }
}
