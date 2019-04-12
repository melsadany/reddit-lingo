import { StateManagerService } from '../services/state-manager.service';

/**
 * The most basic assessment type. For our purposes so far we have only extended [[AudioAssessment]] and [[SelectionAssessment]].
 * Unless you need to create a different type assessment than those two, you don't need to use this class directly.
 */
export class BaseAssessment {
  private _assetType: string;
  private _assessmentName: string;
  private _countingDown = false;
  private _intervalCountdown: NodeJS.Timeout;
  private _timeLeftConfig: number;
  private _timeLeft: number;
  private _doneCountingDown = false;
  private _showExample = true;
  private _showProgressAnimation = false;
  private _countdownTimerType: string;
  private _useCountdownBar: boolean;
  private _useCountdownNumber: boolean;
  private _useCountdownCircle: boolean;
  private _showCircleAnimation: boolean;

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
  public get timeLeftConfig(): number {
    return this._timeLeftConfig;
  }
  public set timeLeftConfig(value: number) {
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

  constructor(public stateManager: StateManagerService) {
    this.stateManager.showOutsideAssessmentButton = false;
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
    this.timeLeft = this.timeLeftConfig;
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

  startDisplayedCountdownTimer(onCountdownEndCallback: Function): void {
    this.countingDown = true;
    this.intervalCountdown = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timeLeft = 3;
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
    this.intervalCountdown = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timeLeft = this.timeLeftConfig;
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
    this.intervalCountdown = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timeLeft = this.timeLeftConfig;
        this.countingDown = false;
        this.doneCountingDown = true;
        this.showCircleAnimation = false;
        onProgressEndCallback();
        clearInterval(this.intervalCountdown);
      }
    }, 1000);
  }

  finishAssessment(): void {
    this.stateManager.finishThisAssessmentAndAdvance(this.assessmentName);
  }
}
