import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import {
  AudioRecordingService,
  RecordedAudioOutput
} from '../../../services/audio-recording.service';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import { Subscription } from 'rxjs';
import { DialogService } from '../../../services/dialog.service';
import { CanComponentDeactivate } from '../../../guards/can-deactivate.guard';
import { StateManagerService } from '../../../services/state-manager.service';

@Component({
  selector: 'app-ran',
  templateUrl: './ran.component.html',
  styleUrls: ['./ran.component.scss']
})
export class RanComponent implements OnInit, OnDestroy, CanComponentDeactivate {
  isRecording = false;
  recordedTime: string;
  recordedBlob: Blob;
  recordedBlobAsBase64: ArrayBuffer | string;
  intervalCountdown: NodeJS.Timer;
  intervalCountup: NodeJS.Timer;
  countingDown = false;
  doneCountingDown = false;
  showImage = false;
  doneRecording = false;
  timeLeft = 3;
  failSubscription: Subscription;
  recordingTimeSubscription: Subscription;
  recordedOutputSubscription: Subscription;
  completed = false;

  constructor(
    public stateManager: StateManagerService,
    public audioRecordingService: AudioRecordingService,
    private dataService: AssessmentDataService,
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

  startRecording(): void {
    if (!this.isRecording) {
      this.isRecording = true;
      this.audioRecordingService.startRecording();
      this.intervalCountup = setTimeout(() => {
        this.stopRecording();
      }, 30000);
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
      this.showImage = false;
      this.completed = true;
      this.stateManager.showInnerAssessmentButton = true;
      clearTimeout(this.intervalCountup);
    }
  }

  ngOnDestroy(): void {
    this.abortRecording();
    this.failSubscription.unsubscribe();
    this.recordingTimeSubscription.unsubscribe();
    this.recordedOutputSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.stateManager.showOutsideAssessmentButton = false;
  }

  setStateAndStart(): void {
    this.stateManager.showInnerAssessmentButton = false;
    this.stateManager.textOnInnerAssessmentButton =
      'FINISH ASSESSMENT AND ADVANCE';
    this.stateManager.isInAssessment = true;
    this.startDisplayedCountdownTimer();
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
        this.showImage = true;
        this.startRecording();
        clearInterval(this.intervalCountdown);
      }
    }, 1000);
  }

  handleRecordedOutput(data: RecordedAudioOutput): void {
    this.recordedBlob = data.blob;
    const reader: FileReader = new FileReader();
    reader.readAsDataURL(this.recordedBlob);
    reader.onloadend = (): any => {
      this.recordedBlobAsBase64 = reader.result.slice(22);
      this.dataService
        .postAssessmentDataToFileSystem(
          {
            assess_name: 'ran',
            data: { recorded_data: this.recordedBlobAsBase64 },
            completed: true
          },
          {
            assess_name: 'ran',
            data: {
              text: 'Fake speech to text'
            }
          }
        )
        .subscribe(); // KRN: Fix how this output is handled to be updated like other assessments
    };
  }

  finishAssessment(): void {
    this.stateManager.finishThisAssessmentAndAdvance('ran');
  }

  canDeactivate(): boolean {
    return this.dialogService.canRedirect();
  }
}
