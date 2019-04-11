import { Component, OnInit, OnDestroy } from '@angular/core';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import { DialogService } from '../../../services/dialog.service';
import { StateManagerService } from '../../../services/state-manager.service';
import { SelectionAssessment } from '../../../structures/SelectionAssessment';
import { AssetsObject } from '../../../structures/AssessmentDataStructures';

@Component({
  selector: 'app-listeningcomprehension',
  templateUrl: './listeningcomprehension.component.html',
  styleUrls: ['./listeningcomprehension.component.scss']
})
export class ListeningcomprehensionComponent extends SelectionAssessment {
  assessmentName = 'listeningcomprehension';
  showImage = false;
  imagePaths: string[][];
  // imagesLocation = 'assets/in_use/img/listeningcomprehension/';
  // audioInstructionsLocation = 'assets/in_use/audio/listeningcomprehension/';
  playingAudio = false;
  promptsLength: number;
  audioPromptStructure: {};
  imgsPromptStructure: {};

  constructor(
    public dataService: AssessmentDataService,
    public stateManager: StateManagerService,
    public dialogService: DialogService
  ) {
    super(stateManager, dialogService, dataService);
    this.dataService
      .getAssets('audio', this.assessmentName)
      .subscribe((value: AssetsObject) => {
        this.promptsLength = value.assetsLength;
        this.audioPromptStructure = value.promptStructure;
        console.log(this.audioPromptStructure);
      });
    this.dataService
      .getAssets('img', this.assessmentName)
      .subscribe((value: AssetsObject) => {
        this.imgsPromptStructure = value.promptStructure;
        console.log(this.imgsPromptStructure);
      });
  }

  setStateAndStart(): void {
    this.stateManager.showInnerAssessmentButton = false;
    this.stateManager.textOnInnerAssessmentButton = 'CONTINUE ASSESSMENT';
    this.stateManager.isInAssessment = true;
    this.advance();
  }

  setupPrompt(): HTMLAudioElement {
    this.calculateImageNames();
    const audio = new Audio();
    // audio.src = `${this.audioInstructionsLocation}q${this.promptNumber}.mp3`;
    audio.src = this.audioPromptStructure[this.promptNumber][0];
    audio.onplaying = (ev: Event): any => (this.playingAudio = true);
    return audio;
  }

  calculateImageNames(): void {
    this.imagePaths = [];
    const firstRow: string[] = [];
    const secondRow: string[] = [];
    const thirdRow: string[] = [];
    for (let i = 1; i <= 3; i++) {
      firstRow.push(this.imgsPromptStructure[this.promptNumber][i]);
      // firstRow.push(`${this.imagesLocation}${i}a_q${this.promptNumber}.png`);
    }
    for (let i = 4; i <= 6; i++) {
      secondRow.push(this.imgsPromptStructure[this.promptNumber][i]);
      // secondRow.push(`${this.imagesLocation}${i}a_q${this.promptNumber}.png`);
    }
    for (let i = 7; i <= 9; i++) {
      thirdRow.push(this.imgsPromptStructure[this.promptNumber][i]);
      // thirdRow.push(`${this.imagesLocation}${i}a_q${this.promptNumber}.png`);
    }
    this.imagePaths.push(firstRow, secondRow, thirdRow);
  }

  clickImage(image: string): void {
    this.sendImageSelectionAndAdvance(
      image,
      () => (this.showImage = false),
      () => this.advance()
    );
  }

  advance(): void {
    this.advanceToNextPrompt(
      () => (this.showImage = true),
      () => {
        const audio = this.setupPrompt();
        audio.play();
        return new Promise(
          (resolve, reject): void => {
            audio.addEventListener('ended', () => {
              this.playingAudio = false;
              resolve('done');
            });
          }
        );
      }
    );
  }
}
