import { Component, OnInit, OnDestroy } from '@angular/core';
import { AudioRecordingService } from '../../../services/audio-recording.service';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import { DialogService } from '../../../services/dialog.service';
import { CanComponentDeactivate } from '../../../guards/can-deactivate.guard';
import { StateManagerService } from '../../../services/state-manager.service';
import { AudioAssessment } from '../../../structures/AudioAssessment';

@Component({
  selector: 'app-wordfinding',
  templateUrl: './wordfinding.component.html',
  styleUrls: ['./wordfinding.component.scss']
})
export class WordfindingComponent extends AudioAssessment
  implements OnInit, OnDestroy, CanComponentDeactivate {
  assessmentName = 'wordfinding';
  showLetter = false;
  currentLetter = '';
  letterData = [
    {
      char: 'A',
      chars: ['R', 'D', 'A', 'M', 'B', 'P', 'C', 'S'],
      type: 'Most Frequent'
    },
    {
      char: 'B',
      chars: ['L', 'G', 'I', 'H', 'E', 'F', 'T'],
      type: 'Medium Frequency'
    },
    {
      char: 'C',
      chars: ['K', 'J', 'V', 'U', 'N', 'O', 'W'],
      type: 'Least Frequent'
    }
  ];
  promptsLength = this.letterData.length;
  constructor(
    public stateManager: StateManagerService,
    public audioRecordingService: AudioRecordingService,
    public dataService: AssessmentDataService,
    public dialogService: DialogService
  ) {
    super(stateManager, audioRecordingService, dataService, dialogService);
  }

  setStateAndStart(): void {
    this.stateManager.showInnerAssessmentButton = false;
    this.stateManager.textOnInnerAssessmentButton = 'CONTINUE ASSESSMENT';
    this.stateManager.isInAssessment = true;
    this.advance();
  }

  calculateNextLetter(): void {
    const currentChoices = this.letterData[this.promptNumber]['chars'];
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
