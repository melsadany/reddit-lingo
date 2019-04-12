import { Component, OnInit, OnDestroy } from '@angular/core';
import { AudioRecordingService } from '../../../services/audio-recording.service';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import { StateManagerService } from '../../../services/state-manager.service';
import { AudioAssessment } from '../../../structures/AudioAssessment';
import letterData from '../../../../assets/in_use/data/wordfinding/lettermappings.json';

@Component({
  selector: 'app-wordfinding',
  templateUrl: './wordfinding.component.html',
  styleUrls: ['./wordfinding.component.scss']
})
export class WordfindingComponent extends AudioAssessment
  implements OnInit, OnDestroy {
  assessmentName = 'wordfinding';
  showLetter = false;
  currentLetter = '';
  constructor(
    public stateManager: StateManagerService,
    public audioRecordingService: AudioRecordingService,
    public dataService: AssessmentDataService
  ) {
    super(stateManager, audioRecordingService, dataService);
    this.promptsLength = Object.keys(letterData).length;
  }

  setStateAndStart(): void {
    this.stateManager.showInnerAssessmentButton = false;
    this.stateManager.textOnInnerAssessmentButton = 'CONTINUE ASSESSMENT';
    this.stateManager.isInAssessment = true;
    this.advance();
  }

  calculateNextLetter(): void {
    const currentChoices = letterData[this.promptNumber]['letters'];
    this.currentLetter =
      currentChoices[Math.floor(Math.random() * currentChoices.length)];
  }

  advance(): void {
    this.stateManager.showInnerAssessmentButton = false;
    this.advanceToNextPrompt(
      () => {
        this.showLetter = true;
        this.startRecording(30000, () => {
          this.showLetter = false;
        });
      },
      () => {
        return new Promise(
          (resolve, reject): void => {
            this.calculateNextLetter();
            resolve('done');
          }
        );
      }
    );
  }
}
