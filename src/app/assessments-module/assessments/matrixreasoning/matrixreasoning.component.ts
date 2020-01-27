import { Component } from '@angular/core';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import { StateManagerService } from '../../../services/state-manager.service';
import { SelectionAssessment } from '../../../structures/SelectionAssessment';
import { AssetsObject } from '../../../structures/AssessmentDataStructures';

@Component({
  selector: 'app-matrixreasoning',
  templateUrl: './matrixreasoning.component.html',
  styleUrls: ['./matrixreasoning.component.scss']
})
export class MatrixreasoningComponent extends SelectionAssessment {
  imagesLocation = 'assets/in_use/img/matrixreasoning/';
  assessmentName = 'matrixreasoning';
  imagePromptStructure: Object;
  showMatrix = false;
  promptsLength: number;
  countUpTimer: NodeJS.Timeout;


  constructor(
    public stateManager: StateManagerService,
    public dataService: AssessmentDataService
  ) {
    super(stateManager, dataService);
    this.configureAssessmentSettings();
    this.waitToDeterminePromptsToDo=true;
    this.dataService
      .getAssets('img', this.assessmentName)
      .subscribe((value: AssetsObject) => {
        this.promptsLength = value.assetsLength;
        this.imagePromptStructure = value.promptStructure;
        this.calculateFrameSets();
        this.calculateSolutionSets();
        this.determinePromptsToDo();
      });
    
  }
  
  setStateAndStart(): void {
    this.stateManager.showInnerAssessmentButton = false;
    this.stateManager.textOnInnerAssessmentButton = 'CONTINUE ASSESSMENT';
    this.stateManager.isInAssessment = true;
    this.advance();
  }

  startTimer(): void {
    this.countUpTimer = setInterval(() => {
      this.timeToSelect = this.timeToSelect + 10;
    }, 10);
  }

  stopTimer(): void {
    clearInterval(this.countUpTimer);
  }

  advance(): void {
    this.stateManager.showStartParagraph=false;
    this.advanceToNextPrompt(() => {
      this.showMatrix = true;
      this.startTimer();
    });
  }

  calculateFrameSets(): void {
    for (const prompt of Object.keys(this.imagePromptStructure['frameSets'])) {
      const halfArrayLength = Math.ceil(
        this.imagePromptStructure['frameSets'][prompt].length / 2
      );
      const newArray = [
        this.imagePromptStructure['frameSets'][prompt].slice(
          0,
          halfArrayLength
        ),
        this.imagePromptStructure['frameSets'][prompt].slice(halfArrayLength)
      ];
      this.imagePromptStructure['frameSets'][prompt] = newArray;
    }
  }

  calculateSolutionSets(): void {
    for (const prompt of Object.keys(this.imagePromptStructure['solutionSets'])) {
      const halfArrayLength = Math.ceil(
        this.imagePromptStructure['solutionSets'][prompt].length / 2
      );
      const newArray = [
        this.imagePromptStructure['solutionSets'][prompt].slice(
          0,
          halfArrayLength
        ),
        this.imagePromptStructure['solutionSets'][prompt].slice(halfArrayLength)
      ];
      this.imagePromptStructure['solutionSets'][prompt] = newArray;
    }
  }

  clickImage(image: string): void {
    this.sendImageSelectionAndAdvance(
      image,
      () => {
        this.showMatrix = false;
        this.stopTimer();
      },
      () =>
        this.advanceToNextPrompt(() => {
          this.showMatrix = true;
          this.startTimer();
        })
    );
  }
}
