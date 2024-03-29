import { BaseAssessment } from './BaseAssessment';
import { StateManagerService } from '../services/state-manager.service';
import {
  RecordedAudioOutput,
  AudioRecordingService
} from '../services/audio-recording.service';
import { AssessmentDataService } from '../services/assessment-data.service';
import { Subscription } from 'rxjs';
import { OnDestroy } from '@angular/core';

/**
 * Class used for creating new assessments which will use audio recording
 */
export class AudioAssessment extends BaseAssessment implements OnDestroy {
  private _recordedOutputSubscription: Subscription;
  private _recordedTime: string;
  private _recordingTimeSubscription: Subscription;
  private _failSubscription: Subscription;
  private _doneRecording: boolean;
  private _recordedData: Object[] = [];
  private _intervalCountup: NodeJS.Timeout;
  private _isRecording = false;
  private _micStatus : boolean | string;

  public set micStatus(value: boolean | string){
    this._micStatus=value
  }
  public get micStatus(): boolean | string{
    return this._micStatus
  }
  public get isRecording(): boolean {
    return this._isRecording;
  }
  public set isRecording(value: boolean) {
    this._isRecording = value;
  }
  public get recordedData(): Array<Object> {
    return this._recordedData;
  }
  public set recordedData(value: Array<Object>) {
    this._recordedData = value;
  }
  public get intervalCountup(): NodeJS.Timeout {
    return this._intervalCountup;
  }
  public set intervalCountup(value: NodeJS.Timeout) {
    this._intervalCountup = value;
  }
  public get doneRecording(): boolean {
    return this._doneRecording;
  }
  public set doneRecording(value: boolean) {
    this._doneRecording = value;
  }
  public get failSubscription(): Subscription {
    return this._failSubscription;
  }
  public set failSubscription(value: Subscription) {
    this._failSubscription = value;
  }
  public get recordingTimeSubscription(): Subscription {
    return this._recordingTimeSubscription;
  }
  public set recordingTimeSubscription(value: Subscription) {
    this._recordingTimeSubscription = value;
  }
  public get recordedTime(): string {
    return this._recordedTime;
  }
  public set recordedTime(value: string) {
    this._recordedTime = value;
  }
  public get recordedOutputSubscription(): Subscription {
    return this._recordedOutputSubscription;
  }
  public set recordedOutputSubscription(value: Subscription) {
    this._recordedOutputSubscription = value;
  }

  constructor(
    public stateManager: StateManagerService,
    public audioRecordingService: AudioRecordingService,
    public dataService: AssessmentDataService
  ) {
    super(stateManager, dataService);
    this.failSubscription = this.audioRecordingService
      .recordingFailed()
      .subscribe(() => {
        this.isRecording = false;
      });

    this.recordingTimeSubscription = this.audioRecordingService
      .getRecordedTime()
      .subscribe(time => {
        this.recordedTime = time;
      });

    this.recordedOutputSubscription = this.audioRecordingService
      .getRecordedBlob()
      .subscribe(data => {
        this.handleRecordedOutput(data);
      });
  }

  ngOnDestroy(): void {
    if (!this.stateManager.finishedInstruction && !this.stateManager.audioInstructionPlayer.paused) {
      console.log('Audio pausing');
      this.stateManager.audioInstructionPlayer.pause();
    }
    this.abortRecording();
    this.failSubscription.unsubscribe();
    this.recordingTimeSubscription.unsubscribe();
    this.recordedOutputSubscription.unsubscribe();
    clearInterval(this.intervalCountdown);
    clearTimeout(this.intervalCountup);
  }

  handleRecordedOutput(data: RecordedAudioOutput): void {
    const currentBlob = data.blob;
    const reader: FileReader = new FileReader();
    this.fixDataTitle();
    reader.readAsDataURL(currentBlob);
    reader.onloadend = (): any => {
      const currentRecordedBlobAsBase64 = reader.result.slice(22);
      const pushObject = {
        prompt_number: this.promptNumber,
        recorded_data: currentRecordedBlobAsBase64,
        wait_time: this.lastPromptWaitTime,
        dataGiven: this.dataTitle ? this.dataTitle : null,
        failed: this.audioRecordingService.blobSize<45 ? true : false
      };
      if (this.assessmentName === 'ran') {
        pushObject['recorded_time'] = this.recordedTime;
      }
      this.recordedData.push(pushObject); // KRM: Adding recording to the array is done in sync. Currently wait for the recording to load.
      // Might be better to do this async so we don't have the chance of blocking for a short
      // period before moving to the next prompt.
      this.pushAudioData();
      this.determineNextPromptNumber(this.promptNumber);
      // this.advanceToNextPrompt();  KRM: For automatic advancement
    };
  }

  pushAudioData(): void {
    const assessmentData = {
      assess_name: this.assessmentName,
      data: { recorded_data: this.recordedData },
      completed: this.lastPrompt
    };
    const assessmentGoogleData = {
      assess_name: this.assessmentName,
      data: { text: 'None' }
    };
    if (this.firstPrompt) {
      this.dataService
        .postAssessmentDataToFileSystem(assessmentData, assessmentGoogleData)
        .subscribe();
        this.firstPrompt=false;
    } else {
      this.dataService
        .postSingleAudioDataToMongo(assessmentData, assessmentGoogleData)
        .subscribe();
    }
    this.recordedData = [];
  }

  startRecording(
    recordingTimerInMiliSeconds: number,
    onDoneRecordingCallback: Function
  ): void {
    if (!this.isRecording) {
      
      if(this.micStatus!="failed"){
        this.isRecording = true
        this.audioRecordingService.startRecording(this.micStatus)
        this.intervalCountup = setTimeout(() => {
                this.stopRecording(() => onDoneRecordingCallback());
              }, recordingTimerInMiliSeconds);
      }
    }
  }

  stopRecording(onDoneRecordingCallback: Function): void {
    if (this.isRecording) {
      this.audioRecordingService.stopRecording();
      this.isRecording = false;
      this.doneRecording = true;
      onDoneRecordingCallback();
      this.stateManager.showInnerAssessmentButton = true;
      clearTimeout(this.intervalCountup);
    }
  }

  abortRecording(): void {
    if (this.isRecording) {
      this.isRecording = false;
      this.audioRecordingService.abortRecording();
      this.doneRecording = true;
    }
  }

  advanceToNextPrompt(
    afterAdvanceCallBack: Function,
    beforeAdvanceCall?: Function
  ): void {
    let countdownFunction: Function;
    if (this.useCountdownNumber) {
      countdownFunction = (arg): void => this.startDisplayedCountdownTimer(arg);
    } else if (this.useCountdownBar) {
      countdownFunction = (arg): void => this.showProgressBar(arg);
    } else if (this.useCountdownCircle) {
      countdownFunction = (arg): void => this.showProgressCircle(arg);
    }
    if (this.promptsToDo.length>0) {
      if (this.promptsToDo.length==1 || this.finishEarly) {
        this.lastPrompt = true;
        this.stateManager.textOnInnerAssessmentButton =
          'FINISH ASSESSMENT AND ADVANCE';
      }
      if (this.stateManager.appConfig['appConfig']['assessmentsConfig'][this.assessmentName]['hideInstructionsOnAssessmentStart']) {
        this.stateManager.showStartParagraph = false;
      } 
      this.micStatus=this.audioRecordingService.checkStatus()
        if(this.micStatus=="failed"){
          return 
        }
      if (beforeAdvanceCall) {
        // KRM: This call must return a promise
        beforeAdvanceCall().then(() => {
          countdownFunction(() => afterAdvanceCallBack());
        });
      } else {
        countdownFunction(() => afterAdvanceCallBack());
      }
    } else {
      this.finishAssessment();
    }
  }
}
