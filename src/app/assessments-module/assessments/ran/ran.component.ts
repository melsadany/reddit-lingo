import { Component, OnInit, OnDestroy } from '@angular/core';
import { AudioRecordingService } from '../../../services/audio-recording.service';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import { DialogService } from '../../../services/dialog.service';
import { CanComponentDeactivate } from '../../../guards/can-deactivate.guard';
import { StateManagerService } from '../../../services/state-manager.service';
import { AudioAssessment } from '../../../structures/AudioAssessment';

@Component({
  selector: 'app-ran',
  templateUrl: './ran.component.html',
  styleUrls: ['./ran.component.scss']
})
export class RanComponent extends AudioAssessment
  implements OnInit, OnDestroy, CanComponentDeactivate {
  assessmentName = 'ran';
  showImage = false;
  promptsLength = 1; // KRM: Only one prompt here but still want the button text to update at the end
                    // and not too early before the assessment has been taken
  constructor(
    public stateManager: StateManagerService,
    public audioRecordingService: AudioRecordingService,
    public dataService: AssessmentDataService,
    public dialogService: DialogService
  ) {
    super(stateManager, audioRecordingService, dataService, dialogService);
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
  //     this.showImage = false;
  //     this.completed = true;
  //     this.stateManager.showInnerAssessmentButton = true;
  //     clearTimeout(this.intervalCountup);
  //   }
  // }

  // ngOnDestroy(): void {
  //   this.abortRecording();
  //   this.failSubscription.unsubscribe();
  //   this.recordingTimeSubscription.unsubscribe();
  //   this.recordedOutputSubscription.unsubscribe();
  //   clearInterval(this.intervalCountdown);
  //   clearTimeout(this.intervalCountup);
  // }

  // ngOnInit(): void {
  //   this.stateManager.sendToCurrentIfAlreadyCompleted('ran');
  // }

  setStateAndStart(): void {
    this.stateManager.showInnerAssessmentButton = false;
    // this.stateManager.textOnInnerAssessmentButton =
    //   'FINISH ASSESSMENT AND ADVANCE';
    this.stateManager.isInAssessment = true;
    this.advance();
    // this.startDisplayedCountdownTimer(() => {
    //   this.showImage = true;
    //   this.startRecording();
    // });
  }

  advance(): void {
    this.advanceToNextPrompt(() => {
      this.showImage = true;
      this.startRecording(30000, () => {
        this.showImage = false;
        this.stateManager.showInnerAssessmentButton = true;
      });
    });
  }

  stopEarly(): void {
    this.stopRecording(() => {
      this.showImage = false;
      this.stateManager.showInnerAssessmentButton = true;
    });
  }

  // handleRecordedOutput(data: RecordedAudioOutput): void {
  //   this.recordedBlob = data.blob;
  //   const reader: FileReader = new FileReader();
  //   reader.readAsDataURL(this.recordedBlob);
  //   reader.onloadend = (): any => {
  //     this.recordedBlobAsBase64 = reader.result.slice(22);
  //     this.dataService
  //       .postAssessmentDataToFileSystem(
  //         {
  //           assess_name: 'ran',
  //           data: { recorded_data: this.recordedBlobAsBase64 },
  //           completed: true
  //         },
  //         {
  //           assess_name: 'ran',
  //           data: {
  //             text: 'Fake speech to text'
  //           }
  //         }
  //       )
  //       .subscribe(); // KRN: Fix how this output is handled to be updated like other assessments
  //   };
  // }

  // finishAssessment(): void {
  //   this.stateManager.finishThisAssessmentAndAdvance('ran');
  // }

  // canDeactivate(): boolean {
  //   return this.dialogService.canRedirect();
  // }
}
