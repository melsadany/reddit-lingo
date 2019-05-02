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
  private _audioInstruction: string;
  private _audioInstructionPlayer: HTMLAudioElement;
  private _showProgressAnimation = false;
  private _countdownTimerType: string;
  private _useCountdownBar: boolean;
  private _useCountdownNumber: boolean;
  private _useCountdownCircle: boolean;
  private _showCircleAnimation: boolean;
  private _lastPromptWaitTime: number;
  private _finishedInstruction = false;
  private _promptNumber = 0;
  private _promptsLength: number;
  private _lastPrompt = false;
  private _playingInstruction = false;

  public get playingInstruction(): boolean {
    return this._playingInstruction;
  }
  public set playingInstruction(value: boolean) {
    this._playingInstruction = value;
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
  public get finishedInstruction(): boolean {
    return this._finishedInstruction;
  }
  public set finishedInstruction(value: boolean) {
    this._finishedInstruction = value;
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
    this.audioInstructionPlayer = new Audio();
  }

  ngOnInit(): void {
    this.stateManager.sendToCurrentIfAlreadyCompleted(this.assessmentName);
    this.promptNumber = this.stateManager.assessments[this.assessmentName][
      'prompt_number'
    ];
    this.dataService
      .getAssets('audio', this.assessmentName)
      .subscribe((value: AssetsObject) => {
        this.audioInstruction = value.audioInstruction;
        if (!this.stateManager.IOSSafari) {
          this.playInstructions();
        }
      });
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

  playInstructions(): void {
    this.audioInstructionPlayer = new Audio();
    this.audioInstructionPlayer.src = this.audioInstruction;
    this.audioInstructionPlayer.onplaying = (ev: Event): any => {
      this.finishedInstruction = false;
      this.playingInstruction = true;
    };
    this.audioInstructionPlayer.addEventListener('ended', () => {
      this.finishedInstruction = true;
      this.playingInstruction = false;
    });
    this.audioInstructionPlayer.play();
  }

  finishAssessment(): void {
    this.stateManager.finishThisAssessmentAndAdvance(this.assessmentName);
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
