import { StateManagerService } from '../services/state-manager.service';
import { OnInit } from '@angular/core';
import { AssessmentDataService } from '../services/assessment-data.service';
import { AssetsObject } from './AssessmentDataStructures';
/**
 * The most basic assessment type. For our purposes so far we have only extended [[AudioAssessment]] and [[SelectionAssessment]].
 * Unless you need to create a different type assessment than those two, you don't need to use this class directly.
 */
export class BaseAssessment implements OnInit {
  private _assetType: string;
  private _assessmentName: string;
  private _countingDown = false;
  private _intervalCountdown: NodeJS.Timeout;
  private _timeLeftConfig: number | Array<number>;
  private _timeLeft: number;
  private _doneCountingDown = false;
  private _showExample = true;
  private _showProgressAnimation = false;
  private _countdownTimerType: string;
  private _useCountdownBar: boolean;
  private _useCountdownNumber: boolean;
  private _useCountdownCircle: boolean;
  private _showCircleAnimation: boolean;
  private _lastPromptWaitTime: number;
  private _promptNumber = 0;
  private _promptsLength: number;
  private _lastPrompt = false;
  private _promptsToDo = new Array<number>();
  private _firstPrompt : boolean;
  private _waitToDeterminePromptsToDo:boolean;
  private _promptsDoneCount=0;
  private _finishEarly=false;
  private _dataTitle;

  public get dataTitle():string {
    return this._dataTitle;
  }
  public set dataTitle(value: string ) {
    this._dataTitle = value;
  }
  public get finishEarly():boolean {
    return this._finishEarly;
  }
  public set finishEarly(value: boolean ) {
    this._finishEarly = value;
  }
  public get promptsDoneCount(): number {
    return this._promptsDoneCount;
  }
  public set promptsDoneCount(value: number) {
    this._promptsDoneCount = value;
  }
  public get waitToDeterminePromptsToDo():boolean {
    return this._waitToDeterminePromptsToDo;
  }
  public set waitToDeterminePromptsToDo(value: boolean ) {
    this._waitToDeterminePromptsToDo = value;
  }
  public get firstPrompt():boolean {
    return this._firstPrompt;
  }
  public set firstPrompt(value: boolean ) {
    this._firstPrompt = value;
  }
  public get promptsToDo(): Array<number> {
    return this._promptsToDo;
  }
  public set promptsToDo(value: Array<number> ) {
    this._promptsToDo = value;
  }
  public get lastPrompt(): boolean {
    return this._lastPrompt;
  }
  public set lastPrompt(value: boolean) {
    this._lastPrompt = value;
  }
  public get promptsLength(): number {
    return this._promptsLength;
  }
  public set promptsLength(value: number) {
    this._promptsLength = value;
  }
  public get promptNumber(): number {
    return this._promptNumber;
  }
  public set promptNumber(value: number) {
    this._promptNumber = value;
  }
  public get lastPromptWaitTime(): number {
    return this._lastPromptWaitTime;
  }
  public set lastPromptWaitTime(value: number) {
    this._lastPromptWaitTime = value;
  }
  public get showCircleAnimation(): boolean {
    return this._showCircleAnimation;
  }
  public set showCircleAnimation(value: boolean) {
    this._showCircleAnimation = value;
  }
  public get useCountdownBar(): boolean {
    return this._useCountdownBar;
  }
  public set useCountdownBar(value: boolean) {
    this._useCountdownBar = value;
  }
  public get useCountdownNumber(): boolean {
    return this._useCountdownNumber;
  }
  public set useCountdownNumber(value: boolean) {
    this._useCountdownNumber = value;
  }
  public get useCountdownCircle(): boolean {
    return this._useCountdownCircle;
  }
  public set useCountdownCircle(value: boolean) {
    this._useCountdownCircle = value;
  }
  public get countdownTimerType(): string {
    return this._countdownTimerType;
  }
  public set countdownTimerType(value: string) {
    this._countdownTimerType = value;
  }
  public get timeLeftConfig(): number | Array<number> {
    return this._timeLeftConfig;
  }
  public set timeLeftConfig(value: number | Array<number>) {
    this._timeLeftConfig = value;
  }
  public get showProgressAnimation(): boolean {
    return this._showProgressAnimation;
  }
  public set showProgressAnimation(value: boolean) {
    this._showProgressAnimation = value;
  }
  public get assetType(): string {
    return this._assetType;
  }
  public set assetType(value: string) {
    this._assetType = value;
  }
  public get assessmentName(): string {
    return this._assessmentName;
  }
  public set assessmentName(value: string) {
    this._assessmentName = value;
  }
  public get countingDown(): boolean {
    return this._countingDown;
  }
  public set countingDown(value: boolean) {
    this._countingDown = value;
  }
  public get intervalCountdown(): NodeJS.Timeout {
    return this._intervalCountdown;
  }
  public set intervalCountdown(value: NodeJS.Timeout) {
    this._intervalCountdown = value;
  }
  public get timeLeft(): number {
    return this._timeLeft;
  }
  public set timeLeft(value: number) {
    this._timeLeft = value;
  }
  public get doneCountingDown(): boolean {
    return this._doneCountingDown;
  }
  public set doneCountingDown(value: boolean) {
    this._doneCountingDown = value;
  }
  public get showExample(): boolean {
    return this._showExample;
  }
  public set showExample(value: boolean) {
    this._showExample = value;
  }

  constructor(
    public stateManager: StateManagerService,
    public dataService: AssessmentDataService
  ) {
    this.stateManager.showOutsideAssessmentButton = false;
  }

  ngOnInit(): void {
    this.stateManager.sendToCurrentIfAlreadyCompleted(this.assessmentName);
    this.firstPrompt = this.stateManager.assessments[this.assessmentName]["promptsDone"].length == 0
    
    this.dataService
      .getAssets('audio', this.assessmentName)
      .subscribe((value: AssetsObject) => {
        this.stateManager.audioInstruction = value.audioInstruction;
        if (!this.stateManager.IOSSafari) {
          this.stateManager.playInstructions();
        }
      });
    
      //this is set in the actual assessment .ts files if they request asssets from the server and need to wait to get the promtNumber count
    if (!this.waitToDeterminePromptsToDo){this.determinePromptsToDo();}
    
  }
  public determinePromptsToDo(){
    const doneList =this.stateManager.assessments[this.assessmentName]["promptsDone"]
    for (let i = 0; i < this.promptsLength; i++){
      if (!doneList.includes(i)){
        this.promptsToDo.push(i);
        
      }
      else{this.promptsDoneCount++;}
    }
    this.determineNextPromptNumber();
  }
  determineNextPromptNumber(currentPrompt? :number): void {
    if (currentPrompt || currentPrompt==0){
      this.promptsToDo = this.promptsToDo.filter(i =>  i != currentPrompt)
      this.promptsLength--;
      this.promptsDoneCount++;
    }
    const maxPrompts = this.stateManager.appConfig['appConfig']['assessmentsConfig'][this.assessmentName]["maxPrompts"];
   
    if (maxPrompts<=this.promptsDoneCount && maxPrompts!=0){
      this.promptsToDo=[];
    }
  
    if (this.stateManager.appConfig['appConfig']['assessmentsConfig'][this.assessmentName]["randomize"]){
      this.promptNumber = (this.promptsToDo[Math.floor(Math.random()*this.promptsToDo.length)])
    }
    else {this.promptNumber = this.promptsToDo[0];}
   
    if ((maxPrompts-1)==this.promptsDoneCount){
        this.finishEarly=true;
      }
    }



  startDisplayedCountdownTimer(onCountdownEndCallback: Function): void {
    this.countingDown = true;
    this.lastPromptWaitTime = this.timeLeft;
    this.intervalCountdown = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timeLeft = this.getProgressIntervalFromConfig();
        this.countingDown = false;
        this.doneCountingDown = true;
        onCountdownEndCallback();
        clearInterval(this.intervalCountdown);
      }
    }, 1000);
  }

  showProgressBar(onProgressEndCallback: Function): void {
    this.countingDown = true;
    this.showProgressAnimation = true;
    this.lastPromptWaitTime = this.timeLeft;
    this.intervalCountdown = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timeLeft = this.getProgressIntervalFromConfig();
        this.countingDown = false;
        this.doneCountingDown = true;
        this.showProgressAnimation = false;
        onProgressEndCallback();
        clearInterval(this.intervalCountdown);
      }
    }, 1000);
  }

  showProgressCircle(onProgressEndCallback: Function): void {
    this.countingDown = true;
    this.showCircleAnimation = true;
    this.lastPromptWaitTime = this.timeLeft;
    this.intervalCountdown = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timeLeft = this.getProgressIntervalFromConfig();
        this.countingDown = false;
        this.doneCountingDown = true;
        this.showCircleAnimation = false;
        onProgressEndCallback();
        clearInterval(this.intervalCountdown);
      }
    }, 1000);
  }

  getProgressIntervalFromConfig(): number {
    if (this.timeLeftConfig instanceof Array) {
      return this.timeLeftConfig[
        Math.floor(Math.random() * this.timeLeftConfig.length)
      ];
    } else {
      return this.timeLeftConfig;
    }
  }

  finishAssessment(): void {
    this.stateManager.finishThisAssessmentAndAdvance(this.assessmentName);
  }
  fixDataTitle(){
    if (this.dataTitle && ((typeof this.dataTitle)==='string')){
      const specify = this.dataTitle.split('/')
      this.dataTitle=specify[specify.length-1];
      this.dataTitle=this.dataTitle.split('.')[0]
    }
  }

  configureAssessmentSettings(): void {
    if (
      !this.stateManager.appConfig['appConfig']['assessmentsConfig'][
      this.assessmentName
      ]['prompt_countdowns']
    ) {
      this.timeLeftConfig = this.stateManager.appConfig['appConfig'][
        'settings'
      ]['countdownTimerLength'];
    } else {
      this.timeLeftConfig = this.stateManager.appConfig['appConfig'][
        'assessmentsConfig'
      ][this.assessmentName]['prompt_countdowns'];
    }
    this.timeLeft = this.getProgressIntervalFromConfig();
    this.lastPromptWaitTime = this.timeLeft;
    this.countdownTimerType = this.stateManager.appConfig['appConfig'][ // KRM: Get a random number to start with if we provide an array
      'settings'
    ]['countdownTimerType'];
    if (this.countdownTimerType === 'bar') {
      this.useCountdownBar = true;
    } else if (this.countdownTimerType === 'number') {
      this.useCountdownNumber = true;
    } else if (this.countdownTimerType === 'circle') {
      this.useCountdownCircle = true;
    }
  }
}
