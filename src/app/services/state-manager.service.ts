import { Injectable, OnInit } from '@angular/core';
import {
  AssessmentData,
  SingleAssessmentData
} from '../structures/assessmentdata';
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
  private _inMobileBrowser = false;
  private _hashKey: string;
  private _startedByHandFromHome = false;

  constructor(private routerService: Router) {
    this.totalAssessments = Object.keys(this.assessments).length;
    this.inMobileBrowser = this.mobileCheck();
  }

  public set startedByHandFromHome(value: boolean) {
    this._startedByHandFromHome = value;
  }
  public get startedByHandFromHome(): boolean {
    return this._startedByHandFromHome;
  }
  public get hashKey(): string {
    return this._hashKey;
  }
  public set hashKey(value: string) {
    this._hashKey = value;
  }
  public get inMobileBrowser(): boolean {
    return this._inMobileBrowser;
  }
  public set inMobileBrowser(value: boolean) {
    this._inMobileBrowser = value;
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
    wordassociation: {
      prompt_number: 0,
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

  public initializeSingleAssessmentState(
    singleAssessmentData: SingleAssessmentData
  ): void {
    const singleAssessmentName = this.hashKeyFirstFourMap(
      this.hashKey.slice(0, 4)
    );
    for (const existingAssessment of singleAssessmentData.assessments) {
      const existingAssessmentName = existingAssessment['assess_name'];
      if (existingAssessment['completed']) {
        this.assessments[existingAssessmentName]['completed'] = true;
      }
    }
    if (!this.assessments['diagnostics']['completed']) {
      this.assessmentsLeftLinkedList.append('diagnostics');
    }
    if (!this.assessments['prescreenerquestions']['completed']) {
      this.assessmentsLeftLinkedList.append('prescreenerquestions');
    }
    if (this.assessments[singleAssessmentName]['completed']) {
      this.finishedAllAssessments = true;
      this.navigateTo('done');
    } else {
      this.assessmentsLeftLinkedList.append(singleAssessmentName);
    }
    this.loadingState = false;
    // Remember to set the cookie for hash key over user id
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

  public goToNextAssessmentFromHome(): void {
    this.startedByHandFromHome = true;
    this.goToNextAssessment();
  }

  public goToHashKeyInitializer(hashKey: string): void {
    this.routerService.navigate(['/' + hashKey]);
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

  public goHome(): void {
    this.routerService.navigate(['home']);
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

  // KRM: Update the local assessment structure with the newly completed assessment.
  private markAssessmentCompleted(assessmentName: string): void {
    this.assessments[assessmentName]['completed'] = true;
  }

  // KRM: Close out this assessment and get to the next one on the stack.
  public finishThisAssessmentAndAdvance(assessment: string): void {
    this.isInAssessment = false;
    this.markAssessmentCompleted(assessment);
    this.assessmentsLeftLinkedList.removeHead();
    this.textOnInnerAssessmentButton = 'START ASSESSMENT';
    this.goToNextAssessment();
  }

  // KRM: The current entire URL
  public getCurrentURL(): string {
    return this.routerService.url;
  }

  // KRM: Used for translating the 'in code' name of an assessment to an understandable
  // English version for presenting in the view
  public translateAssessmentName(assessment: string): string {
    let translatedName;
    switch (assessment) {
      case 'diagnostics':
        translatedName = 'Diagnostics';
        break;
      case 'prescreenerquestions':
        translatedName = 'Pre-screener Questions';
        break;
      case 'wordassociation':
        translatedName = 'Word Association';
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

  // KRM: If the hash key has been provided, translate the first four chars to find which
  // assessment has been assigned with that hash key
  hashKeyFirstFourMap(firstFour: string): string {
    let assessmentName = '';
    switch (firstFour) {
      case 'licr':
        assessmentName = 'listeningcomprehension';
        break;
      case 'mtxr':
        assessmentName = 'matrixreasoning';
        break;
      case 'pcpt':
        assessmentName = 'pictureprompt';
        break;
      case 'rnan':
        assessmentName = 'ran';
        break;
      case 'snpt':
        assessmentName = 'sentencerepetition';
        break;
      case 'svie':
        assessmentName = 'syncvoice';
        break;
      case 'tmdt':
        assessmentName = 'timeduration';
        break;
      case 'wdas':
        assessmentName = 'wordassociation';
        break;
      case 'rdfn':
        assessmentName = 'wordfinding';
        break;
      default:
        assessmentName = 'home';
    }
    return assessmentName;
  }

  public sendToCurrentIfAlreadyCompleted(assessmentName: string): void {
    if (this.assessments[assessmentName]['completed']) {
      this.navigateTo(this.currentAssessment);
    }
  }

  mobileCheck(): boolean {
    let check = false;
    const currentNavigator = navigator.userAgent || navigator.vendor;
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        currentNavigator
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        currentNavigator.substr(0, 4)
      )
    ) {
      check = true;
    }
    return check;
  }
}
