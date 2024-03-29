import { Component } from '@angular/core';
import { AudioRecordingService } from '../../../services/audio-recording.service';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import { StateManagerService } from '../../../services/state-manager.service';
import { AudioAssessment } from '../../../structures/AudioAssessment';
import { AssetsObject } from '../../../structures/AssessmentDataStructures';

@Component({
  selector: 'app-ran',
  templateUrl: './ran.component.html',
  styleUrls: ['./ran.component.scss']
})
export class RanComponent extends AudioAssessment {
  assessmentName = 'ran';
  currentImagePrompt = '';
  showImage = false;
  audioPromptStructure: Object;
  constructor(
    public stateManager: StateManagerService,
    public audioRecordingService: AudioRecordingService,
    public dataService: AssessmentDataService
  ) {
    super(stateManager, audioRecordingService, dataService);
    this.configureAssessmentSettings();
    this.waitToDeterminePromptsToDo=true;
    this.dataService
      .getAssets('img', this.assessmentName)
      .subscribe((value: AssetsObject) => {
        this.promptsLength = value.assetsLength;
        this.audioPromptStructure = value.promptStructure;
        this.determinePromptsToDo();
      });
  }

  setStateAndStart(): void {
    this.stateManager.showAssessmentFrontPage=false;
    this.stateManager.showInnerAssessmentButton = false;
    this.stateManager.textOnInnerAssessmentButton = 'CONTINUE ASSESSMENT';
    this.stateManager.isInAssessment = true;
    this.showExample = false;
    this.advance();
  }

  advance(): void {
    this.stateManager.showAssessmentFrontPage=false;
    this.advanceToNextPrompt(
      () => {
        this.showImage = true;
        this.startRecording(30000, () => {
          this.showImage = false;
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

  stopEarly(): void {
    this.stopRecording(() => {
      this.showImage = false;
      this.stateManager.showInnerAssessmentButton = true;
    });
  }

  getNextImagePath(): void {
    this.currentImagePrompt = this.audioPromptStructure[this.promptNumber][0];
    this.dataTitle=this.audioPromptStructure[this.promptNumber][0];
  }
}
