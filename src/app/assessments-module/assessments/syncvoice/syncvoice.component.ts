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
import { BaseAssessment } from '../../../structures/BaseAssessment';

@Component({
  selector: 'app-syncvoice',
  templateUrl: './syncvoice.component.html',
  styleUrls: ['./syncvoice.component.scss']
})
export class SyncvoiceComponent
  extends BaseAssessment
  implements OnInit, OnDestroy, CanComponentDeactivate {
  constructor(
    public stateManager: StateManagerService,
    private dataService: AssessmentDataService,
    public audioRecordingService: AudioRecordingService,
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

  assessmentName = 'syncvoice';
  playingAudio = false;
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
  intervalCountup: NodeJS.Timer;
  isRecording = false;
  failSubscription: Subscription;
  recordingTimeSubscription: Subscription;
  recordedOutputSubscription: Subscription;
  recordedData = [];
  doneRecording = false;
  lastPrompt = false;

  ngOnInit(): void {
    this.stateManager.sendToCurrentIfAlreadyCompleted('syncvoice');
    this.promptNumber = this.stateManager.assessments['syncvoice'][
      'prompt_number'
    ];
    if (this.promptNumber + 1 === this.audioNames.length) {
      this.lastPrompt = true;
      this.stateManager.textOnInnerAssessmentButton =
        'FINISH ASSESSMENT AND ADVANCE';
    }
  }

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
    clearInterval(this.intervalCountdown);
    clearTimeout(this.intervalCountup);
  }

  calculateAudioFilePaths(): void {
    for (let i = 0; i < this.audioNames.length; i++) {
      this.audioNames[i] = this.lalaLocations + this.audioNames[i];
    }
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
        prompt_number: this.promptNumber,
        recorded_data: currentRecordedBlobAsBase64
      }); // KRM: Adding recording to the array is done in sync. Currently wait for the recording to load.
      // Might be btter to do this async so we don't have the chance of blocking for a short
      // period before moving to the next prompt.
      this.pushAudioData();
      this.promptNumber++;
    };
  }

  nextLalaPrompt(): void {
    if (this.promptNumber < this.audioNames.length) {
      if (this.promptNumber + 1 === this.audioNames.length) {
        this.lastPrompt = true;
        this.stateManager.textOnInnerAssessmentButton =
          'FINISH ASSESSMENT AND ADVANCE';
      }
      this.stateManager.showInnerAssessmentButton = false;
      const audio = new Audio();
      audio.src = this.audioNames[this.promptNumber];
      audio.addEventListener('ended', () => {
        this.startDisplayedCountdownTimer(() => this.startRecording());
        this.playingAudio = false;
      });
      audio.onplaying = (ev: Event): any => (this.playingAudio = true);
      audio.play();
    } else {
      this.finishAssessment();
    }
  }

  pushAudioData(): void {
    const assessmentData = {
      assess_name: 'syncvoice',
      data: { recorded_data: this.recordedData },
      completed: this.lastPrompt
    };
    const assessmentGoogleData = {
      assess_name: 'syncvoice',
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

  // finishAssessment(): void {
  //   this.stateManager.finishThisAssessmentAndAdvance('syncvoice');
  // }
  // canDeactivate(): boolean {
  //   return this.dialogService.canRedirect();
  // }
}
