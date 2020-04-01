import { Injectable } from '@angular/core';
import {
  AssessmentData,
  HashKeyAssessmentData,
  AssetsObject
} from '../structures/AssessmentDataStructures';
import { Router } from '@angular/router';
import { LinkedList } from '../structures/LinkedList';
import appConfig from './assessments_config.json';
import { LingoSettings } from '../structures/LingoSettings';

@Injectable({
  providedIn: 'root'
})
export class StateManagerService {
  private _DEBUG_MODE: boolean; // KRM: FOR DEBUGGING ONLY. GIVES DEBUG BUTTONS IN ASSESSMENTS
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
  private _chromeiOs = false;
  private _appConfig: LingoSettings = appConfig;
  private _assessments = {};
  private _IOSSafari: boolean;
  private _audioInstruction: string;
  private _audioInstructionPlayer: HTMLAudioElement;
  private _finishedInstruction = false;
  private _playingInstruction = false;
  private _showStartParagraph = true;
  private _isSingleAssessment = false;
  private _addHashToJson = false;
  private _hasDoneDiagnostics = false;
  private _contentRandomization = appConfig['appConfig']['settings']['contentRandomization'];
  private _validateUserId= appConfig['appConfig']['settings']['validateUserId'];
  private _endUrl= appConfig['appConfig']['settings']["endUrl"]
  private _hashkeyAsGUID= appConfig['appConfig']['settings']["hashkeyAsGUID"]
  private _completedAssessmentsAlready:boolean;
  private _validateHashWithS3= appConfig['appConfig']['settings']["validateHashWithS3"]
  
  public get validateHashWithS3(): boolean {
    return this._validateHashWithS3;
  }
  public get completedAssessmentsAlready(): boolean {
    return this._completedAssessmentsAlready;
  }
  public set completedAssessmentsAlready(value: boolean) {
    this._completedAssessmentsAlready = value;
  }
  public get endUrl():string{
    return this._endUrl
  }
  public get hashkeyAsGUID():boolean{
    return this._hashkeyAsGUID
  }
  public get validateUserId():string{
    return this._validateUserId
  }
  public get contentRandomization(): boolean {
    return this._contentRandomization;
  }
  public get hasDoneDiagnostics(): boolean {
    return this._hasDoneDiagnostics;
  }
  public set hasDoneDiagnostics(value: boolean) {
    this._hasDoneDiagnostics = value;
  }
  public get showStartParagraph(): boolean {
    return this._showStartParagraph;
  }
  public set showStartParagraph(value: boolean) {
    this._showStartParagraph = value;
  }
  public get addHashToJson(): boolean{
    return this._addHashToJson;
  }
  public set addHashToJson(value :boolean){
    this._addHashToJson = value;
  }
  public get playingInstruction(): boolean {
    return this._playingInstruction;
  }
  public set isSingleAssessment(value: boolean){
    this._isSingleAssessment = value
  }
  public get isSingleAssessment():boolean{
    return this._isSingleAssessment;
  }
  public set playingInstruction(value: boolean) {
    this._playingInstruction = value;
  }
  public get finishedInstruction(): boolean {
    return this._finishedInstruction;
  }
  public set finishedInstruction(value: boolean) {
    this._finishedInstruction = value;
  }
  public get audioInstructionPlayer(): HTMLAudioElement {
    return this._audioInstructionPlayer;
  }
  public set audioInstructionPlayer(value: HTMLAudioElement) {
    this._audioInstructionPlayer = value;
  }
  public get audioInstruction(): string {
    return this._audioInstruction;
  }
  public set audioInstruction(value: string) {
    this._audioInstruction = value;
  }
  public get IOSSafari(): boolean {
    return this._IOSSafari;
  }
  public set IOSSafari(value: boolean) {
    this._IOSSafari = value;
  }
  public get assessments(): Object {
    return this._assessments;
  }
  public set assessments(value: Object) {
    this._assessments = value;
  }
  public get appConfig(): any {
    return this._appConfig;
  }
  public set appConfig(value: any) {
    this._appConfig = value;
  }
  public set chromeiOs(value: boolean) {
    this._chromeiOs = value;
  }
  public get chromeiOs(): boolean {
    return this._chromeiOs;
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

  constructor(private routerService: Router) {
    this.configureEnabledAssessments();
    this.configureDebugMode();
    this.totalAssessments = Object.keys(this.assessments).length;
    this.inMobileBrowser = this.mobileCheck();
    this.audioInstructionPlayer = new Audio();
  }

 
  private configureEnabledAssessments(): void {
    const assessmentsConfig = this.appConfig['appConfig']['assessmentsConfig'];
    for (const assessmentName of Object.keys(assessmentsConfig)) {
      if (assessmentsConfig[assessmentName]['enabled']) {
        this.assessments[assessmentName] = {
          prompt_number: 0,
          promptsDone: new Array<number>(),
          completed: false
        };
        if (assessmentsConfig[assessmentName]['prompt_countdowns']) {
          this.assessments[assessmentName]['prompt_countdowns'] =
            assessmentsConfig[assessmentName]['prompt_countdowns'];
        }
      }
    }
  }

  private configureDebugMode(): void {
    this.DEBUG_MODE = this.appConfig['appConfig']['settings']['debugEnabled'];
  }

  public printCurrentAssessmentState(): void {
    for (const assessment of Object.keys(this.assessments)) {
      console.log(this.assessments[assessment]);
    }
  }
  public serveDiagnostics() {
    this.assessmentsLeftLinkedList.append('diagnostics');
    this.loadingState = false;
  }
  public initializeSingleAssessmentState(
    hashKeyAssessmentData: HashKeyAssessmentData | AssessmentData
  ): void {
    const singleAssessmentName = this.hashKeyFirstFourMap(
      this.hashKey.slice(0, 4)
    );
    for (const existingAssessment of hashKeyAssessmentData.assessments) {
      const existingAssessmentName = existingAssessment['assess_name'];
      if (existingAssessment['completed']) {
        this.assessments[existingAssessmentName]['completed'] = true;
      } else if (!existingAssessment['completed']) {
        // console.log('Not fully completed: ' + existingAssessmentName); KRM: For debugging
        let selector = '';
        if (existingAssessment['data']['recorded_data']) {
          selector = 'recorded_data';
        } else if (existingAssessment['data']['selection_data']) {
          selector = 'selection_data';
        }
        const currentPromptNumber = this.determineCurrentPromptNumber(
          existingAssessment['data'][selector],existingAssessmentName
        );
        this.assessments[existingAssessmentName][
          'prompt_number'
        ] = currentPromptNumber;
        // console.log(
        //   'On prompt number: ' +
        //     currentPromptNumber +
        //     ' of ' +
        //     existingAssessmentName
        // ); KRM: For debugging
      }
    }
    if (this.assessments['diagnostics'] && !this.assessments['diagnostics']['completed']) {
      this.assessmentsLeftLinkedList.append('diagnostics');
    }
    if (this.assessments['prescreenerquestions'] && !this.assessments['prescreenerquestions']['completed']) {
      this.assessmentsLeftLinkedList.append('prescreenerquestions');
    }
    if (this.assessments[singleAssessmentName]['completed']) {
      this.finishedAllAssessments = true;
      this.navigateTo('done');
    } else {
      this.assessmentsLeftLinkedList.append(singleAssessmentName);
    }
    if (this.assessmentsLeftLinkedList.length<2){
      this.assessmentsLeftLinkedList.removeHead()
      this.completedAssessmentsAlready=true;
    }
    this.loadingState = false;
  }

  public initializeState(existingAssessmentData: AssessmentData): void {
    this.configureEnabledAssessments();
    for (const existingAssessment of existingAssessmentData.assessments) {
      const existingAssessmentName = existingAssessment['assess_name'];
      if (existingAssessment['completed']) {
        this.assessments[existingAssessmentName]['completed'] = true;
        // console.log('Already completed: ' + existingAssessmentName); KRM: For debugging
      } else if (!existingAssessment['completed']) {
        // console.log('Not fully completed: ' + existingAssessmentName); KRM: For debugging
        let selector = '';
        if (existingAssessment['data']['recorded_data']) {
          selector = 'recorded_data';
        } else if (existingAssessment['data']['selection_data']) {
          selector = 'selection_data';
        }
        const currentPromptNumber = this.determineCurrentPromptNumber(
          existingAssessment['data'][selector],existingAssessmentName
        );
        //could be the case that the assessment is in existingAssesmentData but not configured anymore; BT
        if (this.assessments[existingAssessmentName]){
        this.assessments[existingAssessmentName][
          'prompt_number'
        ] = currentPromptNumber;}
        // console.log(
        //   'On prompt number: ' +
        //     currentPromptNumber +
        //     ' of ' +
        //     existingAssessmentName
        // ); KRM: For debugging
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
    if (this.assessmentsLeftLinkedList.length<2){
      this.assessmentsLeftLinkedList.removeHead()
      this.completedAssessmentsAlready=true;
    }
  }
  private determineCurrentPromptNumber(existingData: Array<Object>,assess_name:string): number {
    this.createPromptsDone(existingData,assess_name);
    const latestEntryIndex = existingData.length - 1;
    return existingData[latestEntryIndex]['prompt_number'] + 1;
  }

  public createPromptsDone(existingData:Array<Object>,name: string) :void{
    existingData.forEach(element => {
      this.assessments[name]["promptsDone"].push(element["prompt_number"])
    });
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
    this.finishedInstruction = false;
    this.currentAssessment = this.determineNextAssessment();
    this.showStartParagraph = true;
    this.navigateTo(this.currentAssessment);
  }

  public goToNextAssessmentFromHome(): void {
    this.startedByHandFromHome = true;
    this.goToNextAssessment();
  }
  public goToDonePage(): void {
    this.startedByHandFromHome = true;
    this.routerService.navigate(['/assessments/done']);
  }

  playInstructions(): void {
    this.audioInstructionPlayer.src = this.audioInstruction;
    this.audioInstructionPlayer.currentTime = 0;
    this.audioInstructionPlayer.onplaying = (ev: Event): any => {
      this.playingInstruction = true;
    };
    this.audioInstructionPlayer.addEventListener('ended', () => {
      this.finishedInstruction = true;
      this.playingInstruction = false;
    });
    this.audioInstructionPlayer.play();
  }

  public goToHashKeyInitializer(hashKey: string): void {
    this.routerService.navigate(['/' + hashKey]);
  }

  public navigateTo(assessmentName: string): void {
    if (
      assessmentName !== 'done' &&
      this.assessments[assessmentName]['completed'] && assessmentName != "diagnostics"
    ) {
      console.log('Routing to already completed assessment: ' + assessmentName);
      return; // KRM: Do something better here to handle this, but I don't think I would ever call this with
      // an assessment name already completed.
    }
    // console.log('Going to: ' + assessmentName); KRM: For debugging
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
      case 'wordassociationpath':
        translatedName = 'Word Association Path';
        break;
      case 'wordassociationpair':
        translatedName = 'Word Association Pair';
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
  hashKeyFirstFourMap(hashKey: string): string {
    const firstFour = hashKey.slice(0, 4);
    let assessmentName = '';
    switch (firstFour) {
      case 'lic$':
        assessmentName = 'listeningcomprehension';
        break;
      case 'mtx$':
        assessmentName = 'matrixreasoning';
        break;
      case 'pcp$':
        assessmentName = 'pictureprompt';
        break;
      case 'rna$':
        assessmentName = 'ran';
        break;
      case 'snp$':
        assessmentName = 'sentencerepetition';
        break;
      case 'svi$':
        assessmentName = 'syncvoice';
        break;
      case 'tmd$':
        assessmentName = 'timeduration';
        break;
      case 'wap$':
        assessmentName = 'wordassociationpath';
        break;
      case 'wda$':
        assessmentName = 'wordassociationpair';
        break;
      case 'rdf$':
        assessmentName = 'wordfinding';
        break;
      default:
        assessmentName = 'home';
    }
    return assessmentName;
  }

  public sendToCurrentIfAlreadyCompleted(assessmentName: string): boolean {
    if (this.assessments[assessmentName]['completed']) {
      this.navigateTo(this.currentAssessment);
      return true;
    } else {
      return false;
    }
  }

  mobileCheck(): boolean {
    const ua = window.navigator.userAgent;
    const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
    const webkit = !!ua.match(/WebKit/i);
    const iOSSafari = iOS && webkit && !ua.match(/CriOS/i);
    this.IOSSafari = iOSSafari;
    if (navigator.userAgent.match('CriOS')) {
      this.chromeiOs = true;
    }
    let check = false;
    // const currentNavigator = navigator.userAgent || navigator.vendor;
    if (/Mobi|Android/i.test(navigator.userAgent)) {
      check = true;
    }
    return check;
  }
}
