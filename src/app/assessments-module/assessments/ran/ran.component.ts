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
import { BaseAssessment } from '../../../structures/BaseAssessment';

@Component({
  selector: 'app-ran',
  templateUrl: './ran.component.html',
  styleUrls: ['./ran.component.scss']
})
export class RanComponent
  extends BaseAssessment
  implements OnInit, OnDestroy, CanComponentDeactivate {
  assessmentName = 'ran';
  isRecording = false;
  recordedTime: string;
  recordedBlob: Blob;
  recordedBlobAsBase64: ArrayBuffer | string;
  intervalCountup: NodeJS.Timer;
  showImage = false;
  doneRecording = false;
  failSubscription: Subscription;
  recordingTimeSubscription: Subscription;
  recordedOutputSubscription: Subscription;
  completed = false;

  constructor(
    public stateManager: StateManagerService,
    public audioRecordingService: AudioRecordingService,
    private dataService: AssessmentDataService,
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
    clearInterval(this.intervalCountdown);
    clearTimeout(this.intervalCountup);
  }

  ngOnInit(): void {
    this.stateManager.sendToCurrentIfAlreadyCompleted('ran');
  }

  setStateAndStart(): void {
    this.stateManager.showInnerAssessmentButton = false;
    this.stateManager.textOnInnerAssessmentButton =
      'FINISH ASSESSMENT AND ADVANCE';
    this.stateManager.isInAssessment = true;
    this.startDisplayedCountdownTimer(() => {
      this.showImage = true;
      this.startRecording();
    });
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

  // finishAssessment(): void {
  //   this.stateManager.finishThisAssessmentAndAdvance('ran');
  // }

  // canDeactivate(): boolean {
  //   return this.dialogService.canRedirect();
  // }
}
