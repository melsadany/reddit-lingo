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
  private _timeLeft = 3;
  private _doneCountingDown = false;
  private _showExample = true;
  private _audioInstruction: string;
  private _playingInstruction = false;
  private _audioInstructionPlayer: HTMLAudioElement;

  public get audioInstructionPlayer(): HTMLAudioElement {
    return this._audioInstructionPlayer;
  }
  public set audioInstructionPlayer(value: HTMLAudioElement) {
    this._audioInstructionPlayer = value;
  }
  public get playingInstruction(): boolean {
    return this._playingInstruction;
  }
  public set playingInstruction(value: boolean) {
    this._playingInstruction = value;
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

  constructor(public stateManager: StateManagerService) {
    this.stateManager.showOutsideAssessmentButton = false;
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

  playInstructions(): void {
    this.audioInstructionPlayer = new Audio();
    this.audioInstructionPlayer.src = this.audioInstruction;
    this.audioInstructionPlayer.onplaying = (ev: Event): any =>
      (this.playingInstruction = true);
    this.audioInstructionPlayer.addEventListener('ended', () => {
      this.playingInstruction = false;
    });
    this.audioInstructionPlayer.play();
  }

  finishAssessment(): void {
    this.stateManager.finishThisAssessmentAndAdvance(this.assessmentName);
  }
}
