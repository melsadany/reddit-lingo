import { Component, OnInit, OnDestroy } from '@angular/core';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import {
  AudioRecordingService,
  RecordedAudioOutput
} from '../../../services/audio-recording.service';
import { Subscription } from 'rxjs';
import { DialogService } from '../../../services/dialog.service';
import { CanComponentDeactivate } from '../../../guards/can-deactivate.guard';

@Component({
  selector: 'app-syncvoice',
  templateUrl: './syncvoice.component.html',
  styleUrls: ['./syncvoice.component.scss']
})
export class SyncvoiceComponent implements OnInit, OnDestroy, CanComponentDeactivate {
  constructor(
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
  startedAssessment = false;
  countingDown = false;
  splashPage = true;
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
  showStartButton = true;
  showRecordingIcon = false;

  ngOnInit(): void {
    this.calculateAudioFilePaths();
  }

  ngOnDestroy(): void {
    this.abortRecording();
    this.failSubscription.unsubscribe();
    this.recordingTimeSubscription.unsubscribe();
    this.recordedOutputSubscription.unsubscribe();
    this.dataService.goTo('');
  }

  calculateAudioFilePaths(): void {
    for (let i = 0; i < this.audioNames.length; i++) {
      this.audioNames[i] = this.lalaLocations + this.audioNames[i];
    }
  }

  startDisplayedCountdownTimer(): void {
    this.startedAssessment = true;
    this.countingDown = true;
    if (this.splashPage) {
      this.splashPage = false;
    }
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
      this.showRecordingIcon = true;
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
      this.showRecordingIcon = false;
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
      this.showStartButton = true;
      console.log(this.recordedData);
    };
  }

  nextLalaPrompt(): void {
    if (!this.startedAssessment) {
      this.startedAssessment = true;
      this.dataService.setIsInAssessment(true);
    }
    if (this.promptNumber < this.audioNames.length) {
      this.splashPage = true;
      const audio = new Audio();
      audio.src = this.audioNames[this.promptNumber];
      audio.addEventListener('ended', () =>
        this.startDisplayedCountdownTimer()
      );
      audio.play();
      this.showStartButton = false;
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
    this.dataService.setCookie('syncvoice', 'completed', 200);
    this.dataService.setIsInAssessment(false);
  }
  canDeactivate(): boolean {
    return this.dialogService.canRedirect();
  }
}
