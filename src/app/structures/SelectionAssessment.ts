import { BaseAssessment } from './BaseAssessment';
import { StateManagerService } from '../services/state-manager.service';
import { DialogService } from '../services/dialog.service';
import { AssessmentDataService } from '../services/assessment-data.service';

export class SelectionAssessment extends BaseAssessment {
  promptNumber = 0;
  selectionData = [];
  lastPrompt = false;
  promptsLength: number;

  constructor(
    public stateManager: StateManagerService,
    public dialogService: DialogService,
    public dataService: AssessmentDataService
  ) {
    super(stateManager, dialogService);
  }

  sendImageSelectionAndAdvance(
    image: string,
    intermediateFunction: Function,
    advanceCallBack: Function
  ): void {
    this.selectionData.push({
      prompt_number: this.promptNumber,
      image_selected: image.split('/').slice(-1)[0]
    });
    this.pushSelectionData();
    this.promptNumber++;
    intermediateFunction();
    if (this.lastPrompt) {
      this.stateManager.showInnerAssessmentButton = true;
    } else {
      advanceCallBack();
    }
  }

  pushSelectionData(): void {
    const assessmentData = {
      assess_name: this.assessmentName,
      data: { selection_data: this.selectionData },
      completed: this.lastPrompt
    };
    const assessmentGoogleData = {
      assess_name: this.assessmentName,
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

  advanceToNextPrompt(
    afterAdvanceCallBack: Function,
    beforeAdvanceCall?: Function
  ): void {
    if (this.promptNumber < this.promptsLength) {
      if (this.promptNumber + 1 === this.promptsLength) {
        this.lastPrompt = true;
        this.stateManager.textOnInnerAssessmentButton =
          'FINISH ASSESSMENT AND ADVANCE';
      }
      if (beforeAdvanceCall) { // KRM: This call must return a promise
        beforeAdvanceCall().then(() => {
          this.startDisplayedCountdownTimer(() => afterAdvanceCallBack());
        });
      } else {
        this.startDisplayedCountdownTimer(() => afterAdvanceCallBack());
      }
    } else {
      this.finishAssessment();
    }
  }
}
