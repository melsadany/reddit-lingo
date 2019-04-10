import { Component, OnInit, OnDestroy } from '@angular/core';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import { AudioRecordingService } from '../../../services/audio-recording.service';
import { DialogService } from '../../../services/dialog.service';
import { CanComponentDeactivate } from '../../../guards/can-deactivate.guard';
import { StateManagerService } from '../../../services/state-manager.service';
import { AudioAssessment } from '../../../structures/AudioAssessment';
import { HttpClient } from '@angular/common/http';
import { AssetsObject } from '../../../structures/AssessmentDataStructures';

@Component({
  selector: 'app-pictureprompt',
  templateUrl: './pictureprompt.component.html',
  styleUrls: ['./pictureprompt.component.scss']
})
export class PicturepromptComponent extends AudioAssessment
  implements OnInit, OnDestroy, CanComponentDeactivate {
  assessmentName = 'pictureprompt';
  showPromptImage = false;
  currentImagePrompt = '';
  audioPromptStructure: Object;

  constructor(
    public stateManager: StateManagerService,
    public dataService: AssessmentDataService,
    public audioRecordingService: AudioRecordingService,
    public dialogService: DialogService,
    public http: HttpClient
  ) {
    super(stateManager, audioRecordingService, dataService, dialogService);
    this.dataService
      .getAssets('img', this.assessmentName)
      .subscribe((value: AssetsObject) => {
        this.promptsLength = value.assetsLength;
        this.audioPromptStructure = value.promptStructure;
        console.log(this.audioPromptStructure);
      });
  }

  setStateAndStart(): void {
    this.stateManager.showInnerAssessmentButton = false;
    this.stateManager.textOnInnerAssessmentButton = 'CONTINUE ASSESSMENT';
    this.stateManager.isInAssessment = true;
    this.advance();
  }

  getNextImagePath(): void {
    this.currentImagePrompt = this.audioPromptStructure[this.promptNumber][0];
  }

  advance(): void {
    this.advanceToNextPrompt(
      () => {
        this.showPromptImage = true;
        this.startRecording(30000, () => {
          this.showPromptImage = false;
          this.stateManager.showInnerAssessmentButton = true;
        });
      },
      () => {
        return new Promise(
          (resolve, reject): void => {
            this.stateManager.showInnerAssessmentButton = false;
            this.getNextImagePath();
            resolve('done');
          }
        );
      }
    );
  }
}
