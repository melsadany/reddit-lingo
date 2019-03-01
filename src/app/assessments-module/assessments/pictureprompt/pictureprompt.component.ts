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
import { AudioAssessment } from '../../../structures/AudioAssessment';

@Component({
  selector: 'app-pictureprompt',
  templateUrl: './pictureprompt.component.html',
  styleUrls: ['./pictureprompt.component.scss']
})
export class PicturepromptComponent extends AudioAssessment
  implements OnInit, OnDestroy, CanComponentDeactivate {
  assessmentName = 'pictureprompt';
  imageNames = [
    'assets/img/pictureprompt/0/despair.jpg',
    'assets/img/pictureprompt/1/he_texted.jpg',
    'assets/img/pictureprompt/2/joke.jpg',
    'assets/img/pictureprompt/3/antagonism.jpg'
  ];
  showPromptImage = false;
  currentImagePrompt = '';
  lastPrompt = false;

  constructor(
    public stateManager: StateManagerService,
    public dataService: AssessmentDataService,
    public audioRecordingService: AudioRecordingService,
    public dialogService: DialogService
  ) {
    super(stateManager, audioRecordingService, dataService, dialogService);
  }

  ngOnInit(): void {
    this.stateManager.sendToCurrentIfAlreadyCompleted('pictureprompt');
    this.promptNumber = this.stateManager.assessments['pictureprompt'][
      'prompt_number'
    ];
    if (this.promptNumber + 1 === this.imageNames.length) {
      this.lastPrompt = true;
      this.stateManager.textOnInnerAssessmentButton =
        'FINISH ASSESSMENT AND ADVANCE';
    }
  }

  setStateAndStart(): void {
    this.stateManager.showInnerAssessmentButton = false;
    this.stateManager.textOnInnerAssessmentButton = 'CONTINUE ASSESSMENT';
    this.stateManager.isInAssessment = true;
    this.advanceToNextPrompt();
  }

  ngOnDestroy(): void {
    this.abortRecording();
    this.failSubscription.unsubscribe();
    this.recordingTimeSubscription.unsubscribe();
    this.recordedOutputSubscription.unsubscribe();
    clearInterval(this.intervalCountdown);
    clearTimeout(this.intervalCountup);
  }

  getNextImagePath(): void {
    this.currentImagePrompt = this.imageNames[this.promptNumber];
  }

  // startRecording(): void {
  //   if (!this.isRecording) {
  //     this.isRecording = true;
  //     this.audioRecordingService.startRecording();
  //     this.intervalCountup = setTimeout(() => {
  //       this.stopRecording();
  //     }, 30000);
  //   }
  // }

  // abortRecording(): void {
  //   if (this.isRecording) {
  //     this.isRecording = false;
  //     this.audioRecordingService.abortRecording();
  //     this.doneRecording = true;
  //   }
  // }

  // stopRecording(): void {
  //   if (this.isRecording) {
  //     this.audioRecordingService.stopRecording();
  //     this.isRecording = false;
  //     this.doneRecording = true;
  //     this.showPromptImage = false;
  //     this.stateManager.showInnerAssessmentButton = true;
  //     clearTimeout(this.intervalCountup);
  //   }
  // }

  advanceToNextPrompt(): void {
    this.stateManager.showInnerAssessmentButton = false;
    if (this.promptNumber < this.imageNames.length) {
      if (this.promptNumber + 1 === this.imageNames.length) {
        this.lastPrompt = true;
        this.stateManager.textOnInnerAssessmentButton =
          'FINISH ASSESSMENT AND ADVANCE';
      }
      this.getNextImagePath();
      this.startDisplayedCountdownTimer(() => {
        this.showPromptImage = true;
        this.startRecording(30000, () => {
          this.showPromptImage = false;
          this.stateManager.showInnerAssessmentButton = true;
        });
      });
    } else {
      this.finishAssessment();
    }
  }

  // handleRecordedOutput(data: RecordedAudioOutput): void {
  //   const currentBlob = data.blob;
  //   const reader: FileReader = new FileReader();
  //   reader.readAsDataURL(currentBlob);
  //   reader.onloadend = (): any => {
  //     const currentRecordedBlobAsBase64 = reader.result.slice(22);
  //     this.recordedData.push({
  //       prompt_number: this.promptNumber, // KRM: this code doesn't get executed until after the promptNumber got incremented already
  //       recorded_data: currentRecordedBlobAsBase64
  //     }); // KRM: Adding recording to the array is done in sync. Currently wait for the recording to load.
  //     // Might be btter to do this async so we don't have the chance of blocking for a short
  //     // period before moving to the next prompt.
  //     this.pushAudioData();
  //     this.promptNumber++;
  //     // this.advanceToNextPrompt();
  //   };
  // }

  // finishAssessment(): void {
  //   this.stateManager.finishThisAssessmentAndAdvance('pictureprompt');
  // }

  // pushAudioData(): void {
  //   const assessmentData = {
  //     assess_name: 'pictureprompt',
  //     data: { recorded_data: this.recordedData },
  //     completed: this.lastPrompt
  //   };
  //   const assessmentGoogleData = {
  //     assess_name: 'pictureprompt',
  //     data: { text: 'None' }
  //   };
  //   if (this.promptNumber === 0) {
  //     this.dataService
  //       .postAssessmentDataToFileSystem(assessmentData, assessmentGoogleData)
  //       .subscribe();
  //   } else {
  //     this.dataService
  //       .postSingleAudioDataToMongo(assessmentData, assessmentGoogleData)
  //       .subscribe();
  //   }
  //   this.recordedData = [];
  // }

  // canDeactivate(): boolean {
  //   return this.dialogService.canRedirect();
  // }
}
