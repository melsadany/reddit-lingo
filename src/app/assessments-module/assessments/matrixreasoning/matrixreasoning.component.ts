import { Component, OnInit, OnDestroy } from '@angular/core';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import { DialogService } from '../../../services/dialog.service';
import { CanComponentDeactivate } from '../../../guards/can-deactivate.guard';
import { StateManagerService } from '../../../services/state-manager.service';
import { BaseAssessment } from '../../../structures/BaseAssessment';

@Component({
  selector: 'app-matrixreasoning',
  templateUrl: './matrixreasoning.component.html',
  styleUrls: ['./matrixreasoning.component.scss']
})
export class MatrixreasoningComponent
  extends BaseAssessment
  implements OnInit, CanComponentDeactivate, OnDestroy {
  imagesLocation = 'assets/img/matrixreasoning/';
  dimensions = {
    frameSets: {
      0: {
        height: 2,
        width: 2,
        images: 4
      },
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
        height: 7,
        width: 1,
        images: 7
      },
      6: {
        height: 1,
        width: 1,
        images: 1
      }
    },
    solutionSets: {
      0: {
        height: 4,
        width: 1,
        images: 4
      },
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
      }
    }
  };
  assessmentName = 'matrixreasoning';
  promptNumber = 0;
  imageMatrices = {
    frameSets: {},
    solutionSets: {}
  };
  showMatrix = false;
  selectionData = [];
  lastPrompt = false;

  constructor(
    public stateManager: StateManagerService,
    private dataService: AssessmentDataService,
    public dialogService: DialogService
  ) {
    super(stateManager, dialogService);
  }

  ngOnInit(): void {
    this.stateManager.sendToCurrentIfAlreadyCompleted('matrixreasoning');
    this.promptNumber = this.stateManager.assessments['matrixreasoning'][
      'prompt_number'
    ];
    if (this.promptNumber + 1 === 7) {
      this.lastPrompt = true;
      this.stateManager.textOnInnerAssessmentButton =
        'FINISH ASSESSMENT AND ADVANCE';
    }
    this.calculateImageNames();
    console.log(this.imageMatrices);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalCountdown);
  }

  setStateAndStart(): void {
    this.stateManager.showInnerAssessmentButton = false;
    this.stateManager.textOnInnerAssessmentButton = 'CONTINUE ASSESSMENT';
    this.stateManager.isInAssessment = true;
    this.advanceToNextPrompt();
  }

  calculateImageNames(): void {
    this.calculateFrameSets();
    this.calculateSolutionSets();
  }

  calculateFrameSets(): void {
    for (let i = 0; i <= 6; i++) {
      // KRM: Prompt number
      let currentRow: string[] = [];
      let currentMatrix: string[][] = [];
      const questionWidth = this.dimensions['frameSets'][i]['width'];
      for (let j = 0; j < this.dimensions['frameSets'][i]['images']; j++) {
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
    for (let i = 0; i <= 6; i++) {
      // KRM: Prompt number
      let currentRow: string[] = [];
      let currentMatrix: string[][] = [];
      const questionHeight = this.dimensions['solutionSets'][i]['height'];
      for (let j = 0; j < this.dimensions['solutionSets'][i]['images']; j++) {
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

  advanceToNextPrompt(): void {
    if (this.promptNumber < 7) {
      if (this.promptNumber + 1 === 7) {
        this.lastPrompt = true;
        this.stateManager.textOnInnerAssessmentButton =
          'FINISH ASSESSMENT AND ADVANCE';
      }
      this.startDisplayedCountdownTimer(() => this.showMatrix = true);
    } else {
      this.finishAssessment();
    }
  }

  selectImage(image: string): void {
    this.selectionData.push({
      prompt_number: this.promptNumber,
      image_selected: image
    });
    this.pushSelectionData();
    this.promptNumber++;
    this.showMatrix = false;
    if (this.lastPrompt) {
      this.stateManager.showInnerAssessmentButton = true;
    } else {
      this.advanceToNextPrompt();
    }
  }

  pushSelectionData(): void {
    const assessmentData = {
      assess_name: 'matrixreasoning',
      data: { selection_data: this.selectionData },
      completed: this.lastPrompt
    };
    const assessmentGoogleData = {
      assess_name: 'matrixreasoning',
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
  //   this.stateManager.finishThisAssessmentAndAdvance('matrixreasoning');
  // }

  // canDeactivate(): boolean {
  //   return this.dialogService.canRedirect();
  // }
}
