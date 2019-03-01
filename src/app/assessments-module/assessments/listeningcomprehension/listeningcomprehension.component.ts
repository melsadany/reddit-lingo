import { Component, OnInit, OnDestroy } from '@angular/core';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import { DialogService } from '../../../services/dialog.service';
import { CanComponentDeactivate } from '../../../guards/can-deactivate.guard';
import { StateManagerService } from '../../../services/state-manager.service';
import { BaseAssessment } from '../../../structures/BaseAssessment';

@Component({
  selector: 'app-listeningcomprehension',
  templateUrl: './listeningcomprehension.component.html',
  styleUrls: ['./listeningcomprehension.component.scss']
})
export class ListeningcomprehensionComponent
  extends BaseAssessment
  implements OnInit, OnDestroy, CanComponentDeactivate {
  assessmentName = 'listeningcomprehension';
  showImage = false;
  imagePaths: string[][];
  promptNumber = 0;
  imagesLocation = 'assets/img/listeningcomprehension/';
  audioInstructionsLocation = 'assets/audio/listeningcomprehension/';
  selectionData = [];
  lastPrompt = false;
  playingAudio = false;

  constructor(
    private dataService: AssessmentDataService,
    public stateManager: StateManagerService,
    public dialogService: DialogService
  ) {
    super(stateManager, dialogService);
  }

  ngOnInit(): void {
    this.stateManager.sendToCurrentIfAlreadyCompleted('listeningcomprehension');
    this.promptNumber = this.stateManager.assessments['listeningcomprehension'][
      'prompt_number'
    ];
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalCountdown);
  }

  setStateAndStart(): void {
    this.stateManager.showInnerAssessmentButton = false;
    this.stateManager.textOnInnerAssessmentButton = 'CONTINUE ASSESSMENT';
    this.stateManager.isInAssessment = true;
    this.calculateImageNames();
    this.startAudioInstructionForSet();
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
    console.log(image);
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
    audio.addEventListener('ended', () => {
      this.startDisplayedCountdownTimer(() => this.showImage = true);
      this.playingAudio = false;
    });
    audio.onplaying = (ev: Event): any => (this.playingAudio = true);
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

  // finishAssessment(): void {
  //   this.stateManager.finishThisAssessmentAndAdvance('listeningcomprehension');
  // }

  // canDeactivate(): boolean {
  //   return this.dialogService.canRedirect();
  // }
}
