import { Component } from '@angular/core';
import { AssessmentDataService } from '../../../services/assessment-data.service';
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
  playingAudio = false;
  audioPromptStructure: {};
  imgsPromptStructure: {};

  constructor(
    public dataService: AssessmentDataService,
    public stateManager: StateManagerService
  ) {
    super(stateManager, dataService);
    this.dataService
      .getAssets('audio', this.assessmentName)
      .subscribe((value: AssetsObject) => {
        this.promptsLength = value.assetsLength;
        this.audioPromptStructure = value.promptStructure;
        this.audioInstruction = value.audioInstruction;
        this.playInstructions();
      });
    this.dataService
      .getAssets('img', this.assessmentName)
      .subscribe((value: AssetsObject) => {
        this.imgsPromptStructure = value.promptStructure;
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
    console.log(this.imgsPromptStructure);
    this.imagePaths = [];
    const firstRow: string[] = [];
    const secondRow: string[] = [];
    const thirdRow: string[] = [];
    for (let i = 0; i < 2; i++) {
      firstRow.push(this.imgsPromptStructure[this.promptNumber][i]);
      // firstRow.push(`${this.imagesLocation}${i}a_q${this.promptNumber}.png`);
    }
    for (let i = 3; i < 5; i++) {
      secondRow.push(this.imgsPromptStructure[this.promptNumber][i]);
      // secondRow.push(`${this.imagesLocation}${i}a_q${this.promptNumber}.png`);
    }
    for (let i = 6; i < 8; i++) {
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
