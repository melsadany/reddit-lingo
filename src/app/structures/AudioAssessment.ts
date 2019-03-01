import { BaseAssessment } from './BaseAssessment';
import { StateManagerService } from '../services/state-manager.service';
import {
  RecordedAudioOutput,
  AudioRecordingService
} from '../services/audio-recording.service';
import { AssessmentDataService } from '../services/assessment-data.service';
import { DialogService } from '../services/dialog.service';
import { Subscription } from 'rxjs';


export class AudioAssessment extends BaseAssessment {
  isRecording = false;
  recordedData = [];
  intervalCountup: NodeJS.Timeout;
  doneRecording: boolean;
  promptNumber = 0;
  failSubscription: Subscription;
  recordingTimeSubscription: Subscription;
  recordedTime: string;
  recordedOutputSubscription: Subscription;
  lastPrompt = false;

  constructor(
    public stateManager: StateManagerService,
    public audioRecordingService: AudioRecordingService,
    public dataService: AssessmentDataService,
    public dialogService: DialogService
  ) {
    super(stateManager, dialogService);
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

  handleRecordedOutput(data: RecordedAudioOutput): void {
    const currentBlob = data.blob;
    const reader: FileReader = new FileReader();
    reader.readAsDataURL(currentBlob);
    reader.onloadend = (): any => {
      const currentRecordedBlobAsBase64 = reader.result.slice(22);
      this.recordedData.push({
        prompt_number: this.promptNumber,
        recorded_data: currentRecordedBlobAsBase64
      }); // KRM: Adding recording to the array is done in sync. Currently wait for the recording to load.
      // Might be better to do this async so we don't have the chance of blocking for a short
      // period before moving to the next prompt.
      this.pushAudioData();
      this.promptNumber++;
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
    if (this.promptNumber === 0) {
      this.dataService
        .postAssessmentDataToFileSystem(assessmentData, assessmentGoogleData)
        .subscribe();
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
      this.isRecording = true;
      this.audioRecordingService.startRecording();
      this.intervalCountup = setTimeout(() => {
        this.stopRecording(() => onDoneRecordingCallback());
      }, recordingTimerInMiliSeconds);
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
}
