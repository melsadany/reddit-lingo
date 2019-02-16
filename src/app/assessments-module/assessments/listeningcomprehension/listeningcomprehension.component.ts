import { Component, OnInit, OnDestroy } from '@angular/core';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import { DialogService } from '../../../services/dialog.service';
import { CanComponentDeactivate } from '../../../guards/can-deactivate.guard';
import { StateManagerService } from '../../../services/state-manager.service';

@Component({
  selector: 'app-listeningcomprehension',
  templateUrl: './listeningcomprehension.component.html',
  styleUrls: ['./listeningcomprehension.component.scss']
})
export class ListeningcomprehensionComponent
  implements OnInit, OnDestroy, CanComponentDeactivate {
  countingDown = false;
  intervalCountdown: NodeJS.Timeout;
  timeLeft = 3;
  doneCountingDown = false;
  showImage = false;
  imagePaths: string[][];
  promptNumber = 0;
  imagesLocation = 'assets/img/listeningcomprehension/';
  audioInstructionsLocation = 'assets/audio/listeningcomprehension/';
  selectionData = [];
  lastPrompt = false;

  constructor(
    private dataService: AssessmentDataService,
    public stateManager: StateManagerService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.stateManager.showOutsideAssessmentButton = false;
    for (const assessmentRecord of this.stateManager.assessments) {
      if (assessmentRecord['assess_name'] === 'sentencerepetition') {
        this.promptNumber = assessmentRecord['prompt_number'];
      }
    }
  }

  ngOnDestroy(): void {}

  setStateAndStart(): void {
    this.stateManager.showInnerAssessmentButton = false;
    this.stateManager.textOnInnerAssessmentButton = 'CONTINUE ASSESSMENT';
    this.stateManager.isInAssessment = true;
    this.calculateImageNames();
    this.startAudioInstructionForSet();
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
        clearInterval(this.intervalCountdown);
      }
    }, 1000);
  }

  calculateImageNames(): void {
    this.imagePaths = [];
    this.imagesLocation = `assets/img/listeningcomprehension/${
      this.promptNumber
    }/image/`;
    const firstRow: string[] = [];
    const secondRow: string[] = [];
    const thirdRow: string[] = [];
    for (let i = 1; i <= 3; i++) {
      firstRow.push(`${this.imagesLocation}${i}a_q${this.promptNumber}.png`);
    }
    for (let i = 4; i <= 6; i++) {
      secondRow.push(`${this.imagesLocation}${i}a_q${this.promptNumber}.png`);
    }
    for (let i = 7; i <= 9; i++) {
      thirdRow.push(`${this.imagesLocation}${i}a_q${this.promptNumber}.png`);
    }
    this.imagePaths.push(firstRow, secondRow, thirdRow);
  }

  selectImage(image: string): void {
    const delimited = image.split('/');
    const image_name = delimited[delimited.length - 1];
    this.selectionData.push({
      prompt_number: this.promptNumber,
      image_selected: image_name
    });
    this.pushSelectionData();
    this.promptNumber++;
    this.showImage = false;
    if (this.promptNumber < 12) {
      if (this.promptNumber + 1 === 12) {
        this.lastPrompt = true;
      }
      this.nextImageSet();
    } else {
      this.finishAssessment();
    }
  }

  nextImageSet(): void {
    this.calculateImageNames();
    this.startAudioInstructionForSet();
  }

  startAudioInstructionForSet(): void {
    // KRM: Main function
    const audio = new Audio();
    audio.src = `${this.audioInstructionsLocation}q${this.promptNumber}.mp3`;
    audio.addEventListener('ended', () => this.startDisplayedCountdownTimer());
    audio.play();
  }

  pushSelectionData(): void {
    const assessmentData = {
      assess_name: 'listeningcomprehension',
      data: { selection_data: this.selectionData },
      completed: this.lastPrompt
    };
    const assessmentGoogleData = {
      assess_name: 'listeningcomprehension',
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
    this.selectionData = [];
  }

  finishAssessment(): void {
    this.stateManager.finishThisAssessmentAndAdvance('listeningcomprehension');
  }

  canDeactivate(): boolean {
    return this.dialogService.canRedirect();
  }
}
