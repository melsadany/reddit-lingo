import { Component, OnInit, OnDestroy } from '@angular/core';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import {
  AudioRecordingService,
  RecordedAudioOutput
} from '../../../services/audio-recording.service';
import { Subscription } from 'rxjs';
import { DialogService } from '../../../services/dialog.service';
import { CanComponentDeactivate } from '../../../guards/can-deactivate.guard';
import { StateManagerService } from '../../../services/state-manager.service';

@Component({
  selector: 'app-syncvoice',
  templateUrl: './syncvoice.component.html',
  styleUrls: ['./syncvoice.component.scss']
})
export class SyncvoiceComponent
  implements OnInit, OnDestroy, CanComponentDeactivate {
  constructor(
    private stateManager: StateManagerService,
    private dataService: AssessmentDataService,
    private audioRecordingService: AudioRecordingService,
    private dialogService: DialogService
  ) {
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

  recordedTime;
  promptNumber = 0;
  lalaLocations = 'assets/audio/syncvoice/';
  textOnButton = 'Start Assessment';
  audioNames = [
    '1_0_half.mp3',
    '1_1_fivequarters.mp3',
    '1_2_one.mp3',
    '1_3_threequarters.mp3'
  ];
  countingDown = false;
  intervalCountdown: NodeJS.Timer;
  intervalCountup: NodeJS.Timer;
  timeLeft = 3;
  doneCountingDown = false;
  isRecording = false;
  recordingNumber = 1;
  failSubscription: Subscription;
  recordingTimeSubscription: Subscription;
  recordedOutputSubscription: Subscription;
  recordedData = [];
  doneRecording = false;

  ngOnInit(): void {}

  setStateAndStart(): void {
    this.stateManager.showInnerAssessmentButton = false;
    this.stateManager.textOnInnerAssessmentButton = 'CONTINUE ASSESSMENT';
    this.stateManager.isInAssessment = true;
    this.calculateAudioFilePaths();
    this.nextLalaPrompt();
  }

  ngOnDestroy(): void {
    this.abortRecording();
    this.failSubscription.unsubscribe();
    this.recordingTimeSubscription.unsubscribe();
    this.recordedOutputSubscription.unsubscribe();
  }

  calculateAudioFilePaths(): void {
    for (let i = 0; i < this.audioNames.length; i++) {
      this.audioNames[i] = this.lalaLocations + this.audioNames[i];
    }
  }

  startDisplayedCountdownTimer(): void {
    this.countingDown = true;
    this.intervalCountdown = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timeLeft = 3;
        this.countingDown = false;
        this.doneCountingDown = true;
        this.startRecording();
        clearInterval(this.intervalCountdown);
      }
    }, 1000);
  }

  startRecording(): void {
    if (!this.isRecording) {
      this.isRecording = true;
      this.audioRecordingService.startRecording();
      this.intervalCountup = setTimeout(() => {
        this.stopRecording();
      }, 10000);
    }
  }

  abortRecording(): void {
    if (this.isRecording) {
      this.isRecording = false;
      this.audioRecordingService.abortRecording();
      this.doneRecording = true;
    }
  }

  stopRecording(): void {
    if (this.isRecording) {
      this.audioRecordingService.stopRecording();
      this.isRecording = false;
      this.doneRecording = true;
      this.stateManager.showInnerAssessmentButton = true;
      clearTimeout(this.intervalCountup);
    }
  }

  handleRecordedOutput(data: RecordedAudioOutput): void {
    const currentBlob = data.blob;
    const reader: FileReader = new FileReader();
    reader.readAsDataURL(currentBlob);
    reader.onloadend = (): any => {
      const currentRecordedBlobAsBase64 = reader.result.slice(22);
      this.recordedData.push({
        prompt_number: this.recordingNumber,
        recorded_data: currentRecordedBlobAsBase64
      }); // KRM: Adding recording to the array is done in sync. Currently wait for the recording to load.
      // Might be btter to do this async so we don't have the chance of blocking for a short
      // period before moving to the next prompt.
      if (this.promptNumber === 0) {
        this.textOnButton = 'Continue'; // KRM: Update the button after the first press prompt finsihes
      }
      this.recordingNumber++;
      this.promptNumber++;
      console.log(this.recordedData);
    };
  }

  nextLalaPrompt(): void {
    if (this.promptNumber < this.audioNames.length) {
      this.stateManager.showInnerAssessmentButton = false;
      const audio = new Audio();
      audio.src = this.audioNames[this.promptNumber];
      audio.addEventListener('ended', () =>
        this.startDisplayedCountdownTimer()
      );
      audio.play();
    } else {
      this.finishAssessment();
    }
  }

  finishAssessment(): void {
    this.dataService
      .postAssessmentDataToMongo(
        {
          assess_name: 'syncvoice',
          data: { recorded_data: this.recordedData },
          completed: true
        },
        {
          assess_name: 'syncvoice',
          data: { text: 'None' }
        }
      )
      .subscribe();
    this.stateManager.finishThisAssessmentAndAdvance('syncvoice');
  }
  canDeactivate(): boolean {
    return this.dialogService.canRedirect();
  }
}
