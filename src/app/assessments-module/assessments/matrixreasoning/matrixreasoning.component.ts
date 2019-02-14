import { Component, OnInit, OnDestroy } from '@angular/core';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import { DialogService } from '../../../services/dialog.service';
import { CanComponentDeactivate } from '../../../guards/can-deactivate.guard';
import { StateManagerService } from '../../../services/state-manager.service';

@Component({
  selector: 'app-matrixreasoning',
  templateUrl: './matrixreasoning.component.html',
  styleUrls: ['./matrixreasoning.component.scss']
})
export class MatrixreasoningComponent
  implements OnInit, CanComponentDeactivate {
  imagesLocation = 'assets/img/matrixreasoning/';
  imageTypes = ['frameSets', 'solutionSets'];
  dimensions = {
    frameSets: {
      1: {
        height: 2,
        width: 2,
        images: 4
      },
      2: {
        height: 2,
        width: 2,
        images: 4
      },
      3: {
        height: 2,
        width: 2,
        images: 4
      },
      4: {
        height: 2,
        width: 2,
        images: 4
      },
      5: {
        height: 2,
        width: 2,
        images: 4
      },
      6: {
        height: 7,
        width: 1,
        images: 7
      },
      7: {
        height: 1,
        width: 1,
        images: 1
      }
    },
    solutionSets: {
      1: {
        height: 4,
        width: 1,
        images: 4
      },
      2: {
        height: 4,
        width: 1,
        images: 4
      },
      3: {
        height: 4,
        width: 1,
        images: 4
      },
      4: {
        height: 4,
        width: 1,
        images: 4
      },
      5: {
        height: 4,
        width: 1,
        images: 4
      },
      6: {
        height: 4,
        width: 1,
        images: 4
      },
      7: {
        height: 4,
        width: 1,
        images: 4
      }
    }
  };
  questionNumber = 1;
  imageMatrices = {
    frameSets: {},
    solutionSets: {}
  };
  countingDown = false;
  intervalCountdown: NodeJS.Timeout;
  timeLeft = 3;
  doneCountingDown = false;
  showMatrix = false;
  imageSelections = {};

  constructor(
    private stateManager: StateManagerService,
    private dataService: AssessmentDataService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {}

  setStateAndStart(): void {
    this.stateManager.showInnerAssessmentButton = false;
    this.stateManager.textOnInnerAssessmentButton = 'CONTINUE ASSESSMENT';
    this.stateManager.isInAssessment = true;
    this.calculateFrameSets();
    this.calculateSolutionSets();
    this.startDisplayedCountdownTimer();
  }

  calculateImageNames(): void {
    this.calculateFrameSets();
    this.calculateSolutionSets();
  }

  calculateFrameSets(): void {
    for (let i = 1; i <= 7; i++) {
      // KRM: Question number
      let currentRow: string[] = [];
      let currentMatrix: string[][] = [];
      const questionWidth = this.dimensions['frameSets'][i]['width'];
      for (let j = 1; j <= this.dimensions['frameSets'][i]['images']; j++) {
        // KRM: Image number
        const currentImage = `${
          this.imagesLocation
        }${i}/frameSets/${j}q_q${i}.png`;
        if (currentRow.length < questionWidth) {
          currentRow.push(currentImage);
        } else {
          currentMatrix.push(currentRow);
          currentRow = [currentImage];
        }
      }
      currentMatrix.push(currentRow);
      currentRow = [];
      this.imageMatrices['frameSets'][i] = currentMatrix;
      currentMatrix = [];
    }
  }

  calculateSolutionSets(): void {
    for (let i = 1; i <= 7; i++) {
      // KRM: Question number
      let currentRow: string[] = [];
      let currentMatrix: string[][] = [];
      const questionHeight = this.dimensions['solutionSets'][i]['height'];
      for (let j = 1; j <= this.dimensions['solutionSets'][i]['images']; j++) {
        // KRM: Image number
        const currentImage = `${
          this.imagesLocation
        }${i}/solutionSets/${j}a_q${i}.png`;
        if (currentRow.length < questionHeight) {
          currentRow.push(currentImage);
        } else {
          currentMatrix.push(currentRow);
          currentRow = [currentImage];
        }
      }
      currentMatrix.push(currentRow);
      currentRow = [];
      this.imageMatrices['solutionSets'][i] = currentMatrix;
      currentMatrix = [];
    }
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
        this.showMatrix = true;
        clearInterval(this.intervalCountdown);
      }
    }, 1000);
  }

  selectImage(image: string): void {
    this.showMatrix = false;
    this.imageSelections[this.questionNumber] = image;
    this.questionNumber++;
    if (this.questionNumber >= 8) {
      this.finishAssessment();
    } else {
      this.startDisplayedCountdownTimer();
    }
  }

  finishAssessment(): void {
    this.dataService
      .postAssessmentDataToFileSystem(
        {
          assess_name: 'matrixreasoning',
          data: { selection_data: this.imageSelections },
          completed: true
        },
        {
          assess_name: 'matrixreasoning',
          data: {
            text: 'none'
          }
        }
      )
      .subscribe();
    this.stateManager.finishThisAssessmentAndAdvance('matrixreasoning');
  }

  canDeactivate(): boolean {
    return this.dialogService.canRedirect();
  }
}
